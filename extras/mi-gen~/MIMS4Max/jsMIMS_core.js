const maxAPI = require("max-api");

const genDspFileWriter = require("./jsMIMS_GenObjWriter.js");
const phyDict = require("./jsMIMS_phyDict.js");
const fs =require("fs");

let state = 0;
var massDict = {};
var interDict = {};
var inOutDict = {};
var macroDict = {};
var paramDict = {};

var nbInputs = 0;
var nbOutputs = 0;
var codeboxCode = "";
var jsonSpat = {};

var nbProxies = 0;
var bufferList = [];
var activeBufferList = [];

/**
 * Adding function handlers (functions that can be called from the Max context).
 */
maxAPI.addHandlers({
    parseMimsScript: (...args) => {
        state = 0;
        //maxAPI.post("Parsing MIMS script...");
        //maxAPI.outlet("code", "");
        console.log("Parsing MIMS code...");
        parseMIMSFile(args[0].toString());
        console.log("...done");
        //maxAPI.post("...done.");
    },
    createGenDSPFile: (...args) => {
        if(state){
            maxAPI.post("About to generate the gen DSP file...");
            try{

                // Do this on Mac to conform to a standard absolute path starting from the root /
                if(/^Macintosh/.test(args[0]))
                    args[0] = args[0].replace("Macintosh HD:", "");

                genDspFileWriter.generateDspObj(args[0].toString(), codeboxCode, nbInputs, nbOutputs);
                maxAPI.post("...done.");
                maxAPI.outlet("state", "Successfully wrote to " + args[0].toString());
                maxAPI.outlet("code", "SUCCESS!");

            }
            catch(e){
                maxAPI.outlet("state", "Errors detected during GenDSP file generation.");
                maxAPI.outlet("error", e);
            }

            /*
            try{
                let jsonName = args[0].toString().split('.')[0].concat(".json");
                maxAPI.post(jsonName);

                fs.truncate(jsonName, 0, function () {
                    console.log('done')
                });
                fs.writeFile(jsonName, JSON.stringify(jsonSpat), (err) => {
                    if (err) console.log(err);
                    console.log("Successfully Written to File.");
                });
            } catch(e){
                maxAPI.outlet("state", "Errors detected during accompanying json file generation.");
                maxAPI.outlet("error", e);
            }
            */


        }
        else
            maxAPI.post("Please load a model first.")
    },
    createFaustDSPFile: (...args) => {
        if(state){
            maxAPI.post("About to generate Faust DSP file...");
            try{
                let fDSP = generateFaustCode();

                // Do this on Mac to conform to a standard absolute path starting from the root /
                if(/^Macintosh/.test(args[0]))
                    args[0] = args[0].replace("Macintosh HD:", "");

                fs.writeFileSync(args[0].toString(), fDSP, (err)=> {
                    if (err) console.log(err);
                    console.log("Successfully Written to File.");
                });

                maxAPI.post("...done.");
                maxAPI.outlet("state", "Successfully wrote to " + args[0].toString());
                maxAPI.outlet("code", "SUCCESS!");
            }
            catch(e){
                maxAPI.outlet("state", "Errors detected during Faust DSP file generation.");
                maxAPI.outlet("error", e);
                maxAPI.post(e);
            }
        }
        else
            maxAPI.post("Please load a model first.")
    },
    clear:() =>{
        maxAPI.post("Clearing the model\n");
        clear();
    }
});

/**
 * Parse an entire MIMS Script file
 * @param text the file as a single string of text.
 */
function parseMIMSFile(text){

    clear();
    maxAPI.outlet("error", "");
    maxAPI.outlet("state", "Parsing MIMS file");

    try {
        var lines = text.split(/\r\n|\r|\n/);
        for(var i = 0; i < lines.length; i++)
            parseCommand(lines[i]);
        state = 1;
        createGenCode();

        var out = {
            masses: massDict,
            interactions: interDict,
            macroStructures: macroDict,
            inOuts: inOutDict,
            parameters: paramDict
        };

        maxAPI.outlet("model", out);
        maxAPI.outlet("error", "No errors to report.");
        maxAPI.outlet("state", "Finished parsing.");
        maxAPI.outlet("code", codeboxCode);

    } catch(e){
        console.error(e);
        maxAPI.post(e);

        state = 0;
        maxAPI.outlet("state", "Errors detected during script parse / code-generation.");
        maxAPI.outlet("error", e);
        maxAPI.outlet("model", {});
        maxAPI.outlet("code", "error during MIMS parse.");
        return -1;
    }
}


/**
 * Parse and interpret a MIMS command line.
 * @param text the line to parse.
 */
