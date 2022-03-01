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

router.post("/update-namepic",grantAccess(),upload.single('pfp'), async function (req, res) {
    try{  
      const username = req.body.username
      const user_id = req.user.user_id;
      const pfp = req.file
      const subname = req.body.subname
      const user = await User.findOneAndUpdate({ userID: user_id }, {
        name: username,
        pfp: pfp.path,
        subname: subname,
      });
  
      res.status(200).json({
        status: "success",
        message: "User updated",
  
      });
      
    }
    catch (err){
      console.log(err)
    }
  });

router.post("/create-tree",grantAccess(), async function (req, res) {
const {url,title,emoji } = req.body
const user_id = req.user.user_id;
var treeID = new mongoose.Types.ObjectId();
const user = await User.findOneAndUpdate({ userID: user_id }, {
    $push:{trees: {
        treeID: treeID,
        url: url,
        title: title,
        emoji: emoji,
    }}
    
});
res.status(200).json({
    status: "success",
    message: "Tree Added",

  });

})

router.post("/update-tree",grantAccess(), async function (req, res) {
    const {treeID,url,title,emoji } = req.body
    const user_id = req.user.user_id;
    
    const user = await User.findOneAndUpdate({ userID: user_id,'trees.treeID':treeID }, {
        $set:{'trees.$': {
            treeID: treeID,
            url: url,
            title: title,
            
        }},
        
        
    },
    { new: true, overwrite: true });
    res.status(200).json({
        status: "success",
        message: "Tree Updated",
    
      });
    
    })

router.post("/delete-tree",grantAccess(), async function (req, res) {
        const {treeID} = req.body
        const user_id = req.user.user_id;
        
        const user = await User.findOneAndUpdate({ userID: user_id }, {
            $pull:{trees: {
                treeID: treeID,
               
                
            }},
            
            
        },
        { new: true});
        res.status(200).json({
            status: "success",
            message: user,
        
          });
        
        })
module.exports = router;

