var express = require('express');
var router = express.Router();

const {getConfig, getOptions} = require('../library/fileTools.js');
const config = getConfig();
const choices = getOptions(config);

/* GET users listing. */
router.get('/', function(req, res, next) {
  var title = 'Test Voice Recognition';
  res.render('testspeech2', { title, choices });
});

module.exports = router;
