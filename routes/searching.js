var express = require('express');
var router = express.Router();

const {getConfig, getOptions} = require('../library/fileTools.js');

var app = express();
app.use('/', express.static(__dirname + '/public'));

const title = 'Searching';
const config = getConfig();
const choices = getOptions(config);

function manageRequest(req, res, next) {
  var context = req.params.context || "podcast";
  res.render("searching", { title: `${title} ${context}`, param:config.param, choices, context });
}

/* GET kids listing. */
router.get('/', manageRequest);
router.get('/:context', manageRequest);

module.exports = router;
