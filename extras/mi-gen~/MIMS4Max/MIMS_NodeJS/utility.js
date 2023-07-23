
/** Some utility functions used here and there **/


/**
 * Format a module label (e.g. @m1) to the format used in gen~ code (m1, or p_in1 if position input).
 * @param name The label of the module in the MIMS script.
 * @returns {void | string} the formatted name to be used in gen~ code.
 */
function formatModuleName(name, char = "p"){
    var m = name.toString().replace("@", "");
    if(/^in/.test(m))
        m = char.concat("_".concat(m));
    return m;
}

/**
 * Get the integer index of an input or output module
 * @param string the module name
 * @returns {number} index of the number.
 */
function stripInOutToInt(string){
    let exp;
    if(/^@in/.test(string))
        exp = "@in";
    else if(/^@out/.test(string))
        exp = "@out";
    let nb = parseInt(string.replace(exp, ""));
    if (Number.isNaN(nb))
        throw "Cannot find index of " + string;
    return nb;
}


/**
 * Check if an element respects the module name format (starting with an @, e.g. @m1). Throws exception if not.
 * @param element element to test.
 * @returns {string|*} the element if it respects the module type, null otherwise.
 */
function checkIsModule(element){
    var m = element.replace(/[\[\]']+/g,'').split(/\s+/g);
    if(!/^@/.test(m[0])){
        throw "Bad mass name for " + m +", " + m + " doesn't start with @.";
    }
    else
        return m;
}

/**
 * Translate a position argument (either float or three floats inside brackets) into an x-y-z dictionary
 * @param pos the position string to test.
 * @returns {{x: *, y: *, z: *}|{x: *, y: number, z: number}}
 */
function posStringToDict(pos){
    let posArray = pos.replace(/[\[\]']+/g,'').split(/\s+/g);
    var pdict;
    if(posArray.length === 3)
        pdict = {x:posArray[0], y:posArray[1], z: posArray[2]};
    else if (posArray.length === 1)
        pdict = {x:0, y:0, z:posArray[0]};
    else
        throw "Bad Number of elements in position list " + pos;
    return pdict;
}



/*
function massArgsListToDict(type, args){
    console.log(args);
    var pdict;
    if(type === "ground"){
    } else if(type === "mass")
        pdict = {M : args[0]};
    else if (type === "osc")
        pdict = {M: args[0], K: args[1], Z: args[2]};
    else
        throw "Issue";
   return pdict;
}
*/


/**
 * Check if a field exists in a dictionary (e.g if the mass "@m1" is present in "massDict".
 * @param name field to test.
 * @param dic the dictionary in which we want to know if the field exists.
 * @returns {boolean} true if present, false otherwise.
 */
function isPresentInDict(name, dic){
    return dic[name] !== undefined;
}


function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}



// Pour Jérôme: un essai, je sais pas si ça va résoudre ton problème !
if (typeof window === 'undefined') {
    // in NodeJS context, do nothing
} else {
    // Specific window declarations for browser based operation
    window.isPresentInDict = isPresentInDict;
    window.isEmpty = isEmpty;
}


module.exports = {
    formatModuleName, stripInOutToInt, checkIsModule,
    isPresentInDict, posStringToDict, isEmpty
};