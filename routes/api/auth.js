const express = require('express');

const auth = require('../../middleware/auth');
const router = express.Router();
const User = require('../../models/users');
const { check, validationResult } = require('express-validator/check');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');

// @route     GET api/auth
// @des       Tes route
// @access    Public
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.send(user);
  } catch (err) {
    res.status(500).send('User not found');
  }
});

router.post(
  '/',
  check('email', 'Email is invalid').isEmail(),
  check('password', 'Password is required').notEmpty(),
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ error: error.array() });
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(409).json({ error: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(409).json({ error: 'Invalid credentials' });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          console.log(token);
          return res.json({ token });
        }
      );
    } catch (error) {
      console.log(error.message);
      return res.status(500).send({ error: 'Internal server error' });
    }
  }
);

module.exports = router;
