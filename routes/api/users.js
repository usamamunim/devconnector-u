const bycrypt = require('bcrypt')
const config = require('config')
const express = require('express');
const {check, validationResult} = require('express-validator')
const gravatar = require('gravator')
const jwt = require('jsonwebtoken')

const User =  require('../../models/users')

const router = express.Router();

// @route     GET api/users
// @des       Tes route
// @access    Public
router.post(
  "/",
  check('name', 'Name is required')
    .notEmpty(),
  check("email", "Email is invalid")
    .isEmail(),
  check("password", "Password length should be greater than 6")
    .isLength({min: 6}),
async (req, res) => {
  const error = validationResult(req);
  if(!error.isEmpty()){
    return res.status(400).json({error: error.array()});
  }

  const {name, email, password} = req.body;
  try{
    let user = await User.findOne({email});
    if(user){
      return res.status(409).json({error: "User already exsists"});
    }

    console.log(name, email, password)

    user = new User({
      name,
      email,
      password
    });

    const salt = await bycrypt.genSalt(10);
    user.password = await bycrypt.hash(user.password, salt);
    await user.save();
    const payload = {
      user: {
        id: user.id
      }
    }

    jwt.sign(
      payload,
      config.get('jwtSecret'),
      {expiresIn: 360000},
      (err, token) => {
        if (err) throw err;
        console.log(token)
        return res.json({token})
      }
    )

  } catch(error){
      console.log(error.message);
      return res.status(500).send({error: "Internal server error"});
  }
});

module.exports = router;
