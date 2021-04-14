
/**
 * Temporary fix to solve some cases of bad recognition
 * @param input
 * @param lang_std
 * @returns {number}
 */
export function fixRecognition(input, lang_std) {
    let value = String(input).trim().toLowerCase();

    if (lang_std == "fr-FR") {

        switch (value) {
            case 'de' : {
                value = "2";
                break;
            }
        }

    }

    return value;
}