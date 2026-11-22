const Reaction = require('../models/Reaction');

async function formatPost(post, user) {
  const json = post.toJSON();
  delete json.hidden;

  const myReactionDoc = await Reaction.findOne({ post: post._id, user: user._id });
  const bookmarked = user.bookmarks.some((id) => id.toString() === post._id.toString());

  return {
    ...json,
    category: post.category ? { id: post.category._id.toString(), name: post.category.name } : null,
    author: post.author ? { id: post.author._id.toString(), name: post.author.name } : null,
    myReaction: myReactionDoc ? myReactionDoc.type : null,
    bookmarked,
  };
}

module.exports = formatPost;