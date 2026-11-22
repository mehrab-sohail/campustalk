require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Category = require('./models/Category');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const Reaction = require('./models/Reaction');
const Report = require('./models/Report');
const Notification = require('./models/Notification');
const Announcement = require('./models/Announcement');

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB for seeding');

  // 1. Wipe everything
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Post.deleteMany({}),
    Comment.deleteMany({}),
    Reaction.deleteMany({}),
    Report.deleteMany({}),
    Notification.deleteMany({}),
    Announcement.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  // 2. Users
  const hash = (pw) => bcrypt.hash(pw, 10);
  const moderator = await User.create({
    name: 'Moderator', email: 'moderator@campustalk.test',
    password: await hash('Moderator123'), role: 'moderator', bio: 'Keeping CampusTalk tidy.',
  });
  const ali = await User.create({
    name: 'Ali Khan', email: 'ali@campustalk.test',
    password: await hash('Student123'), role: 'student', bio: 'CS, 5th semester',
  });
  const sara = await User.create({
    name: 'Sara Ahmed', email: 'sara@campustalk.test',
    password: await hash('Student123'), role: 'student', bio: 'Business, 3rd semester',
  });
  const hamza = await User.create({
    name: 'Hamza Riaz', email: 'hamza@campustalk.test',
    password: await hash('Student123'), role: 'student', bio: 'Electrical Engineering, 7th semester',
  });
  const students = [ali, sara, hamza];
  console.log('Created users');

  // 3. Categories
  const academics = await Category.create({ name: 'Academics' });
  const events = await Category.create({ name: 'Events' });
  const campusLife = await Category.create({ name: 'Campus Life' });
  const oldArchived = await Category.create({ name: 'Old Announcements', archived: true });
  const categories = [academics, events, campusLife];
  console.log('Created categories');

  // 4. Posts
  const postSeeds = [
    ['Best way to prepare for the web exam?', 'Any study tips for the midterm?', academics],
    ['Is the database course worth taking next semester?', 'Heard mixed reviews, what do you all think?', academics],
    ['Study group for Data Structures?', 'Looking for 2-3 more people for weekly sessions.', academics],
    ['Past papers for Calculus II?', 'Does anyone have last year\'s past papers?', academics],
    ['Tips for the thesis proposal defense', 'First time presenting, any advice?', academics],
    ['Which elective should I pick?', 'Torn between AI and Computer Networks.', academics],
    ['Library extended hours confirmed?', 'Heard it\'s open till midnight during finals, can anyone confirm?', academics],
    ['Office hours clashing with lab', 'Anyone else having this issue this semester?', academics],
    ['Group project team still needs one more', 'Web Programming project, DM if interested.', academics],
    ['How do you take notes efficiently?', 'Looking for a better system than just typing everything.', academics],
    ['Annual sports gala date announced', 'Mark your calendars for next month!', events],
    ['Hackathon this weekend — teams open', 'Still a few spots left on my team.', events],
    ['Drama society auditions', 'Sign-ups close this Friday.', events],
    ['Career fair next week', 'Which companies are attending this year?', events],
    ['Photography club exhibition', 'Come check out our semester showcase.', events],
    ['Inter-university debate competition', 'Our team made it to the finals!', events],
    ['Music night this Saturday', 'Open mic, free entry for students.', events],
    ['Robotics club demo day', 'Come see what we built this semester.', events],
    ['Alumni panel discussion', 'Great chance to ask about internships.', events],
    ['Food festival on campus', 'So many stalls this year, highly recommend.', campusLife],
    ['Best quiet spots to study outdoors?', 'Tired of the library, any hidden gems?', campusLife],
    ['New cafe opened near the gate', 'Coffee is actually really good.', campusLife],
    ['Lost and found: blue water bottle', 'Left it near the CS building, please return if found.', campusLife],
    ['Gym timings during Ramadan', 'Anyone know if they\'ve changed?', campusLife],
    ['Carpool group for commuters', 'Looking to split fuel costs, live near Gulshan.', campusLife],
    ['Best cheap eats around campus', 'Budget is tight this month, recommendations?', campusLife],
    ['Weather finally cooling down', 'Anyone else enjoying the walk to campus now?', campusLife],
  ];

  const posts = [];
  for (let i = 0; i < postSeeds.length; i++) {
    const [title, body, category] = postSeeds[i];
    const author = students[i % students.length];
    // Mix of ages: roughly half within the last week, half older
    const age = i % 2 === 0 ? Math.floor(Math.random() * 6) : 8 + Math.floor(Math.random() * 20);
    const post = await Post.create({
      title, body, category: category._id, author: author._id,
      createdAt: daysAgo(age), updatedAt: daysAgo(age),
    });
    posts.push(post);
  }
  console.log(`Created ${posts.length} posts`);

  // 5. Reactions
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const reactingUsers = [moderator, ali, sara, hamza].filter((u) => u._id.toString() !== post.author.toString());
    const likeCount = i % 4; // 0, 1, 2 or 3 likes depending on post
    const dislikeCount = i % 7 === 0 ? 1 : 0;
    let idx = 0;
    for (let l = 0; l < likeCount && idx < reactingUsers.length; l++, idx++) {
      await Reaction.create({ post: post._id, user: reactingUsers[idx]._id, type: 'like' });
    }
    for (let d = 0; d < dislikeCount && idx < reactingUsers.length; d++, idx++) {
      await Reaction.create({ post: post._id, user: reactingUsers[idx]._id, type: 'dislike' });
    }
    post.likes = likeCount;
    post.dislikes = dislikeCount;
    await post.save();
  }
  console.log('Created reactions');

  // 6. Comments on a handful of posts
  const commentSeeds = [0, 0, 1, 2, 3, 5, 10, 11, 15, 20];
  for (const postIndex of commentSeeds) {
    const post = posts[postIndex];
    const commenter = students.find((s) => s._id.toString() !== post.author.toString());
    const comment = await Comment.create({
      body: 'Thanks for sharing, this is really helpful!',
      post: post._id,
      author: commenter._id,
    });
    post.commentCount += 1;
    await post.save();

    if (commenter._id.toString() !== post.author.toString()) {
      await Notification.create({
        recipient: post.author,
        type: 'comment',
        message: `${commenter.name} commented on your post`,
        postId: post._id,
        read: Math.random() > 0.5,
      });
    }
  }
  console.log('Created comments and comment notifications');

  // 7. Bookmarks
  ali.bookmarks.push(posts[0]._id, posts[10]._id);
  sara.bookmarks.push(posts[3]._id);
  await ali.save();
  await sara.save();
  console.log('Created bookmarks');

  // 8. Reports
  const reportedComment = await Comment.findOne({ post: posts[0]._id });
  const report1 = await Report.create({
    targetType: 'post', targetId: posts[5]._id, postId: posts[5]._id,
    targetPreview: posts[5].body.slice(0, 100), reason: 'Off-topic content',
    status: 'open', reporter: hamza._id,
  });
  const report2 = await Report.create({
    targetType: 'comment', targetId: reportedComment._id, postId: posts[0]._id,
    targetPreview: reportedComment.body.slice(0, 100), reason: 'Rude tone',
    status: 'open', reporter: sara._id,
  });
  const resolvedReport = await Report.create({
    targetType: 'post', targetId: posts[12]._id, postId: posts[12]._id,
    targetPreview: posts[12].body.slice(0, 100), reason: 'Duplicate post',
    status: 'resolved', reporter: ali._id,
  });
  await Notification.create({
    recipient: ali._id, type: 'moderation', message: 'Your report was reviewed',
    postId: resolvedReport.postId, read: false,
  });
  console.log('Created reports');

  // 9. Announcements
  await Announcement.create({
    title: 'Welcome to CampusTalk', body: 'Please follow community guidelines when posting.',
    pinned: true, author: moderator._id,
  });
  await Announcement.create({
    title: 'Exam schedule released', body: 'Check the portal for your exam seat and timing.',
    pinned: false, author: moderator._id,
  });
  console.log('Created announcements');

  console.log('\nSeed complete:');
  console.log(`  ${students.length + 1} users, ${categories.length + 1} categories (1 archived), ${posts.length} posts`);
  console.log('  Accounts: moderator@campustalk.test / Moderator123, ali/sara/hamza@campustalk.test / Student123');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});