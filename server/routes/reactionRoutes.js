const express = require('express');
const Reaction = require('../models/Reaction');
const Post = require('../models/Post');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.put('/posts/:id/reaction', requireAuth, async (req, res) => {
  const { type } = req.body;
  if (type !== 'like' && type !== 'dislike') {
    return res.status(400).json({ message: 'type must be "like" or "dislike"' });
  }

  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  const existing = await Reaction.findOne({ post: post._id, user: req.user._id });

  if (!existing) {
    await Reaction.create({ post: post._id, user: req.user._id, type });
    post[type === 'like' ? 'likes' : 'dislikes'] += 1;
  } else if (existing.type !== type) {
    post[existing.type === 'like' ? 'likes' : 'dislikes'] -= 1;
    post[type === 'like' ? 'likes' : 'dislikes'] += 1;
    existing.type = type;
    await existing.save();
  }
  // if existing.type === type, nothing changes — calling it twice with the same type is a no-op

  await post.save();
  res.json({ likes: post.likes, dislikes: post.dislikes, myReaction: type });
});

router.delete('/posts/:id/reaction', requireAuth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  const existing = await Reaction.findOne({ post: post._id, user: req.user._id });
  if (existing) {
    post[existing.type === 'like' ? 'likes' : 'dislikes'] -= 1;
    await post.save();
    await existing.deleteOne();
  }

  res.json({ likes: post.likes, dislikes: post.dislikes, myReaction: null });
});

module.exports = router;