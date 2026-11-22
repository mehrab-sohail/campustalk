const express = require('express');
const Post = require('../models/Post');
const { requireAuth } = require('../middleware/auth');
const formatPost = require('../utils/formatPost');

const router = express.Router();

router.get('/users/me/bookmarks', requireAuth, async (req, res) => {
  const posts = await Post.find({ _id: { $in: req.user.bookmarks } })
    .populate('category')
    .populate('author');
  res.json(await Promise.all(posts.map((p) => formatPost(p, req.user))));
});

router.put('/posts/:id/bookmark', requireAuth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  const alreadyBookmarked = req.user.bookmarks.some((id) => id.toString() === post._id.toString());
  if (!alreadyBookmarked) {
    req.user.bookmarks.push(post._id);
    await req.user.save();
  }

  res.json({ bookmarked: true });
});

router.delete('/posts/:id/bookmark', requireAuth, async (req, res) => {
  req.user.bookmarks = req.user.bookmarks.filter((id) => id.toString() !== req.params.id);
  await req.user.save();
  res.json({ bookmarked: false });
});

module.exports = router;