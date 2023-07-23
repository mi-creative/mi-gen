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
let srInvariant = 1;


function setSampleRateInvariant(val){
    if(val === 0)
        srInvariant = 0;
    else 
        srInvariant = 1;
}

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
        mdl.sampleRateInvariant = srInvariant; 
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

/**
 * Run a simulation step from the JS web simulator
 */
function simulationStep(){
    if(simu.isReady())
        simu.compute();
}

/**
 * Get the dict of simulation positions from the simulation
 * @returns {the}
 */
function getSimPositions(){
    if(simu.isReady())
        return simu.getSimPositions();
}


/**
 * Update a position input value (posInput module)
 * @param name name of the pos input (e.g p_in1)
 * @param val value to apply
 */
function update_posInput(name, val){
    simu.applyPosInput(name, parseFloat(val));
}

/**
 * Update a global scope parameter in the simulation context
 * @param name name of the parameter
 * @param val value to assign
 */
function update_param(name, val){
    simu.updateParameter(name, parseFloat(val));
}

/**
 * get the dictionary of global parameters used within the simulation scope
 * @returns {{}}
 */
function get_param_dict(){
    return simu.getParameterScope();
}

/**
 * Apply a force input to a frcInput element in the model
 * @param name the name of the force input (e.g. f_in1)
 * @param val the value to apply
 */
function apply_frcInput(name, val){
    simu.applyFrcInput(name, parseFloat(val));
}

function apply_frcAny(name, val){
    simu.applyFrcToAnyMass(name, parseFloat(val));
}



// This doesn't return anything yet, so avoid...
function parseAndGenerateDSP(text){
    parseMIMSFile(text);
    generateGenDSP();
    buildGendspPatch();
    generateFaustDSP();
}



// Pour Jérôme: un essai, je sais pas si ça va résoudre ton problème !
if (typeof window === 'undefined') {
    // in NodeJS context, do nothing
} else {
    window.createSimulationJS = createSimulationJS;
    window.simulationStep = simulationStep;
    window.getSimPositions = getSimPositions;
    window.parseMIMSFile = parseMIMSFile;
    window.generateGenDSP = generateGenDSP;
    window.generateFaustDSP = generateFaustDSP;
    window.get_param_dict = get_param_dict;
    window.update_param = update_param;
    window.apply_frcInput = apply_frcInput;
}

module.exports = {
    parseMIMSFile : parseMIMSFile,
    generateGenDSP :generateGenDSP,
    generateFaustDSP : generateFaustDSP,
    buildGendspPatch : buildGendspPatch,
    parseAndGenerateDSP : parseAndGenerateDSP,
    setSampleRateInvariant: setSampleRateInvariant,
    createSimulationJS : createSimulationJS,
    simulationStep : simulationStep,
    getSimPositions : getSimPositions,
    update_posInput : update_posInput,
    update_param : update_param,
    apply_frcInput : apply_frcInput,
    get_param_dict : get_param_dict,

};