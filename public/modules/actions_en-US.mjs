/**
 * Get the actions defined for the app in english
 * WARNING : the order of the actions is important.
 *   For example, the actions "next_page" and "prev_page" must be placed before the action "page"
 * @param context
 * @returns {({context: string, words: [string], action: string, key: string, desc: string}|{context: string, words: [string], action: string, key: string, desc: string}|{context: string, words: [string], action: string, key: string, desc: string}|{context: string, words: [string], action: string, key: string, desc: string}|{context: string, words: [string, string], action: string, key: string, desc: string})[]}
 */
export function getActions_enUS(context) {
    var actions = [
        {"key":"stop", "context":"reader", "desc":"stop", "words":["stop"], "action": "stop"},
        {"key":"play", "context":"reader", "desc":"play", "words":["play"], "action": "play"},
        {"key":"pause", "context":"reader", "desc":"pause", "words":["pause"], "action": "pause"},
        {"key":"back", "context":"reader", "desc":"back", "words":["back"], "action": "back"},
        {"key":"ahead", "context":"reader", "desc":"ahead", "words":["ahead", "head"], "action": "ahead"},
        {"key":"up", "context":"reader", "desc":"up (for volume up)", "words":["up"], "action": "up"},
        {"key":"down", "context":"reader", "desc":"down (for volume down)", "words":["down", "less"], "action": "down"},
        {"key":"info", "context":"reader", "desc":"info", "words":["info"], "action": "info"},
        {"key":"reload", "context":"all", "desc":"reload (for reloading page)", "words":["reload"], "action": "reload"},
        {"key":"goto", "context":"reader", "desc":"go to", "words":["goto", "go to"], "action": "goto", "exception":true},
        {"key":"helpcmd", "context":"all", "desc":"command (for command list)", "words":["command"], "action": "helpcmd"},
        {"key":"helpmenu", "context":"all", "desc":"help menu", "words":["help menu"], "action": "helpmenu"},
        {"key":"menu", "context":"all", "desc":"menu (followed by number)", "words":["menu"], "action": "menu", "exception":true},
        {"key":"choice", "context":"searching", "desc":"choice (followed by number)", "words":["choice"], "action": "choice", "exception":true},
        {"key":"search", "context":"searching", "desc":"search (followed by keyword(s)", "words":["search"], "action": "search", "exception":true},
        {"key":"next_page", "context":"searching", "desc":"next page", "words":["next page"], "action": "next_page"},
        {"key":"prev_page", "context":"searching", "desc":"previous page", "words":["previous page"], "action": "prev_page"},
        {"key":"page", "context":"searching", "desc":"page (followed by number)", "words":["page"], "action": "page", "exception":true},
    ];
    return actions;
}
