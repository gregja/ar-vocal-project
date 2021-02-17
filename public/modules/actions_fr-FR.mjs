/**
 * get the actions defined for the app in French
 * @param context
 * @returns {({context: string, words: [string, string], action: string, key: string, desc: string}|{context: string, words: [string, string, string], action: string, key: string, desc: string}|{context: string, words: [string], action: string, key: string, desc: string}|{context: string, words: [string, string], action: string, key: string, desc: string}|{context: string, words: [string], action: string, key: string, desc: string})[]}
 */
export function getActions_frFR(context) {
    var actions = [
        {"key":"stop", "context":"reader", "desc":"stop (ou arrêt)", "words":["stop", "arrêt"], "action": "stop"},
        {"key":"play", "context":"reader", "desc":"écouter (ou lire)", "words":["écouter", "lire", "play"], "action": "play"},
        {"key":"pause", "context":"reader", "desc":"pause", "words":["pause"], "action": "pause"},
        {"key":"back", "context":"reader", "desc":"arrière", "words":["arrière", "back"], "action": "back"},
        {"key":"ahead", "context":"reader", "desc":"avant", "words":["avant"], "action": "ahead"},
        {"key":"up", "context":"reader", "desc":"monter (pour monter le volume)", "words":["monter"], "action": "up"},
        {"key":"down", "context":"reader", "desc":"baisser (pour baisser le volume)", "words":["baisser"], "action": "down"},  // Speech confuses "moins" and "moi" in french
        {"key":"info", "context":"reader", "desc":"info", "words":["info"], "action": "info"},
        {"key":"reload", "context":"all", "desc":"recharger (pour recharger la page)", "words":["recharger"], "action": "reload"},
        {"key":"goto", "context":"reader", "desc":"aller à", "words":["aller à", "aller", "allez"], "action": "goto", "exception":true},
        {"key":"helpcmd", "context":"all", "desc":"commande (pour liste des commandes)", "words":["commande"], "action": "helpcmd"},
        {"key":"helpmenu", "context":"all", "desc":"aide menu", "words":["aide menu"], "action": "helpmenu"},
        {"key":"menu", "context":"all", "desc":"menu (suivi du numéro souhaité)", "words":["menu"], "action": "menu", "exception":true},
        {"key":"choice", "context":"searching", "desc":"choix (suivi du numéro souhaité)", "words":["choix"], "action": "choice", "exception":true},
        {"key":"search", "context":"searching", "desc":"chercher", "words":["chercher", "rechercher", "trouver"], "action": "search", "exception":true}
    ];
    return actions;
}
