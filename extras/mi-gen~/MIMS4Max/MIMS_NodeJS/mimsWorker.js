// =======================MIMS WORKER SCRIPT=========================
// This is the top level script that will use the various components
// to parse MIMS files, create a model state, and generate DSP codes
// for gen~ and Faust.
// ==================================================================

// To create a browser compatible version of the tool, use browserify:
//
// browserify MIMS_NodeJS/mimsWorker.js --standalone mimsBundle > browserified/mimsBrowser.js
//
// This will create a mimsBundle object that can be used to access functions.
// The globally defined mdl object will also be accessible in the client context.



const scriptParser = require("./scriptParser");
const gendspBuilder = require("./gendspCreator.js");
const codeBuilder = require("./codeBuilder.js");
//const mdl2faust = require("./mdl2faust.js");
const webSim = require("./WebEngine1D");

let simu = new webSim.PhysicsSim();

/**
 * Parse a MIMS file in string format and fill model structure in the global mdl object
 * @param text the MIMS script content
 * @returns {[number, *, string, string]} output data (errorcode, model dict, state message and error message).
 */
function parseMIMSFile(text){
    return scriptParser.parseMIMSFile(text);
}


/**
 * Generate the gen~ DSP code from the mdl description stored in the system.
 * @returns {[*, *, *, *]} the generated codebox code, number of inputs and number of outputs, and jsonSpat data.
 */
function generateGenDSP(){
    if(mdl.isValid()){
        //return mdl2gen.generateGenCode();
        let genBuilder = new codeBuilder.GenCodeBuilder(mdl);
        return genBuilder.compileToGenExpr();
    }
    else
        throw "Gen~ dsp create error: Invalid model state. Please parse a model first."


}


/**
 * Create a .gendsp file from gen code data (the output from the generateGenDSP function).
 * @param genPatchData the code and data.
 * @returns {any[] | T[] | undefined} the output string of content to be written to file.
 */
function buildGendspPatch(genPatchData){
    return gendspBuilder.generate(genPatchData[0].toString(), genPatchData[1], genPatchData[2]);
}


/**
 * Create a .dsp Faust code file from the model data stored in the system
 * @returns {string} the output string of content for the .dsp file.
 */
function generateFaustDSP(){
    /*if(!mdl.isFaustCompatible()){
        console.log("The model contains modules that are incompatible with Faust generation.");
        //throw "Faust DSP create error: The model is incompatible with Faust. Does it contain macro modules?";

    }
    else{*/
        if(mdl.isValid()){
            let faustBuilder = new codeBuilder.FaustCodeBuilder(mdl);
            return faustBuilder.compileToFaustDsp();
            //return mdl2faust.generateFaustCode();
        }
        else
            throw "Faust dsp create error: Invalid model state. Please parse a model first.";
    //}
}


function createSimulationJS(){
    simu = new webSim.PhysicsSim();
    simu.loadModel(mdl);
}


function simulationStep(){
    if(simu.isReady())
        simu.compute();
}


function getSimPositions(){
    if(simu.isReady())
        return simu.getSimPositions();
}


function update_posInput(name, val){
    simu.applyPosInput(name, parseFloat(val));
}

function update_param(name, val){
    simu.updateParameter(name, parseFloat(val));
}

function apply_frcInput(name, val){
    simu.applyFrcInput(name, parseFloat(val));
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
    parseAndGenerateDSP : parseAndGenerateDSP,
    createSimulationJS : createSimulationJS,
    simulationStep : simulationStep,
    getSimPositions : getSimPositions,
    update_posInput : update_posInput,
    update_param : update_param,
    apply_frcInput : apply_frcInput
};