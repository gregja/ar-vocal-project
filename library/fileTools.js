const fs = require('fs');
const path = require('path');

/**
 * Parse a directory recursively and retrieve the list of all files
 * @param dir
 * @param fileType
 * @param files_
 * @returns {*|*[]}
 */
function getFiles (dir, fileType, files_){
    files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (let i in files){
        let file = files[i];
        let name = dir + '/' + file;
        //console.log(name);
        if (fs.statSync(name).isDirectory()){
            getFiles(name, fileType, files_);
        } else {
            if (path.extname(file).toLowerCase() === fileType) {
                files_.push(name);
            }
        }
    }
    return files_;
}

const root = require('./root'); // In root will be absolute path to your application


/**
 * Retrieve the content of the file appconfig.json
 * @returns {any}
 */
function getConfig() {
    let path = root+'/../appconfig.json';
    let datas = fs.readFileSync(path);
    return JSON.parse(datas);
}

/**
 * Retrieve the options (active or not) of the file appconfig.json
 * @param config
 * @param active
 * @returns {T[]|string[]|string}
 */
function getOptions(config, active=true) {
    if (!config.hasOwnProperty('categories')) {
        console.warn ('no categories defined in the file appcongif.json');
        return [];
    }
    let choices = [];
    if (active) {
        choices = config.categories.filter(categ => categ.active);
    } else {
        choices = config.categories;
    }
    console.log(choices);
    let num = 0;
    choices.forEach((item, id) => {
        num++;
        choices[id]["id"] = num;
    });
    return choices;
}

function writeFile(path, data) {
    return fs.writeFileSync(path, data);
}

function chunk (arr, len, dispatch = true) {
    var chunks = [],
        i = 0,
        n = arr.length;
    while (i < n) {
        chunks.push(arr.slice(i, i += len));
    }

    if (chunks.length > len && dispatch) {
        let num_dispatch = 0;
        chunks[chunks.length - 1].forEach(item => {
            chunks[num_dispatch].push(item);
            num_dispatch++;
        });
        chunks[chunks.length - 1] = [];
    }

    return chunks.filter(function (el) {
        return el.length > 0;
    });
}

/**
 * Replace all occurrences of the "search" criteria by the "replace" value
 * @param string
 * @param search
 * @param replace
 * @returns {string}
 */
function replaceAll(string, search, replace) {
    return string.split(search).join(replace);
}

module.exports = {
    getFiles: getFiles,
    chunk: chunk,
    getConfig: getConfig,
    getOptions: getOptions,
    writeFile: writeFile,
    replaceAll: replaceAll
}
