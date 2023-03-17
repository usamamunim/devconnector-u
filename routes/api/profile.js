const express = require('express');
const { check, validationResult } = require('express-validator/check');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/profile');
const request = require('request');
const config = require('config');

// @route     GET api/profile/me
// @des       Get user own profile
// @access    Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate('user', ['name']);

    if (!profile) {
      return res.status(404).json({ msg: 'Profile not found' });
    }
    return res.json(profile);
  } catch (err) {
    res.status(500).json({ msg: 'Profile not found' });
  }
});

// @route     Post api/profile
// @des       create or update user profile
// @access    Private

router.post(
  '/',
  auth,
  check('status', 'Status is required').notEmpty(),
  check('skills', 'Skills are required').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }
    const {
      company,
      website,
      location,
      status,
      skills,
      bio,
      githubusername,
      youtube,
      twitter,
      facebook,
      linkedin,
      instagram,
    } = req.body;

    const profileAttributes = {};
    profileAttributes.user = req.user.id;
    if (company) profileAttributes.company = company;
    if (website) profileAttributes.website = website;
    if (location) profileAttributes.location = location;
    if (status) profileAttributes.status = status;
    if (skills)
      profileAttributes.skills = skills.split(',').map((skill) => skill.trim());
    if (bio) profileAttributes.bio = bio;
    if (githubusername) profileAttributes.githubusername = githubusername;
    profileAttributes.social = {};
    if (youtube) profileAttributes.social.youtube = youtube;
    if (twitter) profileAttributes.social.twitter = twitter;
    if (facebook) profileAttributes.social.facebook = facebook;
    if (linkedin) profileAttributes.social.linkedin = linkedin;
    if (instagram) profileAttributes.social.instagram = instagram;
    try {
      let profile = await Profile.findOne({
        user: req.user.id,
      });
      console.log(profile);
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileAttributes },
          { new: true }
        );
        return res.json(profile);
      }

      profile = new Profile(profileAttributes);
      await profile.save();
      return res.json(profile);
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ msg: 'Server error' });
    }
  }
);

// @route     GET api/profile
// @des       Get all profiles
// @access    Private

router.get('/', auth, async (req, res) => {
  try {
    const profiles = await Profile.find();
    return res.json(profiles);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route     GET api/profile/user/:userId
// @des       Get profile by userId
// @access    Private

router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await Profile.findOne({
      user: userId,
    }).populate('user', ['name']);
    if (!profile) return res.status(400).json({ msg: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    if (err.kind === 'ObjectId')
      return res.status(400).json({ msg: 'Profile not found' });
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route     Delete api/profile
// @des       Delete user and profile
// @access    Private
router.delete('/', auth, async (req, res) => {
  try {
    await Profile.findOneAndRemove({ user: req.user.id });
    await User.findOneAndRemove({ _id: req.user.id });
    res.json({ msg: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.put(
  '/experience',
  auth,
  check('title', 'Title is required').notEmpty(),
  check('company', 'Company is required').notEmpty(),
  check('from', 'From is required').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(404).json({ err: errors.array() });
    }
    const { title, company, location, from, to, current, description } =
      req.body;
    console.log(req.body);
    const expAttr = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };
    try {
      console.log(req.user.id);
      const profile = await Profile.findOne({ user: req.user.id });
      if (!profile) return res.status(400).json({ msg: 'Profile not found' });
      profile.experience.unshift(expAttr);
      await profile.save();
      res.json(profile);
    } catch (error) {
      res.status(500).json({ msg: 'Server error' });
    }
  }
);

router.delete('/experience/:expId', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const { expId } = req.params;
    if (!profile) return res.status(400).json({ msg: 'Profile not found' });
    console.log(profile);
    const expIndex = profile.experience.findIndex((exp) => exp.id == expId);
    if (expIndex < 0)
      return res.status(404).json({ msg: 'No experience to delete' });
    profile.experience.splice(expIndex, 1);
    await profile.save();
    res.json({ msg: 'Experience deleted Successfully' });
  } catch (error) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

router.put(
  '/education',
  auth,
  check('school', 'School is required').notEmpty(),
  check('degree', 'Degree is required').notEmpty(),
  check('fieldofstudy', 'Fieldofstudy is required').notEmpty(),
  check('from', 'From is required').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(404).json({ err: errors.array() });
    }
    const { school, degree, fieldofstudy, from, to, current, description } =
      req.body;
    const educationAttr = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };
    try {
      console.log(req.user.id);
      const profile = await Profile.findOne({ user: req.user.id });
      console.log(profile);
      if (!profile) return res.status(400).json({ msg: 'Profile not found' });
      profile.education.unshift(educationAttr);
      await profile.save();
      res.json(profile);
    } catch (error) {
      res.status(500).json({ msg: 'Server error' });
    }
  }
);

router.delete('/education/:eduId', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const { eduId } = req.params;
    if (!profile) return res.status(400).json({ msg: 'Profile not found' });
    const eduIndex = profile.education.findIndex((edu) => edu.id == eduId);
    if (eduIndex < 0)
      return res.status(404).json({ msg: 'No education to delete' });
    profile.education.splice(eduIndex, 1);
    await profile.save();
    res.json({ msg: 'Education deleted Successfully' });
  } catch (error) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

router.get('/github/:username', (req, res) => {
  const { username } = req.params;
  const options = {
    uri: `https://api.github.com/users/${username}/repos?client_id=${config.get(
      'githubClientId'
    )}&client_secret=${config.get('githubSecret')}`,
    mothod: 'GET',
    headers: { 'user-agent': 'node.js' },
  };
  request(options, (err, response, body) => {
    if (err) return console.log(err);
    console.log(response.statusCode);
    if (response.statusCode !== 200)
      return res.status(404).json({ msg: 'No github repository found' });

    res.json(JSON.parse(body));
  });
});
module.exports = router;
