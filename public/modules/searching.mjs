import {prepareVoicesList, speakEasy, reloadPage, helpCommands, getWords, autoclickOnNode,
    getJsonServerURL, replaceAll, capitalize, genLink, emptyDomNode, readMenu, vocalizeMenu,
    displayChoices} from "./tools.mjs";
import { Pagination, navbarManager } from "./pagination.mjs";
import { fixRecognition } from "./fixRecognition.mjs";
import {getMessages} from "./messages.mjs";
import {getActions} from "./actions.mjs";

function searchingUI (username, lang_std, search_limit, context) {
    "use strict";

    const link_reader = "http://localhost:3000/audioreader/";
    const modewrk = "searching";
    const messages = getMessages(lang_std);
    const actions = getActions(lang_std, modewrk);
    const words = getWords(actions);
    const json_server = getJsonServerURL();
    const main_column = "title";

    let sqlres = []; // current dataset returned by json-server
    let last_datas = []; // array of the datas loaded by the last search

    let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
    let SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;

    const search_area = document.getElementById('search_area');
    if (!search_area) {
        console.error('Dom target not found of ID search_area');
        return;
    }

    const navbar_area = document.getElementById('navbar_area');
    if (!navbar_area) {
        console.error('Dom target not found of ID navbar_area');
        return;
    }

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
    }

    const form_area = document.getElementById('search_form');
    if (!form_area) {
        console.error('Dom target not found of ID search_form');
        return;
    } else {
        let form = form_area.querySelector('form');
        let label1 = form.querySelector('[data-role=label1]');
        label1.innerHTML = messages.searching;
        let submit = form.querySelector('[data-role=submit]');
        submit.value = messages.validate;

        form.addEventListener('submit', (evt)=>{
            evt.preventDefault();
            let input = form.querySelector('[type=search]');
            fetchGet(main_column, input.value, responseSearching);
        }, false);
    }

    const help_area = document.querySelector('[data-role=help]');
    if (!help_area) {
        console.error('Dom target not found of help_area');
        return;
    } else {
        let legend = help_area.querySelector('legend');
        legend.innerHTML = messages.help;
    }

    displayChoices('informations', actions);

    function addInfo(message) {
        info_area.appendChild(document.createTextNode(message));
        info_area.appendChild(document.createElement('br'));
    }

    function firstQuestion() {
        let message1 = messages.wdoywtl.replace('XX', context);
        addInfo(message1);
        let message2 = messages.wdoywts;
        addInfo(message2);
        speakEasy(message1, lang_std);
        speakEasy(message2, lang_std);
        prepareSpeech();
    }

    prepareVoicesList(firstQuestion);

    function fetchGet(criteria, question, responseManager) {
        let apipath = `${json_server}${context}?${criteria}_like=${question}`;
        console.log("apipath => ", apipath);

        let qryHeaders = new Headers({
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-store'
        });

        let fetch_options = {
            method: 'GET',
            headers: qryHeaders,
            mode: 'cors',
        };

        let request = new Request(apipath, fetch_options);
        fetch(request)
            .then(function (response) {
                if (response.status !== 200) {
                    console.error('Bug calling Json Server, Status Code: ' + response.status);
                    return;
                }

                response.json().then(function (data) {
                    console.warn('Fetch OK');
                    responseManager(question, data);
                });
            })
            .catch(function (err) {
                console.error('Fetch Error => ', err);
            });
    }

    /**
     * Cleaning of the string
     * because a lot MP3 tags contains bad ' which are maybe the result of a loss of data during encoding
     * @param title
     * @param language
     * @returns {string}
     */
    function cleanTitle(title, language) {
        let slash_substitute = " of ";
        if (language == 'fr-FR' || language.includes('fr')) {
            slash_substitute = " sur ";
        }
        // replace "1/4" by "1 of 4" (or by "1 sur 4" in french)
        let output = replaceAll(title, '/', slash_substitute);
        return output;
    }

    /**
     * Describe the title with some details (title, artist, length)
     * @param idx
     * @param ref
     * @param main_column
     * @param simplified
     */
    function describeTitle(idx, ref, main_column, simplified=false) {
        speakEasy(`${messages.choice} ${idx}`, lang_std);
        speakEasy(`${ref[main_column]} `, lang_std);
        /*
        if (String(ref[main_column]).trim() != String(ref.album).trim()) {
            speakEasy(`${ref.album} `, lang_std);
        }
         */
        if (simplified) return;
        if (ref.artist) {
            speakEasy(`${messages.animated_by} ${ref.artist} `, lang_std);
        }
        if (ref.duration) {
            let duration = ref.duration;
            if (duration.hour > 0 || duration.min > 0) {
                let message = messages.duration;
                if (duration.hour > 0) {
                    message += duration.hour + messages.hour;
                }
                if (duration.min > 0) {
                    message += duration.min + messages.min;
                }
                speakEasy(message, lang_std);
            } else {
                speakEasy(messages.dur_unk, lang_std);
            }
        }
    }

    /**
     * Generate the Pagination bar
     * @param count_rows
     */
    function genBarNav(count_rows) {
        let current_offset = 1;
        let barre_pagination = new Pagination(count_rows, current_offset, search_limit, '', {}, true, "pagination");
        barre_pagination.activateClientSide();
        return barre_pagination.render();
    }

    /**
     * Generate a HTML Table using a dataset
     * @param dataset
     * @param ref_column
     * @param title
     */
    function genTable(dataset, ref_column, title = '') {

        function isNumber(val){
            return typeof val==='number';
        }
        function isString(val){
            return (typeof val === 'string' || val instanceof String)
        }

        if (dataset.length == 0) return;

        // select only columns displayable (number and string), ignore columns which contain objects
        let columns = Object.keys(dataset[0]).filter(item => isNumber(dataset[0][item]) || isString(dataset[0][item]) );

        let table = document.createElement('table');
        table.setAttribute("role", "presentation")

        if (title != '') {
            let caption = document.createElement('caption');
            caption.innerHTML = title;
            table.appendChild(caption);
        }
        let thead = document.createElement('thead');
        let tr0 = document.createElement('tr');
        tr0.setAttribute("role", "row");
        columns.forEach(col => {
            let th = document.createElement('th');
            th.setAttribute("role", "columnheader");
            let tmptitle = messages[col]?messages[col]:col;
            th.appendChild(document.createTextNode(capitalize(tmptitle)));
            tr0.appendChild(th);
        });
        thead.appendChild(tr0);
        table.appendChild(thead);

        let tbody = document.createElement('tbody');
        dataset.forEach(row => {
            let tr = document.createElement('tr');
            tr.setAttribute("role", "row");
            tr.setAttribute("data-status", "displayed");
            // avoid redundant data
            if (row.title.trim() == row.album.trim()) {
                row.album = '';
            }
            columns.forEach(col => {
                let td = document.createElement('td');
                if (col == ref_column) {
                    td.appendChild(genLink(row.choice, row[ref_column], row, link_reader, context))
                } else {
                    if (row[col] == undefined) {
                        row[col] = messages.unknown;
                    }
                    td.appendChild(document.createTextNode(row[col]));
                }
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        return table;
    }

    function readPageContent() {
        let tbody = search_area.querySelector('tbody').querySelectorAll('[data-status=displayed]');
        if (tbody.length == 0 ) {
            speakEasy(messages.page_empty);
            return;
        }
        [...tbody].forEach(row => {
            let link = row.querySelector('a');
            let ref = JSON.parse(link.getAttribute('data-json'));
            describeTitle(ref.choice, ref, main_column, true);
        })
    }

    /**
     * Manage the response of the JSON-server
     * @param question
     * @param data
     */
    function responseSearching(question, data) {
        // reorder rows and columns
        sqlres = alasql(`SELECT id, ${main_column}, album, artist, length, duration FROM ? ORDER BY ${main_column}`, [data] );
        let datas = [];

        sqlres.forEach((ref, num) => {
            ref[main_column] = cleanTitle(ref[main_column], lang_std);
            ref.album = cleanTitle(ref.album, lang_std);
            datas.push(Object.assign({"choice":num+1}, ref));
        })

        let nb_pages = Math.ceil(data.length / search_limit);

        if (datas.length == 0) {
            speakEasy(`${messages.notfound} ${question}`, lang_std);
            speakEasy(messages.newsearch, lang_std);
        } else {
            last_datas = datas;
            let title = messages.podcast_select;
            if (nb_pages > 1) {
                title += ` (${nb_pages} pages)`;
            }

            emptyDomNode(search_area);  // drop the previous HTML Table
            emptyDomNode(navbar_area);

            search_area.appendChild(genTable(datas, main_column, title));

            if (nb_pages > 1) {
                navbar_area.innerHTML = genBarNav(data.length);
                navbarManager(navbar_area, search_area, search_limit);
            }

            if (datas.length == 1) {
                speakEasy(`${messages.find1} ${question}`, lang_std);
                describeTitle(1, datas[0], main_column);
            } else {
                speakEasy(`${messages.findX} ${question} : ${sqlres.length}`, lang_std);
                if (sqlres.length > search_limit) {
                    speakEasy(messages.firstX.replace('XX', search_limit), lang_std);
                }
                readPageContent();
            }
        }
    }

    /**
     * Execute action identified by Voice Recognition
     * @param param
     * @param speechResult
     * @param confidence
     */
    function executeAction(param, speechResult, confidence) {

        if (param.intention == "") {
            console.warn(`intention not understood (confidence : ${confidence}%)`);
            speakEasy(`${messages.nr} ${speechResult}`, lang_std);
            return false;
        }

        switch (param.intention) {
            case 'choice':{
                let value = "";
                if (param.parameters.length > 0) {
                    // artibrary choice to take the last item of the array
                    value = fixRecognition(param.parameters[param.parameters.length-1], lang_std);
                }
                if (value != "") {
                    let tmpres = alasql(`SELECT * FROM ? WHERE choice = ?`, [last_datas, parseInt(value)] );
                    if (tmpres.length == 0) {
                        speakEasy(`${messages.choicenotfound} ${value}`, lang_std);
                        break;
                    }
                    let titleSelected = {
                        context: context,
                        title: tmpres[0]
                    }
                    sessionStorage.setItem("audioreader", JSON.stringify(titleSelected));
                    autoclickOnNode(search_area, value);
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
            case 'search' : {
                if (param.parameters.length > 0) {
                    let value = param.parameters[param.parameters.length-1];
                    let form = form_area.querySelector('form');
                    let input = form.querySelector('[type=search]');
                    input.value = value;
                    fetchGet(main_column, value, responseSearching);
                    break;
                }
            }
            case 'prev_page': {
                let link = navbar_area.querySelector('nav').querySelector('a');
                link.click();
                readPageContent();
                break;
            }
            case 'next_page': {
                let links = navbar_area.querySelector('nav').querySelectorAll('a');
                // click on the last link
                links[links.length-1].click();
                readPageContent();
                break;
            }
            case 'page' : {
                if (param.parameters.length > 0) {
                    let value = fixRecognition(param.parameters[param.parameters.length-1], lang_std);

                    let links = navbar_area.querySelector('nav').querySelectorAll('a');
                    let pagenum = 1;
                    for (let i=0, imax=links.length; i<imax; i++) {
                        let link = links[i];
                        let offset = link.getAttribute('data-offset');
                        if (offset != 'prev' && offset != 'next') {
                            if (String(pagenum) == String(value)) {
                                link.click();
                                readPageContent();
                                break;
                            }
                            pagenum++;
                        }
                    }
                    break;
                }
            }
            case 'menu': {
                if (param.parameters.length > 1) {
                    autoclickOnNode(menu_area, fixRecognition(param.parameters[1], lang_std));
                    break;
                }
            }
            case 'helpmenu': {
                readMenu(vocal_menu, lang_std, messages.lmenu);
                break;
            }
            default: {
                console.warn(`the intention was not understood (confidence : ${confidence}%)`);
                speakEasy(`${messages.nr} ${speechResult}`, lang_std);
                return false;
            }
        }
        return true;
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
        searchingUI(global.username, global.lang_std, global.search_limit, global.context);
    }

    document.body.addEventListener('click', startPage, false);
    document.body.click();
});


