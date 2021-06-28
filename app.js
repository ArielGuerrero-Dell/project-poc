// used for luis
const Convert = require("./response-models/LuisNamingResponseModel");
var requestPromise = require('request-promise');
var queryString = require('querystring');

// used for bing spell check
const request = require('request')

// used for global use
var luis_model;

var product_entered; // mean if we have this they enterd a product
var is_camel_case // name is camel cased if true, else correct it and reccomend it
var suggested_name; // they had a misspelling or the string was not camel cased, and it was corrected. reccomend this name

// Analyze a string utterance.
getPrediction = async () => {
    // APP-ID
    // const LUIS_appId = "f8859cc2-54d8-499f-8292-75014a92bed5";
    const LUIS_appId = "7247e58f-b286-4ed5-a296-e1d1c8bbb925";
    // PREDICTION-KEY
    const LUIS_predictionKey = "33f31a20f1574139b7dbadb1d40b4c77";
    // PREDICTION-ENDPOINT FOR LUIS 
    const LUIS_endpoint = "https://westus.api.cognitive.microsoft.com/";

    var utterance = "Novora Sample API Neame"; // hard coded utterance

    // Create query string for luis
    const luis_queryParams = {
        "subscription-key": LUIS_predictionKey,
        "verbose": true,
        "show-all-intents": false,
        "log": true,
        // "mkt-bing-spell-check-key": bing_key,
        "query": utterance
    }

    // Create the URI for the REST call to luis.
    const luis_URI = `${LUIS_endpoint}luis/prediction/v3.0/apps/${LUIS_appId}/slots/production/predict?${queryString.stringify(luis_queryParams)}`;

    // Send the REST call to luis.
    const luis_response = await requestPromise(luis_URI);

    // Display the response from the REST call.
    console.log("\nResponse JSON:");
    console.log(luis_response);
    console.log("\n");

    luis_model = Convert.toLuisNamingResponseModel(luis_response);

    console.log("Initial Service Name: " + luis_model.query + "\n");

    if (typeof luis_model.prediction.entities.Products == 'undefined') {
        console.log("\nPlease provide an associated product in your service name.\n");
    }
    else {

        product_entered = luis_model.prediction.entities.Products[0].toString();

        console.log("Associated Product: " + product_entered + "\n");

        is_camel_case = isCamelCase(luis_model.query);

        if (is_camel_case == false)
            console.log("IsCamelCase: false\n");
        else
            console.log("IsCamelCase: true\n");
    }

    spellCheck(utterance);
}

// Pass an utterance to the sample LUIS app, output errors if caught
getPrediction().then().catch((err) => console.log(err));

// checks for spelling mistakes
function spellCheck(utterance) {

    let host = 'https://api.bing.microsoft.com';
    let path = '/v7.0/spellcheck';
    let endpoint = host + path;
    let id = 'c0640d2d-7771-4e5e-bf09-1747cdc56d3f';
    let key = '06010d2fdc0f494fa8a1990e892e4cf7'; // key 1

    let mkt = 'en-US';
    let mode = 'proof';

    var text = utterance;
    var corrected_text = text.toString();
    var split_text = text.split(' ')

    let headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': text.length + 5,
        'Ocp-Apim-Subscription-Key': key
    }

    let request_params = {
        method: 'POST',
        url: endpoint,
        headers: headers,
        qs: {
            mode: mode,
            mkt: mkt,
            text: text
        },
        json: true
    }

    request(request_params, function (error, response, body) {

        split_text.forEach(split_item => {
            body.flaggedTokens.forEach(token => {
                if (!product_entered.includes(split_item) && split_item === token.token) {
                    console.log("Potenital Misspelled TOKEN: ");
                    console.log(token);
                    console.log("\n");
                    corrected_text = corrected_text.replace(split_item, token.suggestions[0].suggestion);
                }
            });
        })
        suggested_name = corrected_text;
        console.log("After Spell Check Suggested Name: " + suggested_name);
    });
}

// checks to see if the name they provided is camel cased.
function isCamelCase(str) {
    return /^([A-Z][a-z]*|[A-Z]*)( {1}([A-Z][a-z]*|[A-Z]*))+$/.test(str)
}
