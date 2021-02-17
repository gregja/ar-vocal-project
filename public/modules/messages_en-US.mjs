/**
 * get the messages defined for the app in english
 * @returns {{sec: string, dur: string, min: string, nr: string, lis: string, wlc: string}}
 */
export function getMessages_enUS() {
    var messages = {
        "nr": "word not recognized",
        "hour": "hour",
        "min": "minute",
        "sec": "second",
        "dur": "The duration of the MP3 is ",
        "lis": "You listened ",
        "wlc" : "Welcome ",
        "wdoywtd" : "What do you want to do ?",
        "wdoywtl" : "Which XX do you want to listen ?",
        "wdoywts": "Use the keyword 'search' followed by the desired criterion. ",
        "wdoywtn": "Use the keyword 'menu' followed by the desired number. ",
        "reload": "The page will be reloaded in XX seconds",
        "lcmd": "command list",
        "lmenu": "Help about menu",
        "choice": "choice",
        "menu": "menu",
        "id": "id",
        "title": "title",
        "album": "album",
        "artist": "artist",
        "length": "length",
        "duration": "duration",
        "unknown" : "unknown",
        "animated_by": "Show presented by",
        "dur_unk": "Duration not specified",
        "notfound": "I did not find anything on",
        "newsearch": "New search ?",
        "find1": "I found one reference on",
        "findX": "Number of references found for",
        "choicenotfound": "Datas not found for choice ",
        "prepinprogress": "Preparation of the title in progress",
        "preperror": "A bug occurred during the preparation of the audio file, impossible listening",
        "prepready": "Title ready to listen",
        "preperror2": "A bug occurred, the requested audio file could not be found",
        "firstX": "Here Are the first XX",
        "listen_podcast" : "listen podcast",
        "listen_music": "listen music",
        "listen_audiobook": "listen audiobook",
        "test_audioreader": "test audioreader",
        "test_speechsynthesis": "test speech synthesis",
        "test_voicerecognition": "test voice recognition",
        "home": "home"
    };
    return messages;
}
