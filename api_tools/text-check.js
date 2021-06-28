import badwords from 'bad-words'

const camel_case_regex = /^([A-Z][a-z]*|[A-Z]*)( {1}([A-Z][a-z]*|[A-Z]*))*$/;
const replace_regex = new RegExp(/[^a-zA-Z]+/, "g");
const word_check_regex = new RegExp('\\s+');
const delim = " ";

// checks to see if the name they provided is camel cased.
function isCamelCase(str) {
    return camel_case_regex.test(str);
}

// returns true for all uppercase strings
function isUpperCase(str) {
    return str !== str.toUpperCase();
}

// replaces non alphabetic characters with a space.
function replaceNonAlphas(str) {
    return str.replace(replace_regex, delim);
}

// checks if there is more than 1 word in a string
function strWordCheck(str, products) {
    if (products === 'undefined')
        return str.split(word_check_regex).length < 2;
    return str.split(word_check_regex).length < products + 1;
}

// splits strings that are camelcased but not space delimed
function camelCaseStringSplit(str) {

    if (isUpperCase(str.substr(2)))
        str = splitCamelStringUnique(str);

    return str.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
}

// splits string that have all caps words in the start but is already camel cased otherwise 
function splitCamelStringUnique(str) {
    let str_cap_tok = str.split(/(?=[A-Z])/);
    let new_str = "";

    str_cap_tok.forEach(i => {
        if (i.length == 1)
            new_str += i;
        else if (i !== 'undefined') {
            new_str += " " + i;
        }
    });

    new_str = ridWhiteSpace(new_str)
    return new_str;
}

// takes out excess white space
function ridWhiteSpace(str) {

    let str_tok = str.split(delim);

    str_tok.forEach(token => {
        replaceNonAlphas(token) ? null : str_tok.splice(str_tok.indexOf(token), 1); //  removes white space 
    });

    return str_tok.join(delim);
}

// checks the provided query for profanity
function isBadWord(str) {
    let bw = new badwords();
    if (bw.isProfane(str))
        return true; // is a bad word
    return true; // is not a bad word
}

// formats name into book title formatting using supplied product list 
async function bookTitleFormat(str, list) {
    str = ridWhiteSpace(str);
    let str_tok = str.split(delim);
    let p_str = [], s_str = []; // product and service strings

    str_tok.forEach(split_item => {
        if (list.find(i => i.toString().includes(split_item)))
            p_str.push(split_item);
        else
            s_str.push(split_item);
    });

    str_tok = p_str.concat(s_str);

    return str_tok.join(delim);
}

// replaces unwanted entities that luis found using supplied entites list 
async function replaceUnwantedEntities(str, list) {

    list.forEach(element => {
        str = str.replace(new RegExp(element, "gi"), "");
    });

    str = ridWhiteSpace(str);

    return str;
}

// makes string camel cased
async function toCamelCase(str) {
    str = replaceNonAlphas(str);
    str = camelCaseStringSplit(str);

    let str_tokens = str.split(delim);
    let result = [];

    str_tokens.forEach(token => {
        let temp_str;

        if (token.length <= 1)
            temp_str = "";
        else if ((isUpperCase(token)))
            temp_str = token[0].toUpperCase() + token.substr(1, token.len).toLowerCase();
        else
            temp_str = token;

        result.push(temp_str);
    });

    return result.join(delim);
}

export { isCamelCase, isBadWord, toCamelCase, replaceUnwantedEntities, strWordCheck, bookTitleFormat };