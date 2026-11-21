const express = require('express');
const Announcement = require('../models/Announcement');
const { requireAuth, requireModerator } = require('../middleware/auth');

const router = express.Router();

function formatAnnouncement(a) {
  const json = a.toJSON();
  return {
    ...json,
    author: a.author ? { id: a.author._id.toString(), name: a.author.name } : null,
  };
}

router.get('/', requireAuth, async (req, res) => {
  const announcements = await Announcement.find()
    .sort({ pinned: -1, createdAt: -1 })
    .populate('author');
  res.json(announcements.map(formatAnnouncement));
});

router.post('/', requireAuth, requireModerator, async (req, res) => {
  const { title, body, pinned } = req.body;

  if (!title || !title.trim() || title.length > 120) {
    return res.status(400).json({ message: 'Invalid title', errors: { title: 'Title is required and must be 120 characters or less' } });
  }
  if (!body || !body.trim() || body.length > 2000) {
    return res.status(400).json({ message: 'Invalid body', errors: { body: 'Announcement text is required and must be 2000 characters or less' } });
  }

  const announcement = await Announcement.create({
    title: title.trim(),
    body: body.trim(),
    pinned: Boolean(pinned),
    author: req.user._id,
  });
  await announcement.populate('author');

  res.status(201).json(formatAnnouncement(announcement));
});

// PUT /api/announcements/:id — moderator only (the frontend uses PUT, not PATCH)
router.put('/:id', requireAuth, requireModerator, async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) {
    return res.status(404).json({ message: 'Announcement not found' });
  }

  announcement.pinned = Boolean(req.body.pinned);
  await announcement.save();
  await announcement.populate('author');

  res.json(formatAnnouncement(announcement));
});

// DELETE /api/announcements/:id — moderator only (not in the written contract, but the frontend calls it)
router.delete('/:id', requireAuth, requireModerator, async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) {
    return res.status(404).json({ message: 'Announcement not found' });
  }

  await announcement.deleteOne();
  res.status(204).send();
});

module.exports = router;