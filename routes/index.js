var express = require('express');
var router = express.Router();

const {getConfig, getOptions} = require('../library/fileTools.js');
const config = getConfig();
const choices = getOptions(config);
const param = config.param;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { param, choices, title:"Audio-Reader Vocal Project" });
});

module.exports = router;
