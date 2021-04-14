import {displayChoices, prepareVoicesList, speakEasy, reloadPage, helpCommands, getWords,
    readMenu, vocalizeMenu, autoclickOnNode} from "./tools.mjs";
import { fixRecognition } from "./fixRecognition.mjs";
import {getMessages} from "./messages.mjs";
import {getActions} from "./actions.mjs";

function indexPage (username, lang_std) {
    "use strict";

    const messages = getMessages(lang_std);
    const context = "index";
    const actions = getActions(lang_std, context);
    const words = getWords(actions);

    const info_area = document.getElementById('info_area');
    if (!info_area) {
        console.error('Dom target not found of ID info_area');
        return;
    }

    let vocal_menu = [];
    const menu_area = document.getElementById("choices_area");
    if (!menu_area) {
        console.error("DOM target not found : choices_area");
        return;
    } else {
        vocal_menu = vocalizeMenu(menu_area, messages);
        if (vocal_menu.length == 1) {
            // if there's only one choice, let's go !
            //vocal_menu[0].node.click();
        }
    }

    function addInfo(message) {
        info_area.appendChild(document.createTextNode(message));
        info_area.appendChild(document.createElement('br'));
    }

    let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
    let SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;

    displayChoices('informations', actions);

    function firstQuestion() {
        let message1 = `${messages.wlc} ${username}`;
        addInfo(message1);
        speakEasy(message1, lang_std);
        let message2 = `${messages.wdoywtd}`;
        addInfo(message2);
        speakEasy(message2, lang_std);
        let message3 = `${messages.wdoywtn}`;
        addInfo(message3);
        speakEasy(message3, lang_std);

        readMenu(vocal_menu, lang_std);
        prepareSpeech();
    }

    prepareVoicesList(firstQuestion);

    /**
     * Execute action identified by Voice Recognition
     * @param param
     * @param speechResult
     * @param confidence
     */
    function executeAction(param, speechResult, confidence) {
        console.log(param);
        if (param.intention == "") {
            console.warn(`intention not understood (confidence : ${confidence}%)`);
            speakEasy(`${messages.nr} ${speechResult}`, lang_std);
            return;
        }

        switch (param.intention) {
            case 'menu':{
                let value = "";
                if (param.parameters.length > 0) {
                    // artibrary choice to take the last item of the array
                    value = fixRecognition(param.parameters[param.parameters.length-1], lang_std);
                }
                if (value != "") {
                    autoclickOnNode(menu_area, value);
                    break;
                }
            }
            case 'reload': {
                reloadPage(messages);
                break;
            }
            case 'helpcmd': {
                helpCommands(messages, actions);
                break;
            }
            case 'helpmenu': {
                readMenu(vocal_menu, lang_std, messages.lmenu);
                break;
            }
            default: {
                console.warn(`intention not understood (confidence : ${confidence}%)`);
                speakEasy(`${messages.nr} ${speechResult}`, lang_std);
            }
        }
    }

    function analyzeAction(speechResult) {
        let intention = "";
        let parameters = [];
        for(let i=0, imax=actions.length; i<imax && intention==""; i++) {
            let action = actions[i];
            action.words.forEach(word => {
                if (speechResult.includes(word)) {
                    intention = action.action;
                    if (action.exception) {
                        parameters = speechResult.trim().split(' ');
                    }
                }
            })
        }
        return {intention, parameters};
    }


    /**
     * Prepare the Speech API
     */
    function prepareSpeech() {
        let grammar = '#JSGF V1.0; grammar phrase; public <phrase> = ' + words + ';';
        let recognition = new SpeechRecognition();
        let speechRecognitionList = new SpeechGrammarList();
        speechRecognitionList.addFromString(grammar, 1);
        recognition.grammars = speechRecognitionList;
        recognition.lang = lang_std;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.start();

        recognition.onresult = function (event) {
            // The SpeechRecognitionEvent results property returns a SpeechRecognitionResultList object
            // The SpeechRecognitionResultList object contains SpeechRecognitionResult objects.
            // It has a getter so it can be accessed like an array
            // The first [0] returns the SpeechRecognitionResult at position 0.
            // Each SpeechRecognitionResult object contains SpeechRecognitionAlternative objects that contain individual results.
            // These also have getters so they can be accessed like arrays.
            // The second [0] returns the SpeechRecognitionAlternative at position 0.
            // We then return the transcript property of the SpeechRecognitionAlternative object
            let result = event.results[0][0];
            let confidence = Math.ceil(result.confidence * 100);
            let speechResult = result.transcript.toLowerCase();

            let message = 'Speech received: ' + speechResult + '.';
            console.log(message);

            executeAction(analyzeAction(speechResult), speechResult, confidence);
        }

        recognition.onspeechend = function () {
            recognition.stop();
            setTimeout(() => {
                prepareSpeech();
            }, 1000);
        }

        recognition.onerror = function (event) {
            console.error('Error occurred in recognition: ' + event.error);
            setTimeout(() => {
                prepareSpeech();
            }, 1000);
        }
    }

}

window.addEventListener("DOMContentLoaded", (event) => {
    "use strict";
    console.log("DOM completely loaded");

    function startPage(evt) {
        evt.preventDefault();
        // drop the event listener because we want to launch it only once
        document.body.removeEventListener('click', startPage, false);
        // start the audio reader
        indexPage(global.username, global.lang_std);
    }

    document.body.addEventListener('click', startPage, false);
    document.body.click();
});


