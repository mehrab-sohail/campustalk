const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { requireAuth } = require('../middleware/auth');
const formatPost = require('../utils/formatPost');

const router = express.Router();

router.get('/me', requireAuth, (req, res) => {
  res.json(req.user);
});

router.put('/me', requireAuth, async (req, res) => {
  const { name, bio } = req.body;
  if (name !== undefined) {
    if (name.length < 2 || name.length > 50) {
      return res.status(400).json({ message: 'Invalid name', errors: { name: 'Name must be 2 to 50 characters' } });
    }
    req.user.name = name;
  }
  if (bio !== undefined) {
    if (bio.length > 300) {
      return res.status(400).json({ message: 'Invalid bio', errors: { bio: 'Bio must be at most 300 characters' } });
    }
    req.user.bio = bio;
  }
  await req.user.save();
  res.json(req.user);
});

router.get('/me/posts', requireAuth, async (req, res) => {
  const posts = await Post.find({ author: req.user._id })
    .sort({ createdAt: -1 })
    .populate('category')
    .populate('author');
  res.json(posts.map((p) => formatPost(p, req.user.id)));
});

router.get('/me/comments', requireAuth, async (req, res) => {
  const comments = await Comment.find({ author: req.user._id })
    .sort({ createdAt: -1 })
    .populate({ path: 'post', select: 'title' });

  res.json(comments.map((c) => {
   const json = c.toJSON();
   delete json.post;
   delete json.author;
   return {
     ...json,
     postId: c.post ? c.post._id.toString() : null,
     postTitle: c.post ? c.post.title : null,
   };
  }));
});

module.exports = router;