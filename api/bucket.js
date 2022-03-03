var express = require("express");
var router = express.Router();

var Bucket = require("../models/Bucket");
var User = require("../models/User");
const grantAccess = require("../utils/verifytoken");
var multer = require("multer");
const { nanoid } = require("nanoid");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype === "image/png") {
      cb(null, "./static/photos");
    } else if (file.mimetype === "image/jpeg") {
      cb(null, "./static/photos");
    } else if (file.mimetype === "image/jpg") {
      cb(null, "./static/photos");
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
router.post(
  "/create",
  grantAccess(),
  [upload.any()],
  async function (req, res) {
    try {
      const images = req.files;
      const bucketname = req.body.bucketname;
      const expirytime = req.body.expirytime;

      console.log(images);
      var imagecard = [];
      images.map((pic) => {
        imagecard.push({
          imageID: nanoid(),
          imgURL: pic.filename,
        });
      });

      var data = {
        bucketName: bucketname,
        votingopen: expirytime,
        userID: req.user.user_id,
        bucketID: nanoid(),
        imageCardDetails: imagecard,
      };
      console.log(data);
      const bucket = await Bucket.create(data);
      var expiryAt = new Date(bucket.createdAt);
      if (expirytime.indexOf("h") > -1) {
        expiryAt.setHours(expiryAt.getHours() + parseInt(expirytime.charAt(0)));
        expiryAt = expiryAt.toISOString();
        const newbucket = await Bucket.findOneAndUpdate(
          { bucketID: bucket.bucketID },
          {
            expiryAt: expiryAt,
          }
        );
      } else if (expirytime.indexOf("w") > -1) {
        expiryAt.setDate(expiryAt.getDate() + 7);
        expiryAt = expiryAt.toISOString();
        const newbucket = await Bucket.findOneAndUpdate(
          { bucketID: bucket.bucketID },
          {
            expiryAt: expiryAt,
          }
        );
      }

      res.status(200).json({
        status: "success",
        bucketid: bucket.bucketID,
      });
    } catch (err) {
      return res.json({
        message: "error",
        details: "Failed to Reterive Data",
      });
    }
  }
);
router.post("/get", async (req, res) => {
  var { bucketID, token } = req.body;

  var decoded = {};

  try {
    decoded = jwt.verify(token, "myprecious");
  } catch (err) {
    decoded.user_id = "notowner";
  }

  var bucket = await Bucket.findOne({ bucketID: bucketID }).lean();
  bucket.imageCardDetails.map((img) => {
    img.voted = "notvoted";
    img.reacted = "notreacted";
  });
  if (bucket.userID === decoded.user_id) {
    bucket.isAdmin = true;
  } else {
    bucket.isAdmin = false;
  }

  const maxvote = bucket.imageCardDetails.reduce((p, c) =>
    p.votes.upvotes > c.votes.upvotes ? p : c
  );
  bucket.winnerImage = maxvote.imageID;

  const user = await User.findOne({ userID: bucket.userID }).lean();
  console.log(user)
  bucket.name = user.name;

  res.status(200).json(bucket);
});

router.post("/select-upvote", async function (req, res) {
  const { imageID, bucketID } = req.body;

  

  const bucket = await Bucket.findOneAndUpdate(
    { bucketID: bucketID, "imageCardDetails.imageID": imageID },
    {
      $inc: {
        "imageCardDetails.$.votes.upvotes": 1,
      },
    }
  );
  res.status(200).json({
    status: "success",
  });
});
router.post("/unselect-upvote", async function (req, res) {
  const { imageID, bucketID } = req.body;

  const bucket = await Bucket.findOneAndUpdate(
    { bucketID: bucketID, "imageCardDetails.imageID": imageID },
    {
      $inc: {
        "imageCardDetails.$.votes.upvotes": -1,
      },
    }
  );
  res.status(200).json({
    status: "success",
  });
});
router.post("/select-downvote", async function (req, res) {
  const { imageID, bucketID } = req.body;

  const bucket = await Bucket.findOneAndUpdate(
    { bucketID: bucketID, "imageCardDetails.imageID": imageID },
    {
      $inc: {
        "imageCardDetails.$.votes.downvotes": 1,
      },
    }
  );
  res.status(200).json({
    status: "success",
  });
});
router.post("/unselect-downvote", async function (req, res) {
  const { imageID, bucketID } = req.body;

  const bucket = await Bucket.findOneAndUpdate(
    { bucketID: bucketID, "imageCardDetails.imageID": imageID },
    {
      $inc: {
        "imageCardDetails.$.votes.downvotes": -1,
      },
    }
  );
  res.status(200).json({
    status: "success",
  });
});

router.post("/usdown-sup", async function (req, res) {
  const { imageID, bucketID } = req.body;

  const bucket = await Bucket.findOneAndUpdate(
    { bucketID: bucketID, "imageCardDetails.imageID": imageID },
    {
      $inc: {
        "imageCardDetails.$.votes.downvotes": -1,
        "imageCardDetails.$.votes.upvotes": 1,
      },
    }
  );
  res.status(200).json({
    status: "success",
  });
});

router.post("/usup-sdown", async function (req, res) {
  const { imageID, bucketID } = req.body;

  const bucket = await Bucket.findOneAndUpdate(
    { bucketID: bucketID, "imageCardDetails.imageID": imageID },
    {
      $inc: {
        "imageCardDetails.$.votes.downvotes": 1,
        "imageCardDetails.$.votes.upvotes": -1,
      },
    }
  );
  res.status(200).json({
    status: "success",
  });
});


router.post("/select-reaction", async function (req, res) {
  const { imageID, bucketID, reaction } = req.body;

  if (reaction === "confetti") {
    const bucket = await Bucket.findOneAndUpdate(
      { bucketID: bucketID, "imageCardDetails.imageID": imageID },
      {
        $inc: {
          "imageCardDetails.$.reactions.confetti": 1,
        },
      }
    );
    res.status(200).json({
      status: "success",
    });
  } else if (reaction === "heart") {
    const bucket = await Bucket.findOneAndUpdate(
      { bucketID: bucketID, "imageCardDetails.imageID": imageID },
      {
        $inc: {
          "imageCardDetails.$.reactions.heart": 1,
        },
      }
    );
    res.status(200).json({
      status: "success",
    });
  } else if (reaction === "wow") {
    const bucket = await Bucket.findOneAndUpdate(
      { bucketID: bucketID, "imageCardDetails.imageID": imageID },
      {
        $inc: {
          "imageCardDetails.$.reactions.wow": 1,
        },
      }
    );
    res.status(200).json({
      status: "success",
    });
  } else if (reaction === "dislike") {
    const bucket = await Bucket.findOneAndUpdate(
      { bucketID: bucketID, "imageCardDetails.imageID": imageID },
      {
        $inc: {
          "imageCardDetails.$.reactions.dislike": 1,
        },
      }
    );
    res.status(200).json({
      status: "success",
    });
  }
});
router.post("/unselect-reaction", async function (req, res) {
  const { imageID, bucketID, reaction } = req.body;

  if (reaction === "confetti") {
    const bucket = await Bucket.findOneAndUpdate(
      { bucketID: bucketID, "imageCardDetails.imageID": imageID },
      {
        $inc: {
          "imageCardDetails.$.reactions.confetti": -1,
        },
      }
    );
    res.status(200).json({
      status: "success",
    });
  } else if (reaction === "heart") {
    const bucket = await Bucket.findOneAndUpdate(
      { bucketID: bucketID, "imageCardDetails.imageID": imageID },
      {
        $inc: {
          "imageCardDetails.$.reactions.heart": -1,
        },
      }
    );
    res.status(200).json({
      status: "success",
    });
  } else if (reaction === "wow") {
    const bucket = await Bucket.findOneAndUpdate(
      { bucketID: bucketID, "imageCardDetails.imageID": imageID },
      {
        $inc: {
          "imageCardDetails.$.reactions.wow": -1,
        },
      }
    );
    res.status(200).json({
      status: "success",
    });
  } else if (reaction === "dislike") {
    const bucket = await Bucket.findOneAndUpdate(
      { bucketID: bucketID, "imageCardDetails.imageID": imageID },
      {
        $inc: {
          "imageCardDetails.$.reactions.dislike": -1,
        },
      }
    );
    res.status(200).json({
      status: "success",
    });
  }
});

router.get("/home",grantAccess(), async function (req, res) {
  var bucket = await Bucket.find({userID:req.user.user_id}).lean();

  bucket.map((buc) => {
    buc.imageList = [];
    buc.votesOnBucket = 0;
    buc.imageCardDetails.map((img) => {
      buc.imageList.push(img.imgURL);
      buc.votesOnBucket = img.votes.upvotes+buc.votesOnBucket;
    });
  });
  res.status(200).json(bucket);
});

module.exports = router;
