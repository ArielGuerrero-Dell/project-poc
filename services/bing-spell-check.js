import axios from 'axios';
import dotenv from 'dotenv';

// bing KEY
// const BING_SPELLCHECK_KEY = '06010d2fdc0f494fa8a1990e892e4cf7'; // v1
const BING_SPELLCHECK_KEY = 'a7a710358f1447648522ce4f97a25d81'; // v2

// bing ENDPOINT   
const BING_ENDPOINT = 'https://api.bing.microsoft.com/v7.0/spellcheck';

async function spellCheck(query, products_entered) {

    const mkt = 'en-US'; // can be used for other markets, scaleable
    const mode = 'proof';// other option is spell, proof is more powerfull 

    let text = query;
    let corrected_text = text;
    let split_text = text.split(" ");

    // token to store flagged items
    let t;

    // Create query string for bing
    let headers = {
        'Ocp-Apim-Subscription-Key': BING_SPELLCHECK_KEY
    }

    let params = {
        "mode": mode,
        "mkt": mkt,
        "text": text
    }

    let options = {
        method: 'POST',
        url: BING_ENDPOINT,
        params: params,
        headers: headers,
        data: { Text: text }
    };

    // items that were flagged as misspelled.
    let flagged_items = await axios.request(options).then(function (response) { return response.data.flaggedTokens; }).catch(function (e) { console.error(e); });

    split_text.forEach(split_item => {
        if (!products_entered.find(i => i.toString().includes(split_item))) { // check to see if item is not in provided product names
            if (t = flagged_items.find(item => item.token === split_item)) { // finds token related to the misspelled item
                if (corrected_text.includes(split_item)) { // if the item is in the final text replace with correct spelling
                    let replace_regex = new RegExp(split_item, "g");
                    corrected_text = corrected_text.replace(replace_regex, t.suggestions[0].suggestion);
                }
            }
        }
    });

    return corrected_text;
}

export { spellCheck };