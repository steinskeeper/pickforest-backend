var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");
var User = require("../models/User");
const grantAccess = require("../utils/verifytoken");
var multer = require("multer");
const { nanoid } = require("nanoid");
const sharp = require("sharp");
sharp.cache(false);
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype === "image/png") {
      cb(null, "./static/pfp");
    } else if (file.mimetype === "image/jpeg") {
      cb(null, "./static/pfp");
    } else if (file.mimetype === "image/jpg") {
      cb(null, "./static/pfp");
    } else if (file.mimetype === "image/gif") {
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
  try {
    const user = await User.findOne({ email });
    console.log("hhh", user);
    if (user === null) {
      const newUser = new User({
        userID: userid,
        email: email,
      });
      await newUser.save();
      const token = jwt.sign({ user_id: newUser.userID }, "myprecious");
      return res.status(200).json({
        authtype: "signup",
        user_id: newUser.userID,
        jwt: token,
      });
    }

    if (user) {
      const token = jwt.sign({ user_id: user.userID }, "myprecious");
      const username = user.name;
      if (userid !== user.userID) {
        await User.findOneAndUpdate({ email }, { userID: userid });
      }
      if (username === undefined) {
        return res.status(200).json({
          authtype: "signup",
          user_id: userid,
          jwt: token,
        });
      }

      return res.status(200).json({
        authtype: "signin",
        user_id: userid,
        details: user,
        jwt: token,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      authtype: "errored",
    });
  }
});

router.post(
  "/onboard",
  grantAccess(),
  [upload.any()],
  async function (req, res) {
    try {
      req.files.map(async (file) => {
        if (file.mimetype === "image/jpeg") {
          let buffer = await sharp(file.path).jpeg({ quality: 50 }).toBuffer();
          return sharp(buffer).toFile(file.path);
        } else if (file.mimetype === "image/png") {
          let buffer = await sharp(file.path).png({ quality: 50 }).toBuffer();
          return sharp(buffer).toFile(file.path);
        }
      });

      const username = req.body.username;
      const user_id = req.user.user_id;
      const subname = req.body.subname;
      var pfp = "";
      var coverURL = "";
      if (req.files.filter((e) => e.fieldname === "pfp").length > 0) {
        pfp = req.files.find((file) => file.fieldname === "pfp").filename;
      } else {
        pfp = "DEFAULTPFP.png";
      }

      if (req.files.filter((e) => e.fieldname === "cover").length > 0) {
        coverURL = req.files.find(
          (file) => file.fieldname === "cover"
        ).filename;
      } else {
        coverURL = "DEFAULTCOVER.gif";
      }

      const user = await User.findOneAndUpdate(
        { userID: user_id },
        {
          name: username,
          pfp: pfp,
          subname: subname,
          coverURL: coverURL,
        },
        { new: true }
      );

      res.status(200).json({
        status: "success",
        details: user,
      });
    } catch (err) {
      console.log(err);
      res.status(400).json({
        status: "error",
        message: err,
      });
    }
  }
);
router.get("/test", async function (req, res) {
  res.json({
    hello: "world",
  });
});

module.exports = router;
