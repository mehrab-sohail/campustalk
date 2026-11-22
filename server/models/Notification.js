const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['comment', 'moderation'], required: true },
  message: { type: String, required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  read: { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.recipient; // the contract's Notification shape doesn't include this
    if (ret.postId) ret.postId = ret.postId.toString();
    return ret;
  },
});

module.exports = mongoose.model('Notification', notificationSchema);