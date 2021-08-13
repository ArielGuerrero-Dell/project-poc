import axios from 'axios';
import { stringify } from 'querystring';

// luis APP-ID
const LUIS_APP_ID = '2f8483e1-3fe3-4da5-8eb7-c570e64cf843'; // v2

// luis PREDICTION-KEY
const LUIS_PREDICTION_KEY = 'bf9a5c9ad6b54775b160ddfa95e88264'; //v2

// PREDICTION-ENDPOINT FOR LUIS 
const LUIS_ENDPOINT = 'https://apigtwobnp.us.dell.com/DEV/api-naming-validation/';

// PREDICTION-ENDPOINT FOR LUIS 
// LUIS_ENDPOINT = 'https://westus.api.cognitive.microsoft.com/luis/prediction/v3.0/apps/';

// Analyze a string utterance.
async function getPrediction(query) {

    // used to return final data model
    let luis_model;

    // Create query string for luis
    let luis_queryParams = {
        "subscription-key": LUIS_PREDICTION_KEY,
        "verbose": false,
        "show-all-intents": false,
        "log": true,
        "query": query
    }

    // Create the URL for the REST call to luis.
    let luis_URL = `${LUIS_ENDPOINT}${LUIS_APP_ID}/slots/production/predict?${stringify(luis_queryParams)}`;

    console.log("\nURI: " + luis_URL + "\n\n");

    // Send the REST call to luis.
    await axios.get(luis_URL).then(response => { luis_model = response.data; }).catch(e => { console.error(e); process.exit(1); });

    return luis_model;
}

export { getPrediction };