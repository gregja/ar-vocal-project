const express = require('express');
const router = express.Router();
const fs = require("fs");

function manageRequest(req, res, next) {
    var context = req.params.context || "podcast";
    var title_id = req.params.id || false;
    let file_paths = require(`../datas/${context}_path.json`)[context];
    let file_selected = file_paths.find(file => file.id == title_id);
    let newfile = `/audiofiles/${context}-audiofile.mp3`;
    let destination = `./public${newfile}`;

    fs.copyFile(file_selected.path, destination, (err) => {
        if (err) {
            console.error("Error Found:", err);
            res.send({ "status": "KO", "message": "fnf" });
        } else {
            // Get the current filenames
            // after the function
            console.warn("copy of the MP3 file complete");
            res.send({ "status": "OK", "path": newfile });
        }
    });
}

/* GET users listing. */
router.get('/:context-:id', function (req, res, next) {
    manageRequest(req, res, next);
});

module.exports = router;
