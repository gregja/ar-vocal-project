/*
   Example inspired by this one : https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API
   with the addition of a patch proposed by Flavio Copes (for the "getVoices" function) during the JSBootcamp 2020
   and a patch to select the good gender in the case of choice "male/female" for the same language
   (https://2020.thejsbootcamp.com/)
 */
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

import {prepareVoicesList} from "./tools.mjs";

function testspeech2 () {
    "use strict";

    var default_lang = 'fr-FR';
    var phrase_default = "Personnalisez cette phrase à votre convenance";

    var inputForm = document.querySelector('form');
    var phrasePara = inputForm.querySelector('.phrase');
    var resultPara = inputForm.querySelector('.result');
    var diagnosticPara = inputForm.querySelector('.output');
    var testBtn = inputForm.querySelector('button');
    var inputTxt = inputForm.querySelector('input');
    var langSelect = inputForm.querySelector('select');

    function populateLangList(prmvoices) {
        let lstvoices = [];
        prmvoices.map(item => item.lang).forEach(item => {
            if (!lstvoices.find(element => element == item)) {
                lstvoices.push(item);
            }
        });
        if (lstvoices.length == 0) {
            // just in case of unaivability of the list of languages
            lstvoices = ['fr-FR', 'en-US', 'en-GB'];
        }
        // empty the select field of all the children if they exist
        while (langSelect.firstChild) {
            langSelect.removeChild(langSelect.firstChild);
        }
        lstvoices.forEach(voice => {
            let option = document.createElement('option');
            option.textContent = voice;
            if(voice == default_lang) {
                option.setAttribute('selected', 'selected');
            }
            option.setAttribute('value', voice);
            langSelect.appendChild(option);
        });
    }

    function prepareApp(prmvoices) {
        populateLangList(prmvoices);

        phrase.value = phrase_default;
        testBtn.addEventListener('click', testSpeech);
    }

    prepareVoicesList(prepareApp);

    function testSpeech() {
        testBtn.disabled = true;
        testBtn.textContent = 'Test in progress';

        let phrase = String(inputTxt.value).trim().toLowerCase();
        // To ensure case consistency while checking with the returned output text
        phrasePara.textContent = phrase;
        resultPara.textContent = 'Right or wrong?';
        resultPara.style.background = 'rgba(0,0,0,0.2)';
        diagnosticPara.textContent = '...diagnostic messages';

        var grammar = '#JSGF V1.0; grammar phrase; public <phrase> = ' + phrase +';';
        var recognition = new SpeechRecognition();
        var speechRecognitionList = new SpeechGrammarList();
        speechRecognitionList.addFromString(grammar, 1);
        recognition.grammars = speechRecognitionList;
        console.log("langSelect.value => ", langSelect.value);
        recognition.lang = langSelect.value;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.start();

        recognition.onresult = function(event) {
            // The SpeechRecognitionEvent results property returns a SpeechRecognitionResultList object
            // The SpeechRecognitionResultList object contains SpeechRecognitionResult objects.
            // It has a getter so it can be accessed like an array
            // The first [0] returns the SpeechRecognitionResult at position 0.
            // Each SpeechRecognitionResult object contains SpeechRecognitionAlternative objects that contain individual results.
            // These also have getters so they can be accessed like arrays.
            // The second [0] returns the SpeechRecognitionAlternative at position 0.
            // We then return the transcript property of the SpeechRecognitionAlternative object
            let result = event.results[0][0];
            var speechResult = result.transcript.toLowerCase();
            diagnosticPara.textContent = 'Speech received: ' + speechResult + '.';
            let confidence = Math.ceil(result.confidence * 100);
            if(speechResult === phrase) {
                resultPara.textContent = `I heard the correct phrase! (confidence : ${confidence} %)`;
                resultPara.style.background = 'lime';
            } else {
                if (confidence >= 90) {
                    resultPara.textContent = `That sounds not too bad. (confidence : ${confidence} %)`;
                    resultPara.style.background = 'orange';
                } else {
                    if (confidence > 80) {
                        resultPara.textContent = `That sounds weird but why not... (confidence : ${confidence} %)`;
                        resultPara.style.background = 'purple';
                    } else {
                        resultPara.textContent = `That didn't sound right. (confidence : ${confidence} %)`;
                        resultPara.style.background = 'red';
                    }
                }
            }
        }

        recognition.onspeechend = function() {
            recognition.stop();
            testBtn.disabled = false;
            testBtn.textContent = 'Start new test';
        }

        recognition.onerror = function(event) {
            testBtn.disabled = false;
            testBtn.textContent = 'Start new test';
            diagnosticPara.textContent = 'Error occurred in recognition: ' + event.error;
        }

        recognition.onaudiostart = function(event) {
            //Fired when the user agent has started to capture audio.
            console.log('SpeechRecognition.onaudiostart');
        }

        recognition.onaudioend = function(event) {
            //Fired when the user agent has finished capturing audio.
            console.log('SpeechRecognition.onaudioend');
        }

        recognition.onend = function(event) {
            //Fired when the speech recognition service has disconnected.
            console.log('SpeechRecognition.onend');
        }

        recognition.onnomatch = function(event) {
            //Fired when the speech recognition service returns a final result with no significant recognition. This may involve some degree of recognition, which doesn't meet or exceed the confidence threshold.
            console.log('SpeechRecognition.onnomatch');
        }

        recognition.onsoundstart = function(event) {
            //Fired when any sound — recognisable speech or not — has been detected.
            console.log('SpeechRecognition.onsoundstart');
        }

        recognition.onsoundend = function(event) {
            //Fired when any sound — recognisable speech or not — has stopped being detected.
            console.log('SpeechRecognition.onsoundend');
        }

        recognition.onspeechstart = function (event) {
            //Fired when sound that is recognised by the speech recognition service as speech has been detected.
            console.log('SpeechRecognition.onspeechstart');
        }
        recognition.onstart = function(event) {
            //Fired when the speech recognition service has begun listening to incoming audio with intent to recognize grammars associated with the current SpeechRecognition.
            console.log('SpeechRecognition.onstart');
        }
    }

}

window.addEventListener("DOMContentLoaded", (event) => {
    "use strict";
    console.log("DOM completely loaded");

    testspeech2();
});
