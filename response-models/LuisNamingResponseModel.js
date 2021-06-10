// To parse this data:
//
//   const Convert = require("./file");
//
//   const luisNamingResponseModel = Convert.toLuisNamingResponseModel(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.
// Converts JSON strings to/from your types
function toLuisNamingResponseModel(json) {
    return JSON.parse(json);
}

function luisNamingResponseModelToJson(value) {
    return JSON.stringify(value);
}

module.exports = {
    "luisNamingResponseModelToJson": luisNamingResponseModelToJson,
    "toLuisNamingResponseModel": toLuisNamingResponseModel,
};
