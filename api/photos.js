var express = require("express");
var router = express.Router();

router.get("/getimg/:url",async function (req, res) {

const path = require("path");
res.sendFile(path.join(__dirname, "../",req.params.url));
})
router.get("/getpfp/:url",async function (req, res) {
    
    const path = require("path");
    res.sendFile(path.join(__dirname, "../",req.params.url));
    })

module.exports = router;

