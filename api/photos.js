var express = require("express");
var router = express.Router();

router.post("/getimg",async function (req, res) {
const{imgURL}=req.body;
const path = require("path");
res.sendFile(path.join(__dirname, "../",imgURL));
})
router.post("/getpfp",async function (req, res) {
    const{pfp}=req.body;
    const path = require("path");
    res.sendFile(path.join(__dirname, "../",pfp));
    })

module.exports = router;

