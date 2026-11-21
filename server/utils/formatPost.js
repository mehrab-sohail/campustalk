const Reaction = require('../models/Reaction');

async function formatPost(post, userId) {
  const json = post.toJSON();
  delete json.hidden;

  const myReactionDoc = await Reaction.findOne({ post: post._id, user: userId });

  return {
    ...json,
    category: post.category ? { id: post.category._id.toString(), name: post.category.name } : null,
    author: post.author ? { id: post.author._id.toString(), name: post.author.name } : null,
    myReaction: myReactionDoc ? myReactionDoc.type : null,
    bookmarked: false, // TODO Step 7
  };
}

module.exports = formatPost;