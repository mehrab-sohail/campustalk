const express = require('express');
const Notification = require('../models/Notification');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 });
  res.json(notifications.map((n) => n.toJSON()));
});

router.patch('/:id/read', requireAuth, async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }
  if (notification.recipient.toString() !== req.user.id) {
    return res.status(403).json({ message: 'You can only mark your own notifications as read' });
  }

  notification.read = true;
  await notification.save();
  res.json(notification.toJSON());
});

module.exports = router;