const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const User = require('../../models/users');
const Post = require('../../models/post');
const auth = require('../../middleware/auth');

// @route     Post api/posts
// @des       Create Posts
// @access    Private
router.post(
  '/',
  auth,
  check('text', 'Text is required').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ err: errors.array() });
    try {
      const user = await User.findById(req.user.id).select('-password');
      const newPost = new Post({
        user: req.user.id,
        text: req.body.text,
        name: user.name,
      });
      const post = await newPost.save();
      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ msg: 'Server Error' });
    }
  }
);

router.get('/', async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    if (post.user.toString() !== req.user.id)
      return res.status(404).json({ msg: 'Post not found' });
    await post.delete();
    res.status(200).json({ msg: 'Post deleted successfully' });
  } catch (error) {
    if (error.kind === 'ObjectId')
      return res.status(404).json({ msg: 'Post not found' });
    res.status(500).json({ msg: 'Server Error' });
  }
});

router.put('/like/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    if (post.likes.some((like) => like.user.toString() === req.user.id))
      return res.status(400).json({ msg: 'Post already liked' });
    const newLike = {
      user: req.user.id,
    };
    post.likes.unshift(newLike);
    await post.save();
    res.json(post.likes);
  } catch (error) {
    res.status(500).json({ msg: 'Internal Server Error' });
  }
});

router.put('/unlike/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    if (!post.likes.some((like) => like.user.toString() === req.user.id))
      return res.status(400).json({ msg: 'Post has not yet been liked' });
    const likeIndex = post.likes.map((like) => like.user).indexOf(req.user.id);
    post.likes.splice(likeIndex, 1);
    await post.save();
    res.json(post.likes);
  } catch (error) {
    res.status(500).json({ msg: 'Internal Server Error' });
  }
});

router.put(
  '/comment/:id',
  auth,
  check('text', 'Text is required').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ err: errors.array() });
    const { id } = req.params;
    try {
      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(id);
      if (!post) return res.status(404).json({ err: 'No post found' });
      const newComment = {
        user: req.user.id,
        text: req.body.text,
        name: user.name,
      };
      post.comments.unshift(newComment);
      await post.save();
      res.json(post.comments);
    } catch (error) {
      res.status(500).send('Server Error');
    }
  }
);

router.delete('/comment/:id/:commentId', auth, async (req, res) => {
  const { id, commentId } = req.params;
  try {
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    const comment = post.comments.find(
      (comment) => comment.id.toString() === commentId
    );
    if (!comment) return res.status(404).json({ msg: 'Comment not found' });
    if (comment.user.toString() !== req.user.id)
      return res.status(404).json({ msg: 'Comment not found' });
    post.comments = post.comments.filter((comment) => comment.id !== commentId);
    await post.save();
    res.json(post.comments);
  } catch (error) {
    res.status(500).json({ msg: 'Server Error' });
  }
});
module.exports = router;
