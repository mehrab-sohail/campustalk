const express = require('express');
const Category = require('../models/Category');
const { requireAuth, requireModerator } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const includeArchived = req.query.includeArchived === 'true' && req.user.role === 'moderator';
  const filter = includeArchived ? {} : { archived: false };
  const categories = await Category.find(filter).sort({ name: 1 });
  res.json(categories);
});

router.post('/', requireAuth, requireModerator, async (req, res) => {
  const { name } = req.body;
  if (!name || name.length < 2 || name.length > 40) {
    return res.status(400).json({ message: 'Invalid name', errors: { name: 'Name must be 2 to 40 characters' } });
  }

  const existing = await Category.findOne({ name });
  if (existing) {
    return res.status(409).json({ message: 'Category name already in use' });
  }

  const category = await Category.create({ name });
  res.status(201).json(category);
});

router.put('/:id', requireAuth, requireModerator, async (req, res) => {
  const { name, archived } = req.body;
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }

  if (name !== undefined) {
    if (name.length < 2 || name.length > 40) {
      return res.status(400).json({ message: 'Invalid name', errors: { name: 'Name must be 2 to 40 characters' } });
    }
    const duplicate = await Category.findOne({ name, _id: { $ne: category._id } });
    if (duplicate) {
      return res.status(409).json({ message: 'Category name already in use' });
    }
    category.name = name;
  }
  if (archived !== undefined) {
    category.archived = archived;
  }

  await category.save();
  res.json(category);
});

router.delete('/:id', requireAuth, requireModerator, async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }

  // TODO (Step 4): return 409 if any Post references this category

  await category.deleteOne();
  res.status(204).send();
});

module.exports = router;