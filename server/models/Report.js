const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  targetType: { type: String, enum: ['post', 'comment'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  targetPreview: { type: String, required: true },
  targetHidden: { type: Boolean, default: false },
  reason: { type: String, required: true, minLength: 3, maxLength: 300 },
  status: { type: String, enum: ['open', 'resolved'], default: 'open' },
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

reportSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Report', reportSchema);