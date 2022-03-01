var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");
var User = require("../models/User");
const grantAccess = require("../utils/verifytoken");
var multer = require("multer");
const { nanoid } = require("nanoid");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype === "image/png") {
      cb(null, "./static/pfp");
    } else if (file.mimetype === "image/jpeg") {
      cb(null, "./static/pfp");
    } else if (file.mimetype === "image/jpg") {
      cb(null, "./static/pfp");
    } else {
      console.log(file.mimetype);
      cb({ error: "Mime type not supported" });
    }
  },
  filename: function (req, file, cb) {
    let extArray = file.mimetype.split("/");
    let extension = extArray[extArray.length - 1];
    var date_now = new Date();
    let dd = String(date_now.getDate()).padStart(2, "0");
    let mm = String(date_now.getMonth() + 1).padStart(2, "0");
    let yy = date_now.getFullYear();
    let timestamp = dd + "-" + mm + "-" + yy + "";
    let uniqid = nanoid();
    cb(null, uniqid + "." + extension);
  },
});

var upload = multer({ storage: storage });

router.post("/authtype", async function (req, res) {
  const { userid, email } = req.body;
  const user = await User.findOne({ userID: userid });
  if (user) {
    const token = jwt.sign({ user_id: user.userID }, "myprecious");
    res.status(200).json({
      authtype: "signin",
      user_id: user.userID,
      jwt: token,
    });
  }
  else if (user.hasOwnProperty("name")) {
    const token = jwt.sign({ user_id: user.userID }, "myprecious");
    res.status(200).json({
      authtype: "signup",
      user_id: user.userID,
      jwt: token,
    });
  
  }
  else{
    const newUser = new User({
      userID: userid,
      email: email,
    });
    await newUser.save();
    const token = jwt.sign({ user_id: newUser.userID }, "myprecious");
    res.status(200).json({
      authtype: "signup",
      user_id: newUser.userID,
      jwt: token,
    });
  }
});


router.post("/onboard",grantAccess(),upload.single('pfp'), async function (req, res) {
  try{  
  const username = req.body.username
    const user_id = req.user.user_id;
    const pfp = req.file
    const user = await User.findOneAndUpdate({ userID: user_id }, {
      name: username,
      pfp: pfp.path,
    });

    res.status(200).json({
      status: "success",
      details: user

    });
    
  }
  catch (err){
    console.log(err)
  }
});

module.exports = router;
