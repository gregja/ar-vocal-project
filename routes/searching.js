const express = require('express');
const router = express.Router();

const {getConfig, getOptions} = require('../library/fileTools.js');

const {getTranslations} = require("../library/translations.js");

const app = express();
app.use('/', express.static(__dirname + '/public'));

const config = getConfig();
const choices = getOptions(config);
const param = config.param;

const messages = getTranslations(param.lang_std);
const title = messages.searching_title;

function manageRequest(req, res, next) {
  let context = req.params.context || "podcast";
  console.log(req.params);
  res.render("searching", { title: `${title} ${context}`, param, choices, context });
}

/* GET kids listing. */
router.get('/', manageRequest);
router.get('/:context', manageRequest);

module.exports = router;
