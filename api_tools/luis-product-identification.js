import axios from 'axios';
import { stringify } from 'querystring';

// Analyze a string utterance.
async function getPrediction(query) {
    // used to return final data model
    let luis_model;

    // Create query string for luis
    let luis_queryParams = {
        "subscription-key": process.env.LUIS_PREDICTION_KEY,
        "verbose": false,
        "show-all-intents": false,
        "log": true,
        "query": query
    }

    // Create the URI for the REST call to luis.
    let luis_URI = `${process.env.LUIS_ENDPOINT}luis/prediction/v3.0/apps/${process.env.LUIS_APP_ID}/slots/production/predict?${stringify(luis_queryParams)}`;

    // Send the REST call to luis.
    await axios.get(luis_URI).then(response => { luis_model = response.data }).catch(e => { console.error(e); process.exit(1); });

    return luis_model;
}

export { getPrediction };