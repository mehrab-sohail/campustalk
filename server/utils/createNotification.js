const Notification = require('../models/Notification');

function createNotification({ recipient, type, message, postId }) {
  return Notification.create({ recipient, type, message, postId });
}

module.exports = createNotification;