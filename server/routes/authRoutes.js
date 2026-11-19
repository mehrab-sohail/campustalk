const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || name.length < 2 || name.length > 50) {
    return res.status(400).json({ message: 'Invalid name', errors: { name: 'Name must be 2 to 50 characters' } });
  }
  if (!email) {
    return res.status(400).json({ message: 'Email is required', errors: { email: 'Email is required' } });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Invalid password', errors: { password: 'Password must be at least 6 characters' } });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: 'Email already in use' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // role is always "student" — signup can never create a moderator,
  // no matter what the request body contains
  const user = await User.create({ name, email, password: hashedPassword, role: 'student' });

  const token = generateToken(user._id);
  res.status(201).json({ user, token });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email?.toLowerCase() }).select('+password');
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = generateToken(user._id);
  res.json({ user, token });
});

module.exports = router;