const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  body: { type: String, required: true, minLength: 1, maxLength: 1000 },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hidden: { type: Boolean, default: false },
}, { timestamps: true });

commentSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.hidden;
    return ret;
  },
});

module.exports = mongoose.model('Comment', commentSchema);