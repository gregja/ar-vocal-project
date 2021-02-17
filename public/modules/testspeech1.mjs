/*
   Example inspired by this one : https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API
   with the addition of a patch proposed by Flavio Copes (for the "getVoices" function) during the JSBootcamp 2020
   and a patch to select the good gender in the case of choice "male/female" for the same language
   (https://2020.thejsbootcamp.com/)
 */
import {prepareVoicesList, speakEasy} from "./tools.mjs";

function testspeech1 () {
    "use strict";

    var default_lang = 'fr-FR';
    var synth = window.speechSynthesis;

    var inputForm = document.querySelector('form');
    var inputTxt = inputForm.querySelector('.txt');
    var voiceSelect = inputForm.querySelector('select');
    var pitch = inputForm.querySelector('#pitch');
    var pitchValue = inputForm.querySelector('.pitch-value');
    var rate = inputForm.querySelector('#rate');
    var rateValue = inputForm.querySelector('.rate-value');
    var volume = inputForm.querySelector('#volume');
    var volumeValue = inputForm.querySelector('.volume-value');

    var lstvoices = [];  // array to backup the list of voices retrieved by the getVoices function
                         // because we need it in case of 2 or more voices for the same language

    function populateVoiceList(prmvoices) {
        lstvoices = prmvoices;
        console.log(lstvoices);
        let voices = prmvoices.sort(function (a, b) {
            const aname = a.name.toUpperCase(), bname = b.name.toUpperCase();
            if ( aname < bname ) return -1;
            else if ( aname == bname ) return 0;
            else return +1;
        });
        // empty the select field of all the children if they exist
        while (voiceSelect.firstChild) {
            voiceSelect.removeChild(voiceSelect.firstChild);
        }
        for(let i = 0, imax=voices.length; i < imax ; i++) {
            let voice = voices[i];
            let option = document.createElement('option');
            option.textContent = voice.name + ' (' + voice.lang + ')';
            if(voice.lang == default_lang) {
                option.setAttribute('selected', 'selected');
            }
            option.setAttribute('value', voice.lang);
            option.setAttribute('data-lang', voice.lang);
            option.setAttribute('data-name', voice.name);
            voiceSelect.appendChild(option);
        }
    }

    prepareVoicesList(populateVoiceList);

    function speak(){
        if (synth.speaking) {
            console.error('speechSynthesis.speaking');
            return;
        }
        if (inputTxt.value !== '') {
            if (voiceSelect.selectedOptions.length) {
                let selected = voiceSelect.selectedOptions[0];
                let selected_lang = selected.getAttribute('data-lang');
                let selected_voice = selected.getAttribute('data-name');

                let goodvoice = lstvoices.filter(voice => voice.name == selected_voice);
                if (goodvoice.length) {
                    goodvoice = goodvoice[0]; // we select the first item
                } else {
                    goodvoice = null;
                }

                //let selectedOption = voiceSelect.selectedOptions[0];
                console.log("language selected => ", selected_lang);
                console.log("voice selected => ", selected_voice);
                console.log("voice object selected => ", goodvoice);

                speakEasy(inputTxt.value, selected_lang, goodvoice, pitch.value, rate.value, volume.value);
            } else {
                console.warn('No language selected');
            }
        }
    }

    inputForm.onsubmit = function(event) {
        event.preventDefault();
        speak();
        inputTxt.blur();
    }

    pitch.onchange = function() {
        pitchValue.textContent = pitch.value;
    }

    rate.onchange = function() {
        rateValue.textContent = rate.value;
    }

    volume.onchange = function() {
        volumeValue.textContent = volume.value;
    }

    voiceSelect.onchange = function(){
        speak();
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
        testspeech1();
    }

    document.body.addEventListener('click', startPage, false);
    document.body.click();
});
