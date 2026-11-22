const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  type: { type: String, enum: ['like', 'dislike'], required: true },
}, { timestamps: true });

// One reaction per user per post — enforced at the database level,
// not just in route logic (per the contract's explicit requirement).
reactionSchema.index({ user: 1, post: 1 }, { unique: true });

module.exports = mongoose.model('Reaction', reactionSchema);