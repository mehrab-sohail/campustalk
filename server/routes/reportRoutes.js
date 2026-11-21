const express = require('express');
const Report = require('../models/Report');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { requireAuth, requireModerator } = require('../middleware/auth');

const router = express.Router();

function formatReport(report) {
  const json = report.toJSON();
  return {
    ...json,
    reporter: report.reporter ? { id: report.reporter._id.toString(), name: report.reporter.name } : null,
  };
}

router.post('/', requireAuth, async (req, res) => {
  const { targetType, targetId, reason } = req.body;

  if (targetType !== 'post' && targetType !== 'comment') {
    return res.status(400).json({ message: 'targetType must be "post" or "comment"' });
  }
  if (!reason || reason.length < 3 || reason.length > 300) {
    return res.status(400).json({ message: 'Invalid reason', errors: { reason: 'Reason must be 3 to 300 characters' } });
  }

  let postId, targetPreview;

  if (targetType === 'post') {
    const post = await Post.findById(targetId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    postId = post._id;
    targetPreview = post.body.slice(0, 100);
  } else {
    const comment = await Comment.findById(targetId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    postId = comment.post;
    targetPreview = comment.body.slice(0, 100);
  }

  const report = await Report.create({
    targetType,
    targetId,
    postId,
    targetPreview,
    reason,
    reporter: req.user._id,
  });
  await report.populate('reporter');

  res.status(201).json(formatReport(report));
});

router.get('/', requireAuth, requireModerator, async (req, res) => {
  const filter = {};
  if (req.query.status === 'open' || req.query.status === 'resolved') {
    filter.status = req.query.status;
  }
  const reports = await Report.find(filter).sort({ createdAt: -1 }).populate('reporter');
  res.json(reports.map(formatReport));
});

router.patch('/:id/hide', requireAuth, requireModerator, async (req, res) => {
  const report = await Report.findById(req.params.id).populate('reporter');
  if (!report) {
    return res.status(404).json({ message: 'Report not found' });
  }

  const Model = report.targetType === 'post' ? Post : Comment;
  await Model.findByIdAndUpdate(report.targetId, { hidden: true });

  report.targetHidden = true;
  await report.save();

  // TODO (Step 9 - Notifications): create a "moderation" notification
  // for the content's author here.

  res.json(formatReport(report));
});

// PATCH /api/reports/:id/resolve — moderator only
router.patch('/:id/resolve', requireAuth, requireModerator, async (req, res) => {
  const report = await Report.findById(req.params.id).populate('reporter');
  if (!report) {
    return res.status(404).json({ message: 'Report not found' });
  }

  report.status = 'resolved';
  await report.save();

  // TODO (Step 9 - Notifications): create a "moderation" notification
  // for the reporter here.

  res.json(formatReport(report));
});

module.exports = router;