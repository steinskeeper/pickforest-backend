var express = require("express");
var router = express.Router();

var Bucket = require("../models/Bucket");
const grantAccess = require("../utils/verifytoken");
var multer = require("multer");
const { nanoid } = require("nanoid");
const mongoose = require("mongoose");

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

      console.log(images);
      var imagecard = [];
      images.map((pic) => {
        imagecard.push({
          imageID: nanoid(),
          imgURL: pic.path,
        });
      });

      var data = {
        bucketName: bucketname,
        userID: req.user.user_id,
        bucketID: nanoid(),
        imageCardDetails: imagecard,
      };
      console.log(data);
      const bucket = await Bucket.create(data);

      res.status(200).json({
        status: "success",
        data: bucket,
      });
    } catch (err) {
      return res.json({
        message: "error",
        details: "Failed to Reterive Data",
      });
    }
  }
);
router.get("/get/:id", async (req, res) => {
    var bucket = await Bucket.findOne({ bucketID: req.params.id });
    

    res.status(200).json(bucket);
  });

router.post("/select-upvote", async function (req, res) {
    const{imageID,bucketID} = req.body
    
    const bucket = await Bucket.findOneAndUpdate({ bucketID: bucketID,'imageCardDetails.imageID':imageID }, {

        $inc:{
            'imageCardDetails.$.votes.upvotes':1,
        }
    })
    res.status(200).json({
        status: "success",
        
      });
})
router.post("/unselect-upvote", async function (req, res) {
    const{imageID,bucketID} = req.body
    
    const bucket = await Bucket.findOneAndUpdate({ bucketID: bucketID,'imageCardDetails.imageID':imageID }, {

        $inc:{
            'imageCardDetails.$.votes.upvotes':-1,
        }
    })
    res.status(200).json({
        status: "success",
        
      });
})
router.post("/select-downvote", async function (req, res) {
    const{imageID,bucketID} = req.body
    
    const bucket = await Bucket.findOneAndUpdate({ bucketID: bucketID,'imageCardDetails.imageID':imageID }, {

        $inc:{
            'imageCardDetails.$.votes.downvotes':1,
        }
    })
    res.status(200).json({
        status: "success",
        
      });
})
router.post("/unselect-downvote", async function (req, res) {
    const{imageID,bucketID} = req.body
    
    const bucket = await Bucket.findOneAndUpdate({ bucketID: bucketID,'imageCardDetails.imageID':imageID }, {

        $inc:{
            'imageCardDetails.$.votes.downvotes':-1,
        }
    })
    res.status(200).json({
        status: "success",
        
      });
})

router.post("/select-reaction", async function (req, res) {
    const{imageID,bucketID,reaction} = req.body
    
    const bucket = await Bucket.findOneAndUpdate({ bucketID: bucketID,'imageCardDetails.imageID':imageID }, {

        $inc:{
            'imageCardDetails.$.reactions.':1,
        }
    })
    res.status(200).json({
        status: "success",
        
      });
})
router.post("/unselect-downvote", async function (req, res) {
    const{imageID,bucketID} = req.body
    
    const bucket = await Bucket.findOneAndUpdate({ bucketID: bucketID,'imageCardDetails.imageID':imageID }, {

        $inc:{
            'imageCardDetails.$.votes.downvotes':-1,
        }
    })
    res.status(200).json({
        status: "success",
        
      });
})





module.exports = router;