const express = require('express');
const Post = require('../models/Post');
const Category = require('../models/Category');
const { requireAuth } = require('../middleware/auth');
const formatPost = require('../utils/formatPost');

const router = express.Router();

router.get('/top', requireAuth, async (req, res) => {
  const range = req.query.range === 'week' ? 'week' : 'all';
  const limit = parseInt(req.query.limit) || 5;

  const filter = { hidden: false };
  if (range === 'week') {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    filter.createdAt = { $gte: weekAgo };
  }

  const posts = await Post.find(filter)
    .sort({ likes: -1 })
    .limit(limit)
    .populate('category')
    .populate('author');

  res.json(posts.map((p) => formatPost(p, req.user.id)));
});

router.get('/', requireAuth, async (req, res) => {
  const { search, category, sort } = req.query;
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;

  const filter = { hidden: false };
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { body: { $regex: search, $options: 'i' } },
    ];
  }
  if (category) {
    filter.category = category;
  }

  const sortOption = sort === 'liked' ? { likes: -1, createdAt: -1 } : { createdAt: -1 };

  const total = await Post.countDocuments(filter);
  const posts = await Post.find(filter)
    .sort(sortOption)
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .populate('category')
    .populate('author');

  res.json({
    items: posts.map((p) => formatPost(p, req.user.id)),
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  });
});

router.get('/:id', requireAuth, async (req, res) => {
  const post = await Post.findById(req.params.id).populate('category').populate('author');
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }
  if (post.hidden && req.user.role !== 'moderator') {
    return res.status(404).json({ message: 'Post not found' });
  }
  res.json(formatPost(post, req.user.id));
});

router.post('/', requireAuth, async (req, res) => {
  const { title, body, categoryId } = req.body;

  if (!title || title.length < 1 || title.length > 120) {
    return res.status(400).json({ message: 'Invalid title', errors: { title: 'Title must be 1 to 120 characters' } });
  }
  if (!body || body.length < 1 || body.length > 5000) {
    return res.status(400).json({ message: 'Invalid body', errors: { body: 'Body must be 1 to 5000 characters' } });
  }

  const category = await Category.findById(categoryId);
  if (!category || category.archived) {
    return res.status(400).json({ message: 'Invalid category', errors: { categoryId: 'Category does not exist or is archived' } });
  }

  const post = await Post.create({ title, body, category: category._id, author: req.user._id });
  await post.populate('category');
  await post.populate('author');

  res.status(201).json(formatPost(post, req.user.id));
});

router.put('/:id', requireAuth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }
  if (post.author.toString() !== req.user.id) {
    return res.status(403).json({ message: 'You can only edit your own posts' });
  }

  const { title, body, categoryId } = req.body;
  if (title !== undefined) {
    if (title.length < 1 || title.length > 120) {
      return res.status(400).json({ message: 'Invalid title', errors: { title: 'Title must be 1 to 120 characters' } });
    }
    post.title = title;
  }
  if (body !== undefined) {
    if (body.length < 1 || body.length > 5000) {
      return res.status(400).json({ message: 'Invalid body', errors: { body: 'Body must be 1 to 5000 characters' } });
    }
    post.body = body;
  }
  if (categoryId !== undefined) {
    const category = await Category.findById(categoryId);
    if (!category || category.archived) {
      return res.status(400).json({ message: 'Invalid category', errors: { categoryId: 'Category does not exist or is archived' } });
    }
    post.category = category._id;
  }

  await post.save();
  await post.populate('category');
  await post.populate('author');
  res.json(formatPost(post, req.user.id));
});

router.delete('/:id', requireAuth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }
  if (post.author.toString() !== req.user.id) {
    return res.status(403).json({ message: 'You can only delete your own posts' });
  }

  await post.deleteOne();
  res.status(204).send();
});

module.exports = router;