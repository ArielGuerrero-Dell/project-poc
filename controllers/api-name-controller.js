import { isCamelCase, isBadWord, isEmpty, toCamelCase, replaceUnwantedEntities, strWordLenCheck, bookTitleFormat } from '../services/text-check.js';
import { getPrediction } from '../services/luis-entity-detection.js';
import { spellCheck } from '../services/bing-spell-check.js'
import fs from 'fs';

const entities_list = ['technologies', 'envDetails', 'progLangKeyword', 'redundant', 'verbs', 'lastNames'];

// used to create mock_data file if it doesnt exist
var file_exists = false;

// used to see if the file has data, and if data to write should be appended or just written
var file_is_empty = true;

async function parseApiNameQuery(query) {

    // checking to see if the provided query is blank
    if (isEmpty(query)) {
        return {
            isValid: "false",
            query: query,
            suggestedQuery: "ERROR: You did't submit anything",
            associatedProducts: []
        };
    }

    // starting to form together the suggestion
    let suggested_query = query;

    // checking to see if more than one word was provided
    if (strWordLenCheck(suggested_query)) {
        return {
            isValid: "false",
            query: query,
            suggestedQuery: "ERROR: You did't submit a valid API Name.",
            associatedProducts: []
        };
    }

    // make this string camel cased
    if (!isCamelCase(suggested_query))
        suggested_query = await toCamelCase(suggested_query);

    // checks for blank text after several checks and removals are performed
    if (isEmpty(suggested_query)) {
        return {
            isValid: "false",
            query: query,
            suggestedQuery: "ERROR: Only use alphabetic characters. Special characters and numbers should not be used.",
            associatedProducts: []
        }
    }

    // filtering for bad words, throws error on find
    if (isBadWord(suggested_query)) {
        return {
            isValid: "false",
            query: query,
            suggestedQuery: "ERROR: Profanity is NOT allowed.",
            associatedProducts: []
        }
    }

    // making luis call to extract wanted and unwanted entities
    let luis_model = await getPrediction(suggested_query);

    // luis entites to parse through
    let entities = luis_model.prediction.entities;

    // if no product is found then throw an error
    if (typeof luis_model.prediction.entities.products == 'undefined') {
        return {
            isValid: "false",
            query: query,
            suggestedQuery: "ERROR: You did't submit a valid Product in your API Service Name.",
            associatedProducts: []
        }
    }
    // filter through the entities is product is found to provide a better api name suggestion
    else {
        for (let i = 0; i < entities_list.length; i++) {
            if (typeof entities[entities_list[i]] != 'undefined')
                suggested_query = await replaceUnwantedEntities(suggested_query, entities[entities_list[i]]);
        }
    }

    // store products here, stored this way to handle the data easier
    let products = luis_model.prediction.entities.products;
    let products_entered = [];

    products.forEach(t => products_entered.push(t.toString()));

    // only product would reamin here if error, that means everything they provided was an unwanted entity
    if (strWordLenCheck(suggested_query, products_entered.length)) {
        return {
            isValid: "false",
            query: query,
            suggestedQuery: "ERROR: You did't submit a valid API Name.",
            associatedProducts: []
        }
    }

    // spelling error correction
    suggested_query = await spellCheck(suggested_query, products_entered);

    // formatting to book title format (products first service name second)
    suggested_query = await bookTitleFormat(suggested_query, products_entered);

    // can take out, file processess are for POC version, should be updated to access product list through external api

    // start file process 
    let isIn = await suggestedApiNameCheck(suggested_query);

    if (isIn) {
        let count = 1;
        let update_sug_q = suggested_query;
        while (isIn) {
            update_sug_q = suggested_query + " Alt " + count;
            isIn = await suggestedApiNameCheck(update_sug_q);
            count++;
        }
        suggested_query = update_sug_q;
    }
    // end file process 

    let return_val = {
        'isValid': "true",
        'query': query,
        'suggestedQuery': suggested_query,
        'associatedProducts': products_entered
    }

    await writeSuggestedName(suggested_query);

    return return_val;
}

async function suggestedApiNameCheck(suggested_api_name) {

    let filename = './mock_api_names/mock_data.csv';
    let isIn = false;

    if (!file_exists)
        await createFile(filename);

    try {
        await checkFileData(filename);

    } catch (error) {
        console.error("ERROR: " + error);
    }

    if (file_is_empty)
        return isIn;

    let data = await getFileData(filename);

    let split_data = data.split(',');

    split_data.forEach(e => {
        if (e === suggested_api_name)
            isIn = true
    });

    return isIn;
}

async function checkFileData(filename) {

    let data = await getFileData(filename);

    if (data.length == 0)
        file_is_empty = true;
    else
        file_is_empty = false

}

async function getFileData(filename) {
    return fs.readFileSync(filename, 'utf8');
}

async function writeSuggestedName(suggested_api_name) {

    let filename = './mock_api_names/mock_data.csv';

    if (file_is_empty) {
        fs.writeFile(filename, suggested_api_name, err => {
            if (err)
                console.error("Error: " + err);
        });
    }
    else { // file exisits append comma and the suggested api name 
        fs.writeFile(filename, "," + suggested_api_name, { flag: 'a+' }, err => {
            if (err)
                console.error("Error: " + err);
        });
    }
}

async function createFile(filename) {

    fs.writeFile(filename, "", err => {
        if (err)
            console.error("Error: " + err);
    });

    // at this point if the file didn't exist it should now
    if (!file_exists)
        await changeFileStatus(true);
}

async function changeFileStatus(status) {
    file_exists = status;
}

export { parseApiNameQuery };