function parseCommand(text){

    if(!/^\s*@/.test(text)){
        if(/^\s*~begin/.test(text)){
            let s = text.split(/\s/)[1];
            if(s == null)
                throw "Invalid buffer begin command";
            else{
                if (activeBufferList.indexOf(s) === -1){
                    activeBufferList.push(s);
                    bufferList.push(s);
                }
            }
        }
        else if(/^\s*~end/.test(text)){
            let s = text.split(/\s/)[1];
            if(s == null)
                throw "Invalid buffer end command";
            else{
                if (activeBufferList.indexOf(s) > -1)
                    activeBufferList = activeBufferList.splice(activeBufferList.indexOf(s) + 1);
            }
        }
        return;
    }

    var regExp = /[^\s+\[']+|\[[^\]]*\]|'[^']*'/g;
    var list = [];
    while ((array1 = regExp.exec(text)) !== null)
        list.push(array1.toString());
    attributeListToDicts(list);
}


/**
 * Use list of parsed elements from a command to fill dictionaries with the model specifications.
 * @param list the array of elements obtained from a parsed MIMS command.
 */
function attributeListToDicts(list){

    /**
     *
     */
    function makeArgList(list, argStart, argEnd, expected, opt = 0){

        var args = list.slice(argStart, list.length - argEnd);
        for (let i = 0; i < args.length; i++)
            args[i] = args[i].replace(/[\[\]']+/g,'');

        if (args.length < expected)
            throw "Insufficient number of arguments for " + list[1] + " element: " + list[0] + " (" + args.length + ")";
        else if (args.length > expected + opt)
            throw "Wrong number of arguments for " + list[1] + " element: " + list[0] + " (" + args.length + ")";


        return args;
    }



    try {

        let name = checkIsModule(list[0]);
        let type = list[1];
        let len = list.length;
        let args = [];
        let expected_args, opt_args;
        let pos, vel;

        if (type in phyDict.genModDict){
            expected_args = phyDict.genModDict[type]["nbArgs"];
            opt_args = phyDict.genModDict[type]["optArgs"].length;
        }
        else
            expected_args = 0;

        if (isPresentInDict(name, massDict) || isPresentInDict(name, interDict) ||
            isPresentInDict(name, macroDict) || isPresentInDict(name, paramDict) ||
            isPresentInDict(name, paramDict)) {
            throw name + " already exists in the model.";
        }


        if (phyDict.mass_modules.indexOf(type) > -1) {
            if(type === "ground")
                pos = list[len - 1];
            else {
                pos = list[len - 2];
                vel = list[len - 1];
            }
            args = makeArgList(list, 2, 2, expected_args, opt_args);

            if (type === "ground")
                vel = "0";
            massDict[name] = {
                type: type,
                args: args,
                pos: posStringToDict(pos),
                vel: posStringToDict(vel),
                buffer : activeBufferList.slice()
            }
        }

        else if (phyDict.interaction_modules.indexOf(type) > -1) {

            var m1 = checkIsModule(list[2]);
            var m2 = checkIsModule(list[3]);
            args = makeArgList(list, 4, 0, expected_args, opt_args);

            interDict[name] = {
                type: type,
                m1: m1,
                m2: m2,
                args: args
            }
        }

        else if (phyDict.macro_modules.indexOf(type) > -1) {
            pos = list[len - 2];
            vel = list[len - 1];
            args = makeArgList(list, 2, 2, expected_args, opt_args);
            macroDict[name] = {
                type: type,
                args: args,
                pos: posStringToDict(pos),
                vel: posStringToDict(vel),
                buffer : activeBufferList.slice()
            };
        }

        /*
        else if (phyDict.in_out_modules.indexOf(type) > -1){
            if (len !== 3)
                throw "Bad number of arguments for " + type + " element: " + name;
            else {
                if ((type === "posInput") || (type === "frcInput")){
                    if (!/in/.test(name))
                        throw "Bad name for " + type + " " + name;
                    else {
                        if(type === "posInput"){
                            inOutDict[name] = {
                                type: type,
                                pos: posStringToDict(list[2]),
                                vel: posStringToDict(list[2])
                            }
                        }
                        else if(type === "frcInput") {
                            inOutDict[name] = {
                                type: type,
                                m: checkIsModule(list[2])
                            }
                        }
                    }
                }
                else if ((type === "posOutput") || (type === "frcOutput")) {
                    if (!/out/.test(name))
                        throw "Bad name for " + type + " " + name;
                    else {
                        inOutDict[name] = {
                            type: type,
                            m: checkIsModule(list[2])
                        }
                    }
                }
            }
        }

         */

        // Could definitely refactor a lot of this stuff
        else if (type === "posInput") {
            if (len !== 3) {
                throw "Bad number of arguments for " + type + " element: " + name;
            } else {
                if (!/in/.test(name))
                    throw "Bad name for " + type + " " + name;
                else {
                    inOutDict[name] = {
                        type: type,
                        pos: posStringToDict(list[2]),
                        vel: posStringToDict(list[2]),
                        buffer : activeBufferList.slice()
                    }
                }
            }
        } else if ((type === "posOutput") || (type === "frcOutput")) {
            if (len !== 3) {
                throw "Bad number of arguments for " + type + " element: " + name;
            } else {
                if (!/out/.test(name))
                    throw "Bad name for " + type + " " + name;
                else {
                    inOutDict[name] = {
                        type: type,
                        m: checkIsModule(list[2])
                    }
                }
            }
        } else if (type === "frcInput") {
            if (len !== 3) {
                throw "Bad number of arguments for " + type + " element: " + name;
            } else {
                if (!/in/.test(name))
                    throw "Bad name for " + type + " " + name;
                else {
                    inOutDict[name] = {
                        type: type,
                        m: checkIsModule(list[2])
                    }
                }
            }
        }

        else if (type === "param") {
            if (len !== 3) {
                throw "Bad number of arguments for " + type + " element: " + name;
            } else {
                paramDict[name] = {
                    type: type,
                    args: list[2]
                }
            }
        } else if (type === "audioParam") {
            if (len !== 3) {
                throw "Bad number of arguments for " + type + " element: " + name;
            } else {
                let input = checkIsModule(list[2]);
                if (!/in/.test(input))
                    throw "Bad name for " + type + " " + name;
                paramDict[name] = {
                    type: type,
                    input: input.toString()
                }
            }
        }
    } catch (e){
        throw("Parsing Error: " + e);
    }
}


/**
 * Clear all the data associated with a MIMS model and reset the parser state.
 */
function clear(){

    massDict = {};
    interDict = {};
    inOutDict = {};
    paramDict = {};
    macroDict = {};

    bufferList = [];
    activeBufferList = [];
    state = 0;

    maxAPI.outlet("state", "No loaded model");
    maxAPI.outlet("error", "");
    maxAPI.outlet("code", "");

}

/**
 * Parse the module dictionaries of a parsed MIMS Script to generate gen~ codebox code.
 * This method first parses dictionaries of modules to generate lists of code
 * then creates a single string containing the entire codebox code for the model.
 */
function createGenCode(){

    nbInputs = 0;
    nbOutputs = 0;
    nbProxies = 0;

    var header = [];
    var struct = [];
    var context = [];
    var params = [];
    var init = [];

    var compMasses = [];
    var compInteractions = [];
    var compInput = [];
    var compOutput = [];
    var compProxyMasses = [];
    var compProxyInteractions = [];

    var motionBufferCode = [];
    var specificBuffers = {};

    var massIndex = 0;

    var instanciatedOuts = [];

    jsonSpat = {};
    codeboxCode = "";


    function pushToMotionBuffers(name, element){
        if(!element["buffer"].isEmpty()){
            for(let i = 0; i < element["buffer"].length; i++){
                let bName = element["buffer"][i];
                if (bufferList.includes(bName)){
                    specificBuffers[bName]["code"].push(bName +
                        ".poke(get_pos("+ name +"), "
                        + specificBuffers[bName]["index"] + ", 0);");
                    specificBuffers[bName]["index"]++;
                }
            }
        }
        motionBufferCode.push("motion.poke(get_pos("+ name +"), " + massIndex + ", 0);");
        massIndex++;
    }


    function pushMacroToMotionBuffers(name, element, size){
        if(!element["buffer"].isEmpty()){
            for(let i = 0; i < element["buffer"].length; i++){
                let bName = element["buffer"][i];
                if (bufferList.includes(bName)){
                    specificBuffers[bName]["code"].push("for(i = 0; i < channels("+ name +"); i+=1){");
                    specificBuffers[bName]["code"].push(bName + ".poke(get_pos_at("+ name +", i), "
                        + specificBuffers[bName]["index"] + " + i" + ", 0);");
                    specificBuffers[bName]["code"].push("}");
                    specificBuffers[bName]["index"] += size;
                }
            }
        }
        motionBufferCode.push("for(i = 0; i < channels("+ name +"); i+=1){");
        motionBufferCode.push("motion.poke(get_pos_at("+ name +", i), " + massIndex + " + i" + ", 0);");
        motionBufferCode.push("}");
        massIndex += size;
    }


    /**
     * Generate gen~ codebox body code for various physical modules.
     * @param name name of the module.
     * @param dict dictionnary corresponding to this module (with type, arguments, etc.)
     * @returns {string} the returned string to be used in generated gen~ code.
     */
    function massToCode(name, dict) {
        // Create a string of arguments linked by commas (starting with a comma).
        let argstring = "";
        let args = dict["args"];
        var type = dict["type"];
        let regArgNb = phyDict.genModDict[type]["nbArgs"];
        let optArgNb = phyDict.genModDict[type]["optArgs"].length;

        if (args.length < regArgNb || (args.length > regArgNb + optArgNb))
            throw "Wrong number of arguments to generate interaction code for " + name ;

        if (args) {

            // For the sake of standardisation, let's send number of string masses as an argument.
            //if((type === "string") || (type === "stiffString") || (type === "chain"))
            //    args.splice(0, 1);


            for (let i = 0; i < args.length; i++) {
                argstring = argstring.concat(", ");
                if(i >= regArgNb){
                    let paramName = phyDict.genModDict[type]["optArgs"][i-regArgNb];
                    argstring = argstring.concat(paramName + " = ");
                    if(paramName === "gravity")
                        argstring = argstring.concat(args[i] + "/ SAMPLERATE");
                    else
                        argstring = argstring.concat(args[i]);
                }
                else
                    argstring = argstring.concat(args[i]);
            }
        }

        if(phyDict.mass_modules.indexOf(type) > -1) {
            return phyDict.genModDict[type]["func"] + "(" + name + argstring + ");";
        }

        else if(phyDict.macro_modules.indexOf(type) > -1) {
            return phyDict.genModDict[type]["func"] + "(" + name + argstring + ");";
        }
    }

    /**
     * Generate codebox code for inputs and outputs.
     * @param name
     * @param dict
     * @param connect
     * @returns {string}
     */
    function inOutToCode(name, dict, connect){
        let type = dict["type"];

        if (type === "posInput"){
            let nb = parseInt(name.replace("p_in", ""));
            nbInputs = Math.max(nbInputs, nb);
            return phyDict.genModDict[type]["func"] + "(" + name + ", in" + nb.toString() + ");";
        }
        else if (type === "posOutput"){
            let nb = parseInt(name.replace("out", ""));
            //console.log(nb + "\n");
            nbOutputs = Math.max(nbOutputs, nb);
            return "out"+ nb.toString() + " = get_pos(" + connect + ");" ;
        }
        else if (type === "frcOutput"){
            let nb = parseInt(name.replace("out", ""));
            nbOutputs = Math.max(nbOutputs, nb);
            return "out"+ nb.toString() + " = get_frc(" + connect + ");" ;
        }
        else if (type === "frcInput"){
            let nb = parseInt(name.replace("p_in", ""));
            nbInputs = Math.max(nbInputs, nb);
            return "apply_input_force(" + connect + ", in"+ nb.toString() + ");";
        }
    }

    /**
     * Generate codebox code for interactions.
     * @param name
     * @param dict
     * @param connect1
     * @param connect2
     * @returns {string}
     */
    function interactionToCode(name, dict, connect1, connect2) {
        let argstring = "";
        let args = dict["args"];
        var type = dict["type"];
        let regArgNb = phyDict.genModDict[type]["nbArgs"];
        let optArgNb = phyDict.genModDict[type]["optArgs"].length;

        if (args.length < regArgNb || (args.length > regArgNb + optArgNb))
            throw "Wrong number of arguments to generate interaction code for " + name ;

        for (let i = 0; i < args.length; i++) {
            argstring = argstring.concat(", ");
            if(i >= regArgNb)
                argstring = argstring.concat(phyDict.genModDict[type]["optArgs"][i-regArgNb] + " = ");
            argstring = argstring.concat(args[i]);
        }

        if(phyDict.interaction_modules.indexOf(type) > -1)
            return phyDict.genModDict[type]["func"] + "(" + connect1 + ", " + connect2 + argstring + ");";

    }


    /**
     * Check for proxies: if an interaction connects one or several macro elements, we must create proxies and re-route connections.
     * @param mList array with the mass name (will either be a name e.g @m1, or a name and list e.g [@s 0.1]
     * @returns {*[]} returns the created proxy module if one was created, or the regular module.
     */
    function integrateProxies(mList){
        let macroName;

        if(mList.length > 1){

            macroName = mList[0];
            let pName = "proxy_" + nbProxies;

            if (!isPresentInDict(macroName, macroDict))
                throw  pName + " generation error: macro module " + macroName + " does not exist.";

            struct.push("Data " + pName + "(3);");
            init.push("init_mat(" + pName + ", 0, 0);");

            if(mList.length === 2){
                let alpha = mList[1];
                compProxyMasses.push("set_proxy_pos_string("+ pName + ", " + formatModuleName(macroName) + ", " + alpha + ");");
                compProxyInteractions.push("apply_proxy_frc_string(" + pName + ", " + formatModuleName(macroName) + ", " + alpha + ");");
            }
            else if (mList.length === 3){
                let alpha = mList[1];
                let beta = mList[2];
                compProxyMasses.push("set_proxy_pos_mesh("+ pName + ", " + formatModuleName(macroName)
                    + ", " + macroDict[macroName]["args"][0 ] + ", " + macroDict[macroName]["args"][1]
                    + ", " + alpha + ", " + beta + ");");
                compProxyInteractions.push("apply_proxy_frc_mesh(" + pName + ", " + formatModuleName(macroName)
                    + ", " + macroDict[macroName]["args"][0] + ", " + macroDict[macroName]["args"][1]
                    + ", " + alpha + ", " + beta + ");");
            }
            nbProxies++;
            return [true, "@"+pName];
        }
        else{
            if (isPresentInDict(mList, macroDict))
                throw "trying to connect to macro " + mList + ", missing argument";

            return [false, mList[0]];
        }
    }


    // Initialise several arrays for specific buffers.
    for(let i = 0; i < bufferList.length; i++){
        specificBuffers[bufferList[i]] = {index : 0, code: []};
    }

    //maxAPI.post("Spec buffers: " + JSON.stringify(specificBuffers) + "\n");
    console.log("Starting to generate gen~ DSP code\n");

    try {

        header.push('require(\\"migen-lib\\");');
        if(!macroDict.isEmpty()){
            header.push('require(\\"migen-integrated\\");');
            header.push('require(\\"migen-proxies\\");');
        }


        header.push('\nBuffer motion;');
        for(let i = 0; i < bufferList.length; i++)
            header.push('Buffer ' + bufferList[i] + ";");

        var dict = {};
        var n = "";

        let Ycoord = [];
        let Zcoord = [];

        for (let name in massDict) {
            if (massDict.hasOwnProperty(name)) {
                dict = massDict[name];
                n = formatModuleName(name);
                struct.push("Data " + n + "(3);");

                let x = parseFloat(dict["pos"]["x"]);
                let velx = parseFloat(dict["vel"]["x"]);
                init.push("init_mat(" + n + ", " + x
                    + ", " + x + " - " + velx + " / SAMPLERATE);");
                compMasses.push(massToCode(n, dict));

                // Add motion buffer code for the mass-type element
                pushToMotionBuffers(n, dict);
                Ycoord.push(parseFloat(dict["pos"]["y"]));
                Zcoord.push(parseFloat(dict["pos"]["z"]));
            }
        }

        for (let name in macroDict) {
            if (macroDict.hasOwnProperty(name)) {
                dict = macroDict[name];
                n = formatModuleName(name);
                let size = 0;
                let type = dict["type"];
                let string = false;

                if((type === "string") || (type === "stiffString") || (type === "chain")){
                    size = parseInt(dict["args"][0]);
                    string = true;
                }
                else
                    size = parseInt(dict["args"][0]) * parseInt(dict["args"][1]);

                if (isNaN(size))
                    throw "Macro length argument for " + name + " cannot be converted to an integer: " + size;

                struct.push("Data " + n + "(3, " + size + ");");
                let x = parseFloat(dict["pos"]["x"]);
                let velx = parseFloat(dict["vel"]["x"]);
                init.push("init_multiple_masses(" + n + ", " + x
                    + ", " + x + " - " + velx + " / SAMPLERATE);");
                compMasses.push(massToCode(n, dict));

                pushMacroToMotionBuffers(n, dict, size);

                if(string){
                    for(let i = 0; i < size; i++){
                        let a = parseFloat(dict["pos"]["y"]);
                        let b = parseFloat(dict["vel"]["y"]);
                        Ycoord.push(a + i * (b - a) / (size-1));

                        a = parseFloat(dict["pos"]["z"]);
                        b = parseFloat(dict["vel"]["z"]);
                        Zcoord.push(a + i * (b - a) / (size-1));
                    }
                }
                else {
                    // TODO: write Y and Z coords for mesh macro elements !
                    // This is wrong !!
                    for(let i = 0; i < size; i++){
                        let a = parseFloat(dict["pos"]["y"]);
                        let b = parseFloat(dict["vel"]["y"]);
                        Ycoord.push(a + i * (b - a) / (size-1));

                        a = parseFloat(dict["pos"]["z"]);
                        b = parseFloat(dict["vel"]["z"]);
                        Zcoord.push(a + i * (b - a) / (size-1));
                    }
                }
            }
        }


        for (let name in interDict) {
            if (interDict.hasOwnProperty(name)) {
                dict = interDict[name];
                let prox1 = false, prox2 = false;
                let mass1, mass2;

                [prox1, mass1] = integrateProxies(dict["m1"], struct, init, compProxyMasses, compProxyInteractions);
                [prox2, mass2] = integrateProxies(dict["m2"], struct, init, compProxyMasses, compProxyInteractions);

                if(!prox1)
                    if (!isPresentInDict(mass1, massDict) && !isPresentInDict(mass1, inOutDict) && !isPresentInDict(mass1, macroDict))
                        throw mass1 + " does not exist in model, can't create interaction " + name;
                if(!prox2)
                    if (!isPresentInDict(mass2, massDict) && !isPresentInDict(mass2, inOutDict) && !isPresentInDict(mass2, macroDict))
                        throw mass2 + " does not exist in model, can't create interaction " + name;

                n = formatModuleName(name);
                compInteractions.push(interactionToCode(n, dict, formatModuleName(mass1), formatModuleName(mass2)));
            }
        }

        for (let name in inOutDict) {
            if (inOutDict.hasOwnProperty(name)) {
                dict = inOutDict[name];
                n = formatModuleName(name);

                // If the module is a position input, it is mostly calculated as a mass element
                if (dict["type"] === "posInput") {
                    struct.push("Data " + n + "(3);");
                    init.push("init_mat(" + n + ", " + parseFloat(dict["pos"]["x"]) + ", " + parseFloat(dict["vel"]["x"]) + ");");
                    compInput.push(inOutToCode(n, dict, null));

                    // Add motion buffer code for the mass-type element
                    Ycoord.push(parseFloat(dict["pos"]["y"]));
                    Zcoord.push(parseFloat(dict["pos"]["z"]));
                    pushToMotionBuffers(n, dict);
                }
                // Otherwise all the in out code codes into a specific section.
                else {
                    let prox = false;
                    let mass;
                    [prox, mass] = integrateProxies(dict["m"], struct, init, compProxyMasses, compProxyInteractions);
                    if(!prox)
                        if (!isInAnyMassDict(mass))
                            throw mass + " does not exist in model, can't create interaction " + name;

                    n = formatModuleName(name);
                    if(dict["type"] === "frcInput")
                        compInteractions.push(inOutToCode(n, dict, formatModuleName(mass)));
                    else
                        compOutput.push(inOutToCode(n, dict, formatModuleName(mass)));
                    if(/^out/.test(n))
                        instanciatedOuts.push(n.toString());
                }
            }
        }

        for (let name in paramDict) {
            if (paramDict.hasOwnProperty(name)) {
                dict = paramDict[name];
                n = formatModuleName(name);

                if (dict["type"] === "param")
                    params.push("Param " + n + "(" + dict["args"] + ");");

                else if (dict["type"] === "audioParam"){
                    let nb = stripInOutToInt(dict["input"]);
                    compInput.push(n + " = in" + nb + ";");
                    nbInputs = Math.max(nbInputs, nb);
                }
            }
        }

        let activeOutputs = nbOutputs;
        for(let i = 1; i <= activeOutputs; i++){
            if(instanciatedOuts.indexOf("out"+i) === -1){
                compOutput.push("out" + i + " = 0.;");
                //nbOutputs++;
                console.log("outputs: " + nbOutputs + ", " + i + "\n");
            }
        }

        // Add one extra output for the number of masses in the model
        compOutput.push("out" + (++nbOutputs) + " = " + massIndex + ";");

        context.push(params.join("\n"));
        context.push("Param display_motion(1);\n");
        context.push("//Model initialisation flag");
        context.push("History model_init(0);");
        context.push("History render_cpt(0);\n");

        codeboxCode = codeboxCode.concat(header.join("\n"));
        codeboxCode = codeboxCode.concat("\n\n");

        codeboxCode = codeboxCode.concat("// Data structure code\n\n");
        codeboxCode = codeboxCode.concat(struct.join("\n"));
        codeboxCode = codeboxCode.concat("\n\n");
        codeboxCode = codeboxCode.concat(context.join("\n"));
        codeboxCode = codeboxCode.concat("\n\n");

        init.unshift("if(model_init == 0){");
        init.unshift("//Initialisation code");
        init.push("model_init = 1;");
        init.push("}");
        codeboxCode = codeboxCode.concat(init.join("\n"));
        codeboxCode = codeboxCode.concat("\n\n");

        codeboxCode = codeboxCode.concat("// Model Computation");
        codeboxCode = codeboxCode.concat("\n\n");

        if(!compInput.isEmpty()){
            codeboxCode = codeboxCode.concat("// Patch input routing\n");
            codeboxCode = codeboxCode.concat(compInput.join("\n"));
            codeboxCode = codeboxCode.concat("\n\n");
        }

        if(!compMasses.isEmpty()){
            codeboxCode = codeboxCode.concat("// Compute new positions of mass-type elements\n");
            codeboxCode = codeboxCode.concat(compMasses.join("\n"));
            codeboxCode = codeboxCode.concat("\n\n");
        }


        if(!compProxyMasses.isEmpty()){
            codeboxCode = codeboxCode.concat("// Compute virtual proxy positions from connected masses\n");
            codeboxCode = codeboxCode.concat(compProxyMasses.join("\n"));
            codeboxCode = codeboxCode.concat("\n\n");
        }

        if(!compInteractions.isEmpty()){
            codeboxCode = codeboxCode.concat("// Compute interaction forces\n");
            codeboxCode = codeboxCode.concat(compInteractions.join("\n"));
            codeboxCode = codeboxCode.concat("\n\n");
        }

        if(!compProxyInteractions.isEmpty()){
            codeboxCode = codeboxCode.concat("// Apply proxy forces to connected material points\n");
            codeboxCode = codeboxCode.concat(compProxyInteractions.join("\n"));
            codeboxCode = codeboxCode.concat("\n\n");
        }

        if(!compOutput.isEmpty()){
            codeboxCode = codeboxCode.concat("// Patch output routing\n");
            codeboxCode = codeboxCode.concat(compOutput.join("\n"));
            codeboxCode = codeboxCode.concat("\n\n");
        }


        codeboxCode = codeboxCode.concat("// Motion data routing to Max/MSP buffer objects\n");
        codeboxCode = codeboxCode.concat("if (display_motion){\n");
        codeboxCode = codeboxCode.concat("if (render_cpt == 0){\n");
        codeboxCode = codeboxCode.concat(motionBufferCode.join("\n"));
        codeboxCode = codeboxCode.concat("\n");

        // insert specific buffer code here
        for(let i = 0; i < bufferList.length; i++){
            codeboxCode = codeboxCode.concat(specificBuffers[bufferList[i]]["code"].join("\n"));
            codeboxCode = codeboxCode.concat("\n");

        }

        codeboxCode = codeboxCode.concat("}\n");
        codeboxCode = codeboxCode.concat("render_cpt = (render_cpt + 1) % 200;\n}\n");


        jsonSpat = {
            Y : Ycoord,
            Z : Zcoord
        }

    }
    catch (e){
        throw("Code Generator Error: " + e);
    }
    console.log("Finished generating gen~ DSP code");
}




function generateFaustCode(){
    if(!macroDict.isEmpty())
        throw "The code contains macro elements, cannot generate for Faust !";

    let fMass = [];
    let fMassIndexMap = {};
    let fInter = [];
    let fParams = [];

    let dict = {};

    let cpt = 0;
    for (let name in massDict) {
        if (massDict.hasOwnProperty(name)) {
            dict = massDict[name];
            let args = dict["args"];
            var type = dict["type"];
            let regArgNb = phyDict.genModDict[type]["nbArgs"];
            let optArgNb = phyDict.genModDict[type]["optArgs"].length;
            let func = phyDict.faustModDict[type]["func"];

            let argstring = "";
            for (let i = 0; i < args.length; i++) {
                if(i >= regArgNb){
                    let paramName = phyDict.faustModDict[type]["optArgs"][i-regArgNb];
                    //argstring = argstring.concat(paramName + " = ");
                    if(paramName === "gravity")
                        argstring = argstring.concat(args[i] + "/ ma.SR");
                    else
                        argstring = argstring.concat(args[i]);
                }
                else
                    argstring = argstring.concat(args[i]);
                argstring = argstring.concat(", ");
            }

            // Fill any non provided extra arguments with zeros
            if(args.length < phyDict.faustModDict[type]["nbArgs"] + phyDict.faustModDict[type]["optArgs"].length)
                argstring = argstring.concat("0, ");
            // Remove last coma (if present)
            argstring = argstring.replace(/,\s*$/,"");

            let pos = dict["pos"]["x"];
            let delPos = pos;
            let posString = "";
            if(type === "ground" )
                posString = pos;
            else{
                if(parseFloat(dict["vel"]["x"]) !== 0)
                    delPos = dict["pos"]["x"] + " - (" + dict["vel"]["x"] + "/ ma.SR)";
                posString =  pos + ", " + delPos;
            }
            if(argstring !== "")
                fMass.push(func +  "(" + argstring + ", " + posString + ")");
            else
                fMass.push(func +  "(" + posString + ")");
            fMassIndexMap[name] = {index:cpt++, pos:pos, posR: delPos};

        }
    }

    let posOutputMasses = {};
    let posInputMasses = {};
    let frcOutputMasses = {};
    let frcInputMasses = {};

    let paramAudioIns = [];

    for (let name in inOutDict) {
        if (inOutDict.hasOwnProperty(name)) {
            dict = inOutDict[name];
            if (dict["type"] === "posInput"){
                fMass.push("posInput(" + dict["pos"]["x"] + ")");
                fMassIndexMap[name] = {index:cpt++, pos:dict["pos"]["x"], posR:dict["pos"]["x"]};
                posInputMasses[stripInOutToInt(name)] = {pos:dict["pos"]["x"]};
            }
        }
    }

    for (let name in inOutDict) {
        if (inOutDict.hasOwnProperty(name)) {
            dict = inOutDict[name];
            if(dict["type"] === "posOutput")
                posOutputMasses[stripInOutToInt(name)] = fMassIndexMap[dict["m"]]["index"];
            else if(dict["type"] === "frcOutput")
                frcOutputMasses[stripInOutToInt(name)] = fMassIndexMap[dict["m"]]["index"];
            else if(dict["type"] === "frcInput")
                frcInputMasses[stripInOutToInt(name)] = fMassIndexMap[dict["m"]]["index"];
        }
    }

    for (let name in paramDict) {
        if (paramDict.hasOwnProperty(name)) {
            dict = paramDict[name];
            if(dict["type"] === "audioParam"){
                let inName = dict["input"].replace("@", "");
                fParams.push(name.replace("@", "")
                    +  " = " + inName);
                paramAudioIns.push(inName);
            }

            else if(dict["type"] === "param")
                fParams.push(name.replace("@", "")
                    +  " = " + dict["args"]);
        }
    }

    ///TODO: get out if there are no interactions !
    let nbMasses = fMass.length;
    let nbInter = Object.keys(interDict).length;
    let routingMatrix = Array(nbMasses).fill(null).map(() => Array(2*nbInter).fill(0));
    let nbOut = Object.keys(posOutputMasses).length + Object.keys(frcOutputMasses).length;

    let nbFrcInput = Object.keys(frcInputMasses).length;

    let i_cpt = 0;
    for (let name in interDict) {
        if (interDict.hasOwnProperty(name)) {
            dict = interDict[name];
            type = dict["type"];
            args = dict["args"];
            let func = phyDict.faustModDict[type]["func"];

            let argstring = "";
            for (let i = 0; i < args.length; i++)
                argstring = argstring.concat(args[i] + ", ");
            // Fill any non provided extra arguments with zeros
            if(args.length < phyDict.faustModDict[type]["nbArgs"] + phyDict.faustModDict[type]["optArgs"].length)
                argstring = argstring.concat("0, ");
            // Remove last coma (if present)
            argstring = argstring.replace(/,\s*$/,"");

            let mass1 = dict["m1"];
            let mass2 = dict["m2"];
            routingMatrix[fMassIndexMap[mass1]["index"]] [2*i_cpt] = 1;
            routingMatrix[fMassIndexMap[mass2]["index"]] [2*i_cpt+1] = 1;

            fInter.push(func +  "(" + argstring + ", " +
                fMassIndexMap[mass1]["posR"] + ", " +
                fMassIndexMap[mass2]["posR"] + ")");

            i_cpt++;
        }
    }

    // Generate the routing tables used by Faust
    let l2m;
    let m2l;

    l2m = "RoutingLinkToMass(";
    for(let i = 0; i < nbInter; i++){
        l2m = l2m.concat("l"+ i +"_f1, l"+ i +"_f2, ");
    }

    let passthrough ="";
    for (let number in posOutputMasses)
        if (posOutputMasses.hasOwnProperty(number))
            passthrough = passthrough.concat("p_out" + number + ", ");
    l2m = l2m.concat(passthrough)

    for (let number in frcInputMasses)
        if (frcInputMasses.hasOwnProperty(number))
            l2m = l2m.concat("f_in" + number + ", ");

    l2m = l2m.replace(/,\s*$/,"");
    l2m = l2m.concat(") = ");

    let forceOutputStrings = [];

    l2m = l2m.concat("/* routed forces  */ ");
    for(let i = 0; i < nbMasses; i++){
        let routed_forces = "";
        let add = 0;

        for(let frc in frcInputMasses)
            if (frcInputMasses.hasOwnProperty(frc))
                if(frcInputMasses[frc] === i){
                    //maxAPI.post("FOUND FORCE TO ADD\n");
                    if(add)
                        routed_forces = routed_forces.concat(" + ");
                    routed_forces = routed_forces.concat("f_in"+frc);
                    add = 1;
                }

        for(let j = 0; j < 2*nbInter; j++)
            if(routingMatrix[i][j] === 1){
                if (add)
                    routed_forces = routed_forces.concat(" + ");
                routed_forces = routed_forces.concat("l" + Math.floor(j/2) + "_f" + ((j%2)+1));
                add = 1;
            }

        if(routed_forces === "")
            routed_forces = "0";

        l2m = l2m.concat(routed_forces);

        for(let frc in frcOutputMasses)
            if (frcOutputMasses.hasOwnProperty(frc))
                if(frcOutputMasses[frc] === i) {
                    forceOutputStrings.push(routed_forces);
                }
        l2m = l2m.concat(", ");
    }

    if(!forceOutputStrings.isEmpty()){
        l2m = l2m.concat("/* force outputs */ ");
        l2m = l2m.concat(forceOutputStrings.join(", "));
        l2m = l2m.concat(", ");
    }

    if(passthrough !== ""){
        l2m = l2m.concat("/* pass-through */ ");
        l2m = l2m.concat(passthrough);
        l2m = l2m.replace(/,\s*$/,"");
    }
    l2m = l2m.replace(/,\s*$/,"");
    l2m = l2m.concat(";");


    // Generate Mat to Link Routing Function
    m2l = "RoutingMassToLink(";
    for(let i = 0; i < nbMasses-1; i++)
        m2l = m2l.concat("m" + i + ", ");
    m2l = m2l.concat("m" + (nbMasses-1) + ") = ")
    m2l = m2l.concat("/* routed positions */ ");
    for(let j = 0; j < 2*nbInter; j++)
        for(let i = 0; i < nbMasses; i++)
            if(routingMatrix[i][j] === 1){
                m2l = m2l.concat("m" + i + ", ");
            }

    if(!posOutputMasses.isEmpty())
        m2l = m2l.concat("/* outputs */ ");

    for (let number in posOutputMasses)
        if (posOutputMasses.hasOwnProperty(number))
            m2l = m2l.concat("m"+posOutputMasses[number] + ", ");

    m2l = m2l.replace(/,\s*$/,";");

    // Alternate way of doing the routing functions: more efficient but less clear...
    /*
    let link2mass = "";
    let mass2link = "";

    for (let cur_ptL = 0; cur_ptL < 2*nbInter; cur_ptL++)
        for (let cur_ptM = 0; cur_ptM < nbMasses; cur_ptM++)
            if(routingMatrix[cur_ptM][cur_ptL]){
                link2mass = link2mass.concat(", " + (cur_ptL + 1) + ", " + (cur_ptM + 1));
                mass2link = mass2link.concat(", " + (cur_ptM + 1) + ", " + (cur_ptL + 1));
            }

    let pos_out = "";
    let i_out = 0;
    for (let name in outputMasses) {
        if (outputMasses.hasOwnProperty(name)) {
            dict = outputMasses[name];
            pos_out = pos_out.concat(", " + (outputMasses[name]+1) + "," + (nbInter*2 + 1 + i_out));
            i_out++;
        }
    }

    let routeLM = "RoutingLinkToMass = " +
     "route(" + (nbInter * 2) + ", " + (nbMasses) + link2mass + ");\n"


    let routeML = "RoutingMassToLink = " +
        "route(" + (nbMasses) + ", " + (nbInter * 2 + Object.keys(outputMasses).length)
        + mass2link + pos_out + ");\n"

    maxAPI.post(routeLM);
    maxAPI.post(routeML);
    */


    // NOW GENERATE THE FAUST CODE
    let fDSP = "import(\"stdfaust.lib\");\nimport(\"mi.lib\");\n\n";

    for (let number in posInputMasses)
        if (posInputMasses.hasOwnProperty(number))
            fDSP = fDSP.concat("in" + number + " = hslider(\"Pos Input " + number + "\", 0, -1, 1, 0.001):si.smoo; "
                +"\t//write a specific position input signal operation here\n");
    for (let number in frcInputMasses)
        if (frcInputMasses.hasOwnProperty(number))
            fDSP = fDSP.concat("in" + number + " = button(\"Frc Input " + number + "\"): ba.impulsify; "
                +" \t//write a specific force input signal operation here\n");

    for(let i = 0; i < paramAudioIns.length; i++)
        fDSP = fDSP.concat(paramAudioIns[i] + " = hslider(\"Param " +
            paramAudioIns[i] + "\", 0.01, 0, 0.1, 0.0001):si.smoo; "
            +"\t//write a specific parameter signal operation here\n");

    fDSP = fDSP.concat("\n");

    fDSP = fDSP.concat("OutGain = 1;");
    fDSP = fDSP.concat("\n\n");

    if(fParams.length>0){
        fDSP = fDSP.concat(fParams.join(";\n"));
        fDSP = fDSP.concat(";\n\n");
    }


    let frcPassThrough = "";
    let interCable = "";
    let outCable = "";
    let interDSP = "";

    let fWith =
        "with{\n\t" + m2l + "\n\t" + l2m +"\n"
        + "\tnbMass = " + nbMasses + ";\n";


    if(nbFrcInput > 0){
        frcPassThrough = ",\n\tpar(i, nbFrcIn,_)";
        fWith = fWith.concat("\tnbFrcIn = " + nbFrcInput + ";\n");
    }

    if (fInter.length > 0)
        interDSP = interDSP.concat(fInter.join(",\n\t") + ",\n");

    if(nbOut+nbFrcInput > 0)
        if(nbFrcInput > 0)
            interCable = "\tpar(i, nbOut+nbFrcIn, _)";
        else
            interCable = "\tpar(i, nbOut, _)";
    else
        interDSP = interDSP.replace(/,\s*$/, "");

    if(nbOut > 0){
        outCable = ", par(i, nbOut , _)";
        fWith = fWith.concat("\tnbOut = " + nbOut + ";\n");
    }

    fWith = fWith.concat("};\n");


    fDSP = fDSP.concat(
        "model = (\n\t"
        + fMass.join(",\n\t")
        + frcPassThrough
        + ":\n\t"
        + "RoutingMassToLink "
        + frcPassThrough
        + ":\n\t"
        + interDSP
        + interCable
        + ":\n\t"
        + "RoutingLinkToMass\n)~par(i, nbMass, _):"
        + "\npar(i, nbMass, !)" + outCable + "\n"
        + fWith
    );


    fDSP = fDSP.concat("process = ");

    let inputs = "";
    for (let number in posInputMasses)
        if (posInputMasses.hasOwnProperty(number))
            inputs = inputs.concat("in" + number + ", ");
    for (let number in frcInputMasses)
        if (frcInputMasses.hasOwnProperty(number))
            inputs = inputs.concat("in" + number + ", ");
    inputs = inputs.replace(/,\s*$/,"");

    if(inputs !== "")
        fDSP = fDSP.concat(inputs + " : ");

    fDSP = fDSP.concat("model");

    if(nbOut > 0){
        fDSP = fDSP.concat(":");
        for(let i = 0; i < nbOut ; i ++)
            fDSP = fDSP.concat("*(OutGain), ")
    }
    fDSP = fDSP.replace(/,\s*$/,"");
    fDSP = fDSP.concat(";");

    return fDSP;
}










/** Some general overloads for object prototypes **/

Number.prototype.clamp = function(min, max) {
    return Math.min(Math.max(this, min), max);
};

Object.prototype.isEmpty = function() {
    for(var key in this) {
        if(this.hasOwnProperty(key))
            return false;
    }
    return true;
};

/** Some utility functions used here and there **/

/**
 * Check if a mass-type element (either a mass or macro or input/output is present in the dictionaries
 * @param mass the name of the element to test (e.g. @m1)
 * @returns {boolean} true if the element is found, false otherwise.
 */
function isInAnyMassDict(mass){
    return isPresentInDict(mass, massDict)  || isPresentInDict(mass, inOutDict) || isPresentInDict(mass, macroDict);
}

/**
 * Format a module label (e.g. @m1) to the format used in gen~ code (m1, or p_in1 if position input).
 * @param name The label of the module in the MIMS script.
 * @returns {void | string} the formatted name to be used in gen~ code.
 */
function formatModuleName(name){
    var m = name.toString().replace("@", "");
    if(/^in/.test(m))
        m = "p_".concat(m);
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
 * Check if a field exists in a dictionary (e.g if the mass "@m1" is present in "massDict".
 * @param name field to test.
 * @param dic the dictionary in which we want to know if the field exists.
 * @returns {boolean} true if present, false otherwise.
 */
function isPresentInDict(name, dic){
    return dic[name] !== undefined;
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
        pdict = {x:posArray[0], y:0, z:0};
    else
        throw "Bad Number of elements in position list " + pos;
    return pdict;
}
