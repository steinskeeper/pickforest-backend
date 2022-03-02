const mongoose = require("mongoose");
const imageschema = mongoose.Schema({
  
  imageID: { type: String, unique: true, required: true, index: true },
  imgURL: String,
  votes: {
    upvotes: {
      type: Number,
      default: 0,
      min:0
    },
    downvotes: {
      type: Number,
      default: 0,
      min:0
    },
  },
  reactions: {
    confetti: {
      type: Number,
      default: 0,
      min:0
    },
    wow: {
      type: Number,
      default: 0,
      min:0
    },
    heart: {
      type: Number,
      default: 0,
      min:0
    },
    dislike: {
      type: Number,
      default: 0,
      min:0
    },
  },
});
const bucketschema = mongoose.Schema({
  
  bucketID: { type: String, unique: true, required: true, index: true },
  bucketName: String,
  imageCardDetails: [imageschema],
  userID: { type: String, ref: "User", required: true },
  votingopen: String,
  expiryAt: Date,


},
{timestamps:true});

module.exports = mongoose.model("Bucket", bucketschema);
