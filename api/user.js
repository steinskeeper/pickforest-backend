var express = require("express");
var router = express.Router();

var User = require("../models/User");
const grantAccess = require("../utils/verifytoken");
var multer = require("multer");
const { nanoid } = require("nanoid");
const mongoose = require("mongoose");

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

router.get("/get/:id", async (req, res) => {
  const user = await User.findOne({ userID: req.params.id });
  res.status(200).json(user);
});

router.post(
  "/update-deets",
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
        pfp = undefined;
      }

      if (req.files.filter((e) => e.fieldname === "cover").length > 0) {
        coverURL = req.files.find(
          (file) => file.fieldname === "cover"
        ).filename;
      } else {
        coverURL = undefined;
      }
      var data = {
        name: username,
        pfp: pfp,
        coverURL: coverURL,
        subname: subname,
      };

      Object.keys(data).forEach((k) => data[k] == undefined && delete data[k]);
      console.log(data);
      const user = await User.findOneAndUpdate({ userID: user_id }, data, {
        new: true,
      });

      res.status(200).json({
        status: "success",
        message: user,
      });
    } catch (err) {
      console.log(err);
    }
  }
);

router.post("/create-tree", grantAccess(), async function (req, res) {
  const { url, title, emoji } = req.body;
  const user_id = req.user.user_id;
  var treeID = new mongoose.Types.ObjectId();
  const user = await User.findOneAndUpdate(
    { userID: user_id },
    {
      $push: {
        trees: {
          treeID: treeID,
          url: url,
          title: title,
          emoji: emoji,
        },
      },
    }
  );
  res.status(200).json({
    status: "success",
    message: "Tree Added",
  });
});

router.post("/update-tree", grantAccess(), async function (req, res) {
  const { treeID, url, title, emoji } = req.body;
  const user_id = req.user.user_id;

  const user = await User.findOneAndUpdate(
    { userID: user_id, "trees.treeID": treeID },
    {
      $set: {
        "trees.$": {
          treeID: treeID,
          url: url,
          title: title,
          emoji: emoji,
        },
      },
    },
    { new: true, overwrite: true }
  );
  res.status(200).json({
    status: "success",
    message: "Tree Updated",
  });
});

router.post("/delete-tree", grantAccess(), async function (req, res) {
  const { treeID } = req.body;
  const user_id = req.user.user_id;

  const user = await User.findOneAndUpdate(
    { userID: user_id },
    {
      $pull: {
        trees: {
          treeID: treeID,
        },
      },
    },
    { new: true }
  );
  res.status(200).json({
    status: "success",
    message: user,
  });
});
router.post("/avail-username", async function (req, res, next) {
  try {
    const { subname } = req.body;
    const user = await User.findOne({ subname: subname });
    if (!user) {
      res.status(200).json({
        status: "true",
        message: "Username available",
      });
    } else {
      res.status(200).json({
        status: "false",
        message: "Username unavailable",
      });
    }
  } catch (err) {
    console.log(err);
  }
});

router.get("/publicget/:id", async (req, res) => {
  const user = await User.findOne({ subname: req.params.id });
  res.status(200).json(user);
});
module.exports = router;
