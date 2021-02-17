var express = require('express');
var router = express.Router();

const {getConfig, getOptions} = require('../library/fileTools.js');

const config = getConfig();
const choices = getOptions(config);

function manageRequest(req, res, next) {
    var context = req.params.context || "podcast";
    var title_id = req.params.id || false;

    var title = 'Audio reader';
    if (!title_id) {
        title += ' (test mode)';
    }

    res.render('audioreader', {title, param: config.param, choices, context, title_id});
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
