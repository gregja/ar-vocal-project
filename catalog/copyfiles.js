/*
  This script is a small tool to copy quickly some podcasts from a disk to another
  by searching on a keyword hardly defined in the constant "keyword"
 */

const fs = require("fs");

const podcast_datas = require('../datas/podcast.json');
const podcast_paths = require('../datas/podcast_path.json');

const destination = "D:/podcasts/";
const keyword = "jeux vidéo";

podcast_datas.podcast.forEach(item => {
    let title = item.title.toLowerCase();
    let album = item.album.toLowerCase();
    if (title.includes(keyword) || album.includes(keyword)) {
        let tmpfile = podcast_paths.podcast.find(file => file.id == item.id);
        if (tmpfile) {
            let complete_path = tmpfile.path;
            let goodfile = complete_path.split('/').pop();
            fs.copyFile(complete_path, destination+"/"+goodfile, (err) => {
                if (err) {
                    console.log("Error Found:", err);
                    console.error(" => file "+complete_path);
                } else {
                    console.log("copy complete for "+ goodfile);
                }
            });

        }
    }
});

