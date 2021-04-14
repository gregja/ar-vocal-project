import {getActions_frFR} from "../lang/actions_fr-FR.mjs";
import {getActions_enUS} from "../lang/actions_en-US.mjs";

/**
 * get the actions defined for the app
 * @param language
 * @param context
 * @returns {{context: string, words: string[], action: string, key: string, desc: string}[]}
 */
export function getActions(language, context) {
    let actions;
    if (language == "fr-FR") {
        actions = getActions_frFR(context);
    } else {
        actions = getActions_enUS(context);
    }
    return actions.filter(action => action.context == context || action.context == "all" || action.context.includes(context));
}
