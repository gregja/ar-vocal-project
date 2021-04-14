const express = require('express');
const router = express.Router();

const {getConfig, getOptions} = require('../library/fileTools.js');

const {getTranslations} = require("../library/translations.js");

const config = getConfig();
const choices = getOptions(config);
const param = config.param;

const messages = getTranslations(param.lang_std);

function manageRequest(req, res, next) {
    let context = req.params.context || "podcast";
    let title_id = req.params.id || false;

    let title = messages.audioreader_title;
    if (!title_id) {
        title += ' (test mode)';
    }

    res.render('audioreader', {title, param: config.param, choices, title_id});
}

/* GET users listing. */
router.get('/', function (req, res, next) {
    manageRequest(req, res, next);
});

/* GET users listing. */
router.get('/:context-:id', function (req, res, next) {
    manageRequest(req, res, next);
});

module.exports = router;
