const scriptParser = require("./scriptParser");
const gendspBuilder = require("./gendspCreator.js");
const mdl2gen = require("./mdl2gen.js");
const mdl2faust = require("./mdl2faust.js");


// =======================MIMS WORKER SCRIPT=========================
// This is the top level script that will use the various components
// to parse MIMS files, create a model state, and generate DSP codes
// for gen~ and Faust.
// ==================================================================

// To create a browser compatible version of the tool, use browserify:
//
// browserify mimsWorker.js --standalone mimsBundle > mimsBrowser3.js
//
// This will create a mimsBundle object that can be used to access functions.
// The globally defined mdl object will also be accessible in the client context.


function parseMIMSFile(text){
    return scriptParser.parseMIMSFile(text);
}

function generateGenDSP(){
    if(mdl.isValid())
        return mdl2gen.generateGenCode();
    else
        throw "Gen~ dsp create error: Invalid model state. Please parse a model first."
}

function buildGendspPatch(genPatchData){
    return gendspBuilder.generate(genPatchData[0].toString(), genPatchData[1], genPatchData[2]);
}


function generateFaustDSP(){
    if(!mdl.isFaustCompatible()){
        console.log("The model contains modules that are incompatible with Faust generation.");
    }
    else{
        if(mdl.isValid())
            return mdl2faust.generateFaustCode();
        else
            throw "Faust dsp create error: Invalid model state. Please parse a model first."
    }
}


// This doesn't return anything yet, so avoid...
function parseAndGenerateDSP(text){
    parseMIMSFile(text);
    generateGenDSP();
    buildGendspPatch();
    generateFaustDSP();
}


module.exports = {
    parseMIMSFile : parseMIMSFile,
    generateGenDSP :generateGenDSP,
    generateFaustDSP : generateFaustDSP,
    buildGendspPatch : buildGendspPatch,
    parseAndGenerateDSP : parseAndGenerateDSP};