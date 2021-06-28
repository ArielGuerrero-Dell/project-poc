import axios from 'axios';

async function spellCheck(query, products_entered) {

    const mkt = 'en-US'; // can be used for other markets, scaleable
    const mode = 'proof';// other option is spell, proof is more powerfull 

    let text = query;
    let corrected_text = text;
    let split_text = text.split(" ");

    // token to store flagged items
    let t;

    let headers = {
        'Ocp-Apim-Subscription-Key': process.env.BING_SPELLCHECK_KEY
    }

    // Create query string for bing
    let params = {
        "mode": mode,
        "mkt": mkt,
        "text": text
    }

    let options = {
        method: 'POST',
        url: process.env.BING_ENDPOINT,
        params: params,
        headers: headers,
        data: { Text: text }
    };

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