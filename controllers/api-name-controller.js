import { isCamelCase, toCamelCase, replaceUnwantedEntities, strWordCheck, bookTitleFormat } from '../api_tools/text-check.js';
import { getPrediction } from '../api_tools/luis-product-identification.js';
import { spellCheck } from '../api_tools/bing-spell-check.js'
const entities_list = ['technologies', 'envDetails', 'progLangKeyword', 'redundant', 'verbs'];

async function parseApiNameQuery(query) {
    let cc_query = query;

    if (strWordCheck(query))
        return { isValid: "false", query: "ERROR: You did't submit a valid API Service Name." };

    if (!isCamelCase(query))
        cc_query = await toCamelCase(query);
    let luis_model = await getPrediction(cc_query);

    var entities = luis_model.prediction.entities;
    
    // short circuit if valid
    if (typeof luis_model.prediction.entities.products == 'undefined'){
        return { 
            isValid: "false", 
            query: "ERROR: You did't submit a valid Product in your API Service Name.",
            suggestedQuery: "ERROR: You did't submit a valid Product in your API Service Name.",
            associatedProducts: [] 
        };
    }
    else {

        for (let i = 0; i < entities_list.length; i++) {
            if (typeof entities[entities_list[i]] != 'undefined')
                cc_query = await replaceUnwantedEntities(cc_query, entities[entities_list[i]]);
        }

    }
   
    let products_entered = luis_model.prediction.entities.products;

    if (strWordCheck(cc_query, products_entered.length)){
        return { 
            isValid: "false", 
            query: "ERROR: You did't submit a valid Product in your API Service Name.",
            suggestedQuery: "ERROR: You did't submit a valid Product in your API Service Name.",
            associatedProducts: [] 
        };
    }
    let suggested_query = await spellCheck(cc_query, products_entered);

    suggested_query = await bookTitleFormat(suggested_query, products_entered);

    let return_model = {
        isValid: "true",
        query: query,
        suggestedQuery: suggested_query,
        associatedProducts: products_entered
    }

    return return_model;
}

export { parseApiNameQuery };



    /*
        
        stick with public dell product for demo <--- 

        output the initial query
        make sure to notify them
        
        look into real time suggestion 

        make apis easy to discover <---- !

        make service names more detailed

    */