/**
 * Get a random choice in an array
 * @param datas
 * @returns {number}
 */
export function randomChoice(datas) {
    var number = Math.floor(Math.random() * datas.length);
    return number;
}

/**
 * Use the Speech API to make a talkative browser ;)
 * @param message
 * @param lang_std
 * @param voice
 * @param pitch
 * @param rate
 * @param volume
 */
export const speakEasy = (message, lang_std="fr-FR", voice=null, pitch=1, rate=1, volume=0.5) => {
    message = message.trim();
    if (message !== '') {
        let utterThis = new SpeechSynthesisUtterance(message);
        /*
        utterThis.onend = function (event) {
            console.log('SpeechSynthesisUtterance.onend');
        }
        utterThis.onerror = function (event) {
            console.error('SpeechSynthesisUtterance.onerror ', event);
        }
         */
        utterThis.pitch = pitch;
        utterThis.rate = rate;
        utterThis.volume = volume;
        utterThis.lang = lang_std;
        if (voice) {
            utterThis.voice = voice;
        }
        //console.log(utterThis);
        speechSynthesis.speak(utterThis);
    }
}

/**
 * Tip to make the WebSpeech getVoices function compatible with Chrome
 * Solution proposed by Flavio Copes on the JSBootcamp (https://2020.thejsbootcamp.com/)
 * @returns {Promise<unknown>}
 */
const getVoices = () => {
    return new Promise(resolve => {
        let voices = speechSynthesis.getVoices()
        if (voices.length) {
            resolve(voices)
            return
        }
        speechSynthesis.onvoiceschanged = () => {
            voices = speechSynthesis.getVoices()
            resolve(voices)
        }
    })
}

/**
 * Tip to make the WebSpeech getVoices function compatible with Chrome
 * Solution proposed by Flavio Copes on the JSBootcamp (https://2020.thejsbootcamp.com/)
 * @param callback
 * @returns {Promise<void>}
 */
export const prepareVoicesList = async (callback) => {
    let tmpvoices = [];
    ;(await getVoices()).forEach(voice => {
        tmpvoices.push(voice);
    })
    if (callback) {
        callback(tmpvoices);
    }
}

/**
 * Generate a UL/LI list of vocal choices
 * @param domtarget
 * @param datas
 * @returns {boolean}
 */
export function displayChoices(domtarget, datas=[]) {
    var target = document.getElementById(domtarget);
    if (!target) {
        console.error("Dom target not found : "+domtarget);
        return false;
    }
    var ul = document.createElement('ul');
    datas.forEach(data => {
        let li = document.createElement('li');
        li.innerHTML = data.desc;
        ul.appendChild(li);
    });
    target.appendChild(ul);
    return true;
}

/**
 * Get a duration in seconds and retrieve the duration splitted in minutes and seconds
 * @param duration
 * @returns {{seconds: number, minutes: number}}
 */
export function getTimeValues(duration) {
    let minutes = 0;
    let seconds = 0;
    if (duration > 0) {
        if (duration > 60) {
            //duration = Math.round(duration);
            minutes = Math.floor(duration / 60);
            seconds = Math.floor(duration - minutes * 60);
        } else {
            seconds = Math.round(duration);
        }
    }
    return {"min":minutes, "sec":seconds};
}

/**
 * Get time and minutes and retrieve the time in spoken words
 * @param minutes
 * @param seconds
 * @param txt_min
 * @param txt_sec
 */
export function getTimeVocal(minutes, seconds, messages) {
    if (minutes > 0 && seconds > 0) return `${minutes} ${messages.min} ${seconds} ${messages.sec}`;
    if (minutes > 0 && seconds == 0) return `${minutes} ${messages.min}`;
    return `${seconds} ${messages.sec} `
}

/**
 * Generate vocal messages describing the MP3 tag
 * @param audiotag
 * @param messages
 */
export function getInfos(audiotag, messages) {
    let duration = getTimeValues(audiotag.duration);  // get duration of the MP3
    speakEasy(messages.dur+ getTimeVocal(duration.min, duration.sec, messages));
    let currentTime = getTimeValues(audiotag.currentTime);  // get duration of the listening
    speakEasy(messages.lis+ getTimeVocal(currentTime.min, currentTime.sec, messages)) ;
}

/**
 * Reload page
 * @param messages
 */
export function reloadPage(messages) {
    let seconds = 2;
    let message = messages.reload.replace('XX', seconds);
    speakEasy(message);
    setTimeout(()=>{
        location.reload(true);
    }, seconds * 1000);
}

/**
 * List of commands vocally enumerated
 * @param messages
 * @param actions
 */
export function helpCommands(messages, actions) {
    speakEasy(messages.lcmd);
    actions.forEach(action => {
        speakEasy(action.desc);
    })
}

/**
 * getWords for the grammar parameter of the API Voice Recognition
 * @param actions
 */
export function getWords(actions) {
    let words = [];
    actions.forEach(action => {
        action.words.forEach(word => {
            words.push(word);
        })
    });
}

/**
 * Make an automatic click on a button or a link
 * @param node
 * @param target
 * @returns {boolean}
 */
export function autoclickOnNode(node, target) {
    if (!node) {
        console.error('DOM node not found for autoclick');
        return false;
    }
    let selector = `[data-link='${target}']`;
    let choice = node.querySelector(selector);
    if (choice) {
        choice.click();
    } else {
        console.error(`target not found for autoclick : ${target}`)
        return false;
    }
    return true;
}

/**
 * Retrieve a vocal version of the menu
 * @param menu_node
 * @param messages
 * @returns {[]}
 */
export function vocalizeMenu(menu_node, messages) {
    let vocal_menu = [];
    let choices = menu_node.querySelectorAll('a');
    choices.forEach(choice => {
        let message1 = `${messages.menu} ${choice.getAttribute('data-link')}`
        let keyword = choice.getAttribute('data-keyword');
        let message2 = "";
        if (messages.hasOwnProperty(keyword)) {
            message2 = messages[keyword];
            choice.innerHTML = message2;
        } else {
            message2 = choice.innerHTML;
        }
        vocal_menu.push({message1, message2, node:choice});
    });
    return vocal_menu;
}

/**
 * Read the menu
 * @param menu
 * @param lang
 * @param intro
 */
export function readMenu(menu, lang, intro="") {
    if (intro != '') {
        speakEasy(intro, lang);
    }
    menu.forEach(item => {
        speakEasy(item.message1, lang);
        speakEasy(item.message2, lang);
    });
}

/**
 * Retrieve the URL of the Json server
 * Note : the port must be the same defined in "bin/www"
 * @returns {string}
 */
export function getJsonServerURL() {
    return "http://localhost:3001/";
}

/**
 * Replace all occurrences of the "search" criteria by the "replace" value
 * @param string
 * @param search
 * @param replace
 * @returns {string}
 */
export function replaceAll(string, search, replace) {
    return string.split(search).join(replace);
}

/**
 * Generate an HTML link
 * @param num
 * @param title
 * @param parameters
 * @param url_base
 * @param context
 * @returns {HTMLAnchorElement}
 */
export function genLink(num, title, parameters, url_base, context) {
    let node = document.createElement('a');
    node.setAttribute('data-link', num);
    node.setAttribute('data-json', JSON.stringify(parameters));
    node.setAttribute('href', url_base+context+"-"+parameters.id);
    node.appendChild(document.createTextNode(title));
    return node;
}

/**
 * capitalize a string
 * @param input
 * @returns {string}
 * @constructor
 */
export function capitalize(input) {
    let output = '';
    input = input.trim();
    if (input.length > 0) {
        output = input[0].toUpperCase();
        if (input.length > 1) {
            output += input.substring(1).toLowerCase();
        }
    }
    return output;
}

/**
 * Emptying a node of the DOM (of all its children nodes)
 * @param target
 */
export function emptyDomNode(target) {
    while (target.firstChild) {
        target.removeChild(target.firstChild);
    }
}

/**
 * Create a source tag inside an audio tag
 * Example : <source src="/test/in_search_of_meaning.mp3" type="audio/mpeg">
 * @param dom_target
 * @param source_attribute
 */
export function createAudioSource(dom_target, source_attribute) {
    let src = document.createElement("source");
    src.setAttribute("src", source_attribute);
    src.setAttribute("type", "audio/mpeg");
    dom_target.appendChild(src);
}