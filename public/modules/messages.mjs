import {getMessages_frFR} from "./messages_fr-FR.mjs";
import {getMessages_enUS} from "./messages_en-US.mjs";

/**
 * get the messages defined for the app
 * @param language
 * @returns {{sec: string, dur: string, min: string, nr: string, lis: string, wlc: string}}
 */
export function getMessages(language) {
    if (language == "fr-FR") {
        return getMessages_frFR();
    }
    return getMessages_enUS();
}
