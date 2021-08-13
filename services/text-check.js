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
    return str === str.toUpperCase();
}

// checks the provided query for profanity
function isBadWord(str) {
    let bw = new badwords();
    if (bw.isProfane(str))
        return true; // is a bad word
    return false; // is not a bad word
}

// replaces non alphabetic characters with a space.
function replaceNonAlphas(str) {
    return str.replace(replace_regex, delim);
}

// checks if there is more than 1 word in a string
function strWordLenCheck(str, products) {
    if (products === 'undefined')
        return str.split(word_check_regex).length < 2;
    return str.split(word_check_regex).length < products + 1;
}

// returns true if str is empty
function isEmpty(str) {
    return /^\s*$/.test(str) || str === 'undefined';
}

// splits strings that are camelcased but not space delimed
function camelCaseStringSplit(str) {

    let str_tok = str.split(delim);
    let str_cap_tok = [];

    str_tok.forEach(t => str_cap_tok.push(t.split(/(?=[A-Z])/)));

    let new_str = "";

    str_cap_tok.forEach(t => {
        t.forEach(i => {
            if (i.length == 1)
                new_str += i;
            else if (i !== 'undefined')
                new_str += " " + i + " ";
        });
        new_str += " ";
    });

    str_tok = new_str.split(delim);
    str_tok = ridWhiteSpaceArr(str_tok);

    new_str = str_tok.join(delim);

    return new_str;
}

// takes out excess white space in a string
function ridWhiteSpaceStr(str) {
    let str_tok = str.split(delim).filter(e => e);
    let return_str = str_tok.join(delim);
    return return_str;
}

// takes out empty strings in an array
function ridWhiteSpaceArr(arr) {
    return arr.filter(e => e);
}

// formats name into book title formatting using supplied product list 
async function bookTitleFormat(str, list) {
    let str_tok = str.split(delim);
    let p_str = [], s_str = []; // product and service strings

    str_tok.forEach(split_item => {
        if (list.find(i => i.toString().includes(split_item)))
            p_str.push(split_item);
        else
            s_str.push(split_item);
    });

    str_tok = p_str.concat(s_str);
    str = str_tok.join(delim);
    return str;
}

// replaces unwanted entities that luis found using supplied entites list 
async function replaceUnwantedEntities(str, list) {

    list.forEach(element => {
        str = str.replace(new RegExp(element, "gi"), "");
    });

    str = ridWhiteSpaceStr(str);

    return str;
}

// makes string camel cased
async function toCamelCase(str) {

    let str_tok = str.split(delim);
    let result = [];

    // s is string, i is index, a is array

    str_tok.forEach(function (s, i, a) { a[i] = replaceNonAlphas(s) });

    str_tok = str_tok.join(delim).split(delim);

    str_tok.forEach(function (s, i, a) { a[i] = camelCaseStringSplit(s) }); // O(n^3) try to make this more optimized

    str_tok = str_tok.join(delim).split(delim);

    str_tok = ridWhiteSpaceArr(str_tok);

    str_tok.forEach(function (s, i, a) { a[i] = ridWhiteSpaceStr(s) });

    str_tok.forEach(token => {
        let temp_str;
        if (token.length <= 1)
            temp_str = "";
        else if (!isUpperCase(token))
            temp_str = token[0].toUpperCase() + token.substr(1, token.len).toLowerCase();
        else
            temp_str = token;

        result.push(temp_str);
    });

    result = ridWhiteSpaceArr(result);

    return result.join(delim);
}

export { isCamelCase, isBadWord, isEmpty, toCamelCase, replaceUnwantedEntities, strWordLenCheck, bookTitleFormat };