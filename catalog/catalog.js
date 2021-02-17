const NodeID3 = require('node-id3');

const {getFiles, replaceAll, getConfig, writeFile} = require('../library/fileTools.js');
const path_datas = '../datas/';

const categories = getConfig().categories;
const options = {
    noRaw: true                  // don't generate raw object (default: false)
};


/**
 * Cleaning of the string
 * because a lot MP3 tags contains bad ' which are maybe the result of a loss of data during encoding
 * @param data
 * @returns {string}
 */
function cleanTitle(data) {
    // protect the "good" ? (with a blank in front and behind) replacing it by a special character
    let step01 = replaceAll(data, " ? ", " | ");
    // the ' alone (with a blank in front and behind) is an ?
    let step02 = replaceAll(step01, " ' ", " ? ");
    // protect the double ''
    let step03 = replaceAll(step02, "''", " $ ");
    // replace the bad ? (without blanks in front and behing) by ' (because this is the good value)
    let step04 = replaceAll(step03, "?", "'");
    // restaure the good ?
    let step05 = replaceAll(step04, " | ", " ? ");
    // restaure the good '
    let step06 = replaceAll(step05, " $ ", "'");
    return step06;
}

/**
 * Extract hours and minutes from the length field
 * @param value
 * @returns {{min: number, hour: number}}
 */
function analyseLength(value) {
    let duration = {hour: 0, min: 0, sec:0};
    let timer = value.split('h');
    if (timer.length > 1) {
        duration.hour = parseInt(timer[0]);
        let timer2 = timer[1].split('m');
        duration.min = parseInt(timer2[0]);
        duration.sec = parseInt(timer2[1]);
    }
    return duration;
}

categories.filter(categ => categ.parsing).forEach(categ => {

    let path = categ.path;   // +'/alan_turing'; // (chemin provisoire pour tests)
    //let path = "C:\\Users\\grego\\Documents\\Dev\\nodeworks\\bretproject\\mp3files\\alan_turing"; // (chemin provisoire pour tests)

    let explore = getFiles(path, '.mp3');
    let max = explore.length;

    console.log(`Count of mp3 files on "${categ.type}" category before analyzing => `, max);

    let mp3_tags = [];
    let mp3_files = [];
    let errors = [];

    let ids = 0;
    explore.forEach(file => {
        NodeID3.read(file, options, function(err, tags) {
            ids++;

            if (tags.title) {
                tags.title = cleanTitle(tags.title);
            }
            if (tags.album) {
                tags.album = cleanTitle(tags.album);
            }
            if (tags.comment) {
                // simplify content of tags.comment
                if (tags.comment.text) {
                    tags.comment = String(tags.comment.text);
                } else {
                    tags.comment = String(tags.comment);
                }
                tags.comment = cleanTitle(tags.comment);
            } else {
                tags.comment = "";
            }

            let tags2 = {};
            tags2.id = ids;
            ["album", "title", "artist", "copyright", "fileUrl", "encodedBy", "date", "comment", "length"].forEach(item => {
                if (tags.hasOwnProperty(item)) {
                    tags2[item] = tags[item];
                } else {
                    tags2[item] = "";
                }
            })

            if (tags2.title.includes(tags2.date)) {
                tags2.title = tags2.title.replace(tags2.date, "");
            }

            tags2.nb_readings = 0;
            tags2.last_reading = null;
            tags2.duration = analyseLength(tags2.length);
            tags2.durmin = tags2.duration.hour * 60 + tags2.duration.min;

            // use the directories to classify, because I classed my podcasts like this (to personalize for your needs)
            tags2.category = "";
            if (tags2.fileUrl.includes('philosophie')) {
                tags2.category = "philosophie";
            } else {
                if (tags2.fileUrl.includes('science')) {
                    tags2.category = "science";
                } else {
                    if (tags2.fileUrl.includes('musique_electro')) {
                        tags2.category = "musique électro";
                    }
                }
            }

            mp3_tags.push(tags2);
            mp3_files.push({
                id: ids,
                path: file
            });

            if (ids>=max) {
                setTimeout(()=>{
                    console.log("Count of mp3 files => ", ids);
                    console.log("Count of errors => ", errors.length);

                    let tmp_main_file = {};
                    tmp_main_file[categ.type] = mp3_tags;
                    let tmp_anex_file = {};
                    tmp_anex_file[categ.type] = mp3_files;

                    writeFile(path_datas+categ.type+'.json', JSON.stringify(tmp_main_file));
                    writeFile(path_datas+categ.type+'_path.json', JSON.stringify(tmp_anex_file));
                }, 3000);

            }
        })

    })

});

/*

Standards MP3 tags
album: 'Des marguerites à l?ordinateur',
    copyright: 'Radio France',
    fileUrl: 'https://www.franceculture.fr/emissions/grande-traversee-lenigmatique-alan-turing/des-marguerites-a-lordinateur',
    encodedBy: 'Radio France',
    date: '14.08.2018',
    recordingDates: '14.08.2018',
    title: "Grande traversée : l'énigmatique Alan Turing",
    comment: {
    language: '',
        shortText: undefined,
        text: 'durée  01h49m03s - En 1945, après son apport décisif dans le cassage des codes de l?Enigma allemande pendant la guerre, Turing poursuit ses travaux sur les machines et contribue à la naissance de l?informatique. Retour aux origines d?une intelligence hors-normes.\r\n' +
    '\r\n'
},
unsynchronisedLyrics: {
    language: '',
        shortText: undefined,
        text: 'durée  01h49m03s - En 1945, après son apport décisif dans le cassage des codes de l?Enigma allemande pendant la guerre, Turing poursuit ses travaux sur les machines et contribue à la naissance de l?informatique. Retour aux origines d?une intelligence hors-normes.\r\n' +
    '\r\n'
},
image: {
    mime: 'jpeg',
        type: [Object],
        description: undefined,
        imageBuffer: <Buffer ff d8 ff e1 09 50 68 74 74 70 3a 2f 2f 6e 73 2e 61 64 6f 62 65 2e 63 6f 6d 2f 78 61 70 2f 31 2e 30 2f 00 3c 3f 78 70 61 63 6b 65 74 20 62 65 67 69 6e ... 550738 more bytes>
},
length: '01h49m03s',
    genre: 'Podcast',
*/