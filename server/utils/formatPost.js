function formatPost(post, userId) {
  const json = post.toJSON();
  delete json.hidden;
  return {
    ...json,
    category: post.category ? { id: post.category._id.toString(), name: post.category.name } : null,
    author: post.author ? { id: post.author._id.toString(), name: post.author.name } : null,
    myReaction: null,   // TODO Step 6
    bookmarked: false,  // TODO Step 7
  };
}

module.exports = formatPost;