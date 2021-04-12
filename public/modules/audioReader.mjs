import {prepareVoicesList, speakEasy, vocalizeMenu, readMenu, displayChoices, getInfos, reloadPage, getWords,
    helpCommands, emptyDomNode, autoclickOnNode, createAudioSource, capitalize} from "./tools.mjs";
import {getMessages} from "./messages.mjs";
import {getActions} from "./actions.mjs";

function audioReader (domtarget, lang_std) {
    "use strict";

    const current_context = "reader";
    let current_title = {};
    const messages = getMessages(lang_std);
    const actions = getActions(lang_std, current_context);
    const words = getWords(actions);

    let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
    let SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;

    let title_infos = document.getElementById("title_infos");
    if (!title_infos) {
        console.error("DOM target not found : title_infos");
        return;
    }

    let audioreader = document.getElementById(domtarget);
    if (!audioreader) {
        console.error("DOM target not found : "+domtarget);
        return;
    }

    let myAudioEl = audioreader.querySelector('[data-id=myAudio]');
    if (!myAudioEl) {
        console.error("DOM target not found : [data-id=myAudio]");
        return;
    }

    let vocal_menu = [];
    const menu_area = document.getElementById("choices_area");
    if (!menu_area) {
        console.error("DOM target not found : choices_area");
        return;
    } else {
        vocal_menu = vocalizeMenu(menu_area, messages);
    }

    if (title_id != "false") {
        if (sessionStorage.audioreader) {
            current_title = JSON.parse(sessionStorage.getItem("audioreader"));
            let tmpdesc = `${capitalize(messages.title)} : ${current_title.title.title}
            ${capitalize(messages.animated_by)} : ${current_title.title.artist}
            ${capitalize(messages.duration)}  : ${current_title.title.length}
            `;
            title_infos.innerText = tmpdesc;

            prepareTitle(current_title);

        } else {
            console.warn("Title description not found in sessionStorage");
            title_infos.innerHTML += " TITLE UNKNOWN !!" ;
        }
    } else {
        createAudioSource(myAudioEl, "/test/in_search_of_meaning.mp3");
    }

    let buttons = {};
    buttons.play = audioreader.querySelector('[data-btn=play]');
    buttons.play.addEventListener('click',
        function (e) {
            myAudioEl.play();
        })
    buttons.pause = audioreader.querySelector('[data-btn=pause]');
    buttons.pause.addEventListener('click',
        function (e) {
            myAudioEl.pause();
        })
    buttons.stop = audioreader.querySelector('[data-btn=stop]');
    buttons.stop.addEventListener('click',
        function (e) {
            myAudioEl.pause();
            myAudioEl.currentTime = 0;
        })
    buttons.skipahead = audioreader.querySelector('[data-btn=skipAhead]');
    buttons.skipahead.addEventListener('click',
        function (e) {
            let myCurrentTime = myAudioEl.currentTime;
            myAudioEl.currentTime = myCurrentTime + 5;
        })
    buttons.skipback = audioreader.querySelector('[data-btn=skipBack]');
    buttons.skipback.addEventListener('click',
        function (e) {
            let myCurrentTime = myAudioEl.currentTime;
            myAudioEl.currentTime = myCurrentTime - 5;
        })
    buttons.voldown = audioreader.querySelector('[data-btn=VolumeDown]');
    buttons.voldown.addEventListener('click',
        function (e) {
            let myCurrentVolume = myAudioEl.volume - .1;
            if (myCurrentVolume < 0) {
                myCurrentVolume = 0;
            }
            myAudioEl.volume = myCurrentVolume;
        })
    buttons.volup = audioreader.querySelector('[data-btn=volumeUp]');
    buttons.volup.addEventListener('click', function (e) {
        let myCurrentVolume = myAudioEl.volume + .1;
        if (myCurrentVolume > 1) {
            myCurrentVolume = 1;
        }
        myAudioEl.volume = myCurrentVolume;
    })
    buttons.stop.click();
    myAudioEl.controls = false; // hide standard controls
    myAudioEl.volume = 0.2;

    displayChoices('informations', actions);

    /**
     * Prepare the MP3 file (by copying the file inside the public directory)
     * @param title_params
     */
    function prepareTitle(title_params) {
        let apipath = window.location.href.replace("audioreader", "prepareAudioFile");

        let qryHeaders = new Headers({
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-store'
        });

        let fetch_options = {
            method: 'GET',
            headers: qryHeaders,
            mode: 'cors',
        };

        speakEasy(messages.prepinprogress, lang_std);

        let request = new Request(apipath, fetch_options);
        fetch(request)
            .then(function (response) {
                if (response.status !== 200) {
                    console.error('Bug calling the API prepareAudioFile, Status Code: ' + response.status);
                    speakEasy(messages.preperror, lang_std);
                    return;
                }

                response.json().then(function (data) {
                    console.warn('Fetch OK');
                    if (data.status == "OK") {
                        emptyDomNode(myAudioEl);
                        createAudioSource(myAudioEl, data.path);
                        speakEasy(messages.prepready, lang_std);
                    } else {
                        speakEasy(messages.preperror2, lang_std);
                    }

                });
            })
            .catch(function (err) {
                console.error('Fetch Error sur API '+key, err);
                speakEasy(messages.preperror, lang_std);
            });
    }

    /**
     * Analyze intention of the user
     * @param speechResult
     * @returns {{action: string, parameters: []}}
     */
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
     * Go to a specific position in the mp3, expressed in minutes or seconds
     * @param param
     * @returns {boolean}
     */
    function goto(param) {
        if (param.length < 2) {
            console.warn('Not enough data for goto action : ', param);
            return false;
        }
        let unity = param[param.length-1];
        let value = param[param.length-2];
        if (lang_std.includes('fr')) {
            if (value == 'une') {
                value = "1"; // TODO : it's a patch ! improve that later
            }
        }
        value = parseInt(value);
        if (value <= 0) {
            console.warn('Timer not correct for goto action : ', value);
            return false;
        }
        if (unity.includes(messages.sec) || unity.includes(messages.min)) {
            //let myCurrentTime = myAudioEl.currentTime;
            //myAudioEl.currentTime = myCurrentTime - 5;
            if (unity.includes(messages.sec)) {
                myAudioEl.currentTime = value; // value already defined in seconds
            } else {
                myAudioEl.currentTime = value * 60; // convert minutes to seconds
            }
            console.log('goto '+ value + ' ' + unity);
        } else {
            console.warn('Unity not recognized for goto action : ', unity);
            return false;
        }
        return true;
    }

    /**
     * Execute action identified by Voice Recognition
     * @param param
     * @param speechResult
     * @param confidence
     */
    function executeAction(param, speechResult, confidence) {
        if (param.intention == "") return;

        switch(param.intention) {
            case 'stop':{
                buttons.stop.click();
                break;
            }
            case 'play':{
                buttons.play.click();
                break;
            }
            case 'pause':{
                buttons.pause.click();
                break;
            }
            case 'ahead':{
                buttons.skipahead.click();
                break;
            }
            case 'back':{
                buttons.skipback.click();
                break;
            }
            case 'up':{
                buttons.volup.click();
                break;
            }
            case 'down':{
                buttons.voldown.click();
                break;
            }
            case 'down':{
                buttons.voldown.click();
                break;
            }
            case 'info': {
                getInfos(myAudioEl, messages);
                if (current_title.title) {
                    let msg = `${messages.title} : ${current_title.title.title}`;
                    speakEasy(msg, lang_std);
                    msg = `${messages.animated_by} : ${current_title.title.artist}`;
                    speakEasy(msg, lang_std);
                }
                break;
            }
            case 'reload': {
                reloadPage(messages);
                break;
            }
            case 'goto':{
                goto(param.parameters);
                break;
            }
            case 'helpcmd': {
                helpCommands(messages, actions);
                break;
            }
            case 'menu': {
                if (param.parameters.length > 1) {
                    autoclickOnNode(menu_area, param.parameters[1]);
                    break;
                }
            }
            case 'helpmenu': {
                readMenu(vocal_menu, lang_std, messages.lmenu);
                break;
            }
            default: {
                console.warn(`word not recognized (confidence : ${confidence}%)`);
                speakEasy(`${messages.nr} ${speechResult}`, lang_std);
            }
        }
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
        recognition.lang =  lang_std;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.start();

        recognition.onresult = function (event) {
            let result = event.results[0][0];
            let confidence = Math.ceil(result.confidence * 100);
            let speechResult = result.transcript.toLowerCase();

            let message = 'Speech received: ' + speechResult + '.';
            console.log(message);

            executeAction(analyzeAction(speechResult), speechResult, confidence);
        }

        recognition.onspeechend = function () {
            recognition.stop();
            setTimeout(()=>{
                prepareSpeech();
            }, 1000);
        }

        recognition.onerror = function (event) {
            console.error('Error occurred in recognition: ' + event.error);
            setTimeout(()=>{
                prepareSpeech();
            }, 1000);
        }

    }

    prepareVoicesList(prepareSpeech);
}

window.addEventListener("DOMContentLoaded", (event) => {
    "use strict";
    console.log("DOM completely loaded");

    function startPage(evt) {
        evt.preventDefault();
        // drop the event listener because we want to launch it only once
        document.body.removeEventListener('click', startPage, false);
        // start the audio reader
        audioReader('audioreader', lang_std);
    }

    document.body.addEventListener('click', startPage, false);
    document.body.click();
});
