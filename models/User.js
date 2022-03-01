const mongoose = require("mongoose");

const treeschema = mongoose.Schema({
  treeID: { type: mongoose.Schema.Types.ObjectId, unique: true, required: true, index: true },
  url: String,
  title: String,
  emoji: String,
});


const userschema = mongoose.Schema({
  
  userID: {type:String,unique:true,required:true,index:true},
  name: String,
  subname: String,
  coverURL: String,
  pfp: String,
  email: String,
  trees: [treeschema]
  
});

module.exports = mongoose.model("User", userschema);
