const express = require('express');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function formatComment(comment) {
  const json = comment.toJSON();
  return {
    ...json,
    author: comment.author ? { id: comment.author._id.toString(), name: comment.author.name } : null,
  };
}

router.get('/posts/:id/comments', requireAuth, async (req, res) => {
  const comments = await Comment.find({ post: req.params.id, hidden: false })
    .sort({ createdAt: 1 })
    .populate('author');
  res.json(comments.map(formatComment));
});

router.post('/posts/:id/comments', requireAuth, async (req, res) => {
  const { body } = req.body;
  if (!body || body.length < 1 || body.length > 1000) {
    return res.status(400).json({ message: 'Invalid comment', errors: { body: 'Comment must be 1 to 1000 characters' } });
  }

  const post = await Post.findById(req.params.id);
  if (!post || post.hidden) {
    return res.status(404).json({ message: 'Post not found' });
  }

  const comment = await Comment.create({ body, post: post._id, author: req.user._id });
  await comment.populate('author');

  post.commentCount += 1;
  await post.save();

  // TODO (Step 9 - Notifications): if post.author !== req.user.id,
  // create a "comment" notification for the post's author.

  res.status(201).json(formatComment(comment));
});

router.put('/comments/:id', requireAuth, async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return res.status(404).json({ message: 'Comment not found' });
  }
  if (comment.author.toString() !== req.user.id) {
    return res.status(403).json({ message: 'You can only edit your own comments' });
  }

  const { body } = req.body;
  if (!body || body.length < 1 || body.length > 1000) {
    return res.status(400).json({ message: 'Invalid comment', errors: { body: 'Comment must be 1 to 1000 characters' } });
  }
  comment.body = body;
  await comment.save();
  await comment.populate('author');

  res.json(formatComment(comment));
});

router.delete('/comments/:id', requireAuth, async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return res.status(404).json({ message: 'Comment not found' });
  }
  if (comment.author.toString() !== req.user.id) {
    return res.status(403).json({ message: 'You can only delete your own comments' });
  }

  await comment.deleteOne();

  const post = await Post.findById(comment.post);
  if (post) {
    post.commentCount = Math.max(0, post.commentCount - 1);
    await post.save();
  }

  res.status(204).send();
});

module.exports = router;