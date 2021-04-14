var express = require('express');
var router = express.Router();

const {getTranslations} = require("../library/translations.js");

const {getConfig, getOptions} = require('../library/fileTools.js');
const config = getConfig();
const choices = getOptions(config);
const param = config.param;

const messages = getTranslations(param.lang_std);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { param, choices, title:messages.index_title });
});

module.exports = router;
