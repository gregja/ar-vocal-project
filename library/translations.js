
function getTranslations(lang) {
    if (lang == "fr-FR") {
        return require('./lang/messages_fr-FR.json');
    }
    return require('./lang/messages_en-US.json');
}

module.exports = { getTranslations };

