const mongoose = require("mongoose");

const treeschema = mongoose.Schema({
  treeID: String,
  url: String,
  title: String,
  emoji: String,
});


const userschema = mongoose.Schema({
  
  userID: {type:String,unique:true,required:true,index:true},
  name: String,
  subname: { type: String,unique: true,sparse: true },
  coverURL: String,
  pfp: String,
  email: { type: String,unique: true },
  trees: [treeschema]
  
});

module.exports = mongoose.model("User", userschema);
