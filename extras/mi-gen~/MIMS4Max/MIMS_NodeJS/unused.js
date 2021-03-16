



/**
 * Parse the module dictionaries of a parsed MIMS Script to generate gen~ codebox code.
 * This method first parses dictionaries of modules to generate lists of code
 * then creates a single string containing the entire codebox code for the model.
 */
function generateGenCode(){

    console.log("uuuuuuhahahaharrrrrrrrrrr");


    // Variables that we will need to store states and generated code
    let nbInputs = 0;
    let nbOutputs = 0;
    let nbProxies = 0;

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

    let jsonSpat = {};
    let codeboxCode = "";

    // Begin nested function declarations

    function pushToMotionBuffers(name, element){
        if(!util.isEmpty(element["buffer"])){
            for(let i = 0; i < element["buffer"].length; i++){
                let bName = element["buffer"][i];
                if (mdl.bufferList.includes(bName)){
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
        if(!util.isEmpty(element["buffer"])){
            for(let i = 0; i < element["buffer"].length; i++){
                let bName = element["buffer"][i];
                if (mdl.bufferList.includes(bName)){
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




    /*
    function mass2code(name, dict, target){

        // Create a string of arguments linked by commas (starting with a comma).
        let argstring = "";
        let args = dict["args"];
        var type = dict["type"];
        let regArgNb = phyDict.genModDict[type]["nbArgs"];
        let optArgNb = phyDict.genModDict[type]["optArgs"].length;

        if (args.length < regArgNb || (args.length > regArgNb + optArgNb))
            throw "Wrong number of arguments to generate mass code for " + name ;

        if (args) {
            for (let i = 0; i < args.length; i++) {
                argstring = argstring.concat(", ");
                if(i >= regArgNb){
                    let paramName = phyDict.genModDict[type]["optArgs"][i-regArgNb];
                    argstring = argstring.concat(paramName + " = ");
                    if(paramName === "gravity"){
                        switch (target){
                            case GEN:
                            default:
                                argstring = argstring.concat(args[i] + " / " + phyDict.genSampleRate);
                                break;
                            case FAUST:
                                argstring = argstring.concat(args[i] + " / " + phyDict.faustSampleRate);
                                break;
                        }
                    }
                    else
                        argstring = argstring.concat(args[i]);
                }
                else
                    argstring = argstring.concat(args[i]);
            }
        }
        if((phyDict.mass_modules.indexOf(type) > -1) || (phyDict.macro_modules.indexOf(type) > -1))
            return phyDict.genModDict[type]["func"] + "(" + name + argstring + ");";

    }
    */


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
        if(phyDict.mass_modules.indexOf(type) > -1)
            return phyDict.genModDict[type]["func"] + "(" + name + argstring + ");";
        else if(phyDict.macro_modules.indexOf(type) > -1)
            return phyDict.genModDict[type]["func"] + "(" + name + argstring + ");";
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

            if (!util.isPresentInDict(macroName, mdl.macroDict))
                throw  pName + " generation error: macro module " + macroName + " does not exist.";

            struct.push("Data " + pName + "(3);");
            init.push("init_mat(" + pName + ", 0, 0);");

            if(mList.length === 2){
                let alpha = mList[1];
                compProxyMasses.push("set_proxy_pos_string("+ pName + ", " + util.formatModuleName(macroName) + ", " + alpha + ");");
                compProxyInteractions.push("apply_proxy_frc_string(" + pName + ", " + util.formatModuleName(macroName) + ", " + alpha + ");");
            }
            else if (mList.length === 3){
                let alpha = mList[1];
                let beta = mList[2];
                compProxyMasses.push("set_proxy_pos_mesh("+ pName + ", " + util.formatModuleName(macroName)
                    + ", " + mdl.macroDict[macroName]["args"][0 ] + ", " + mdl.macroDict[macroName]["args"][1]
                    + ", " + alpha + ", " + beta + ");");
                compProxyInteractions.push("apply_proxy_frc_mesh(" + pName + ", " + util.formatModuleName(macroName)
                    + ", " + mdl.macroDict[macroName]["args"][0] + ", " + mdl.macroDict[macroName]["args"][1]
                    + ", " + alpha + ", " + beta + ");");
            }
            nbProxies++;
            return [true, "@"+pName];
        }
        else{
            if (util.isPresentInDict(mList, mdl.macroDict))
                throw "trying to connect to macro " + mList + ", missing argument";
            return [false, mList[0]];
        }
    }


    function buildInitPosData(dict){
        let z = parseFloat(dict["pos"]["z"]);
        let velz = parseFloat(dict["vel"]["z"]);
        let delPos = z;
        if(velz !== 0){
            delPos = z + " - (" + velz + " / SAMPLERATE )";

        }
        return z + ", " + delPos;
    }

    // End of nested function declarations



    /////////////////////////////////////////////////////
    // Main function: generate the gen code !
    /////////////////////////////////////////////////////

    // Initialise several arrays for specific buffers.
    for(let i = 0; i < mdl.bufferList.length; i++){
        specificBuffers[mdl.bufferList[i]] = {index : 0, code: []};
    }


    console.log("Starting to generate gen~ DSP code\n");

    try {

        header.push('require(\\"migen-lib\\");');
        if(!util.isEmpty(mdl.macroDict)){
            header.push('require(\\"migen-integrated\\");');
            header.push('require(\\"migen-proxies\\");');
        }


        header.push('\nBuffer motion;');
        for(let i = 0; i < mdl.bufferList.length; i++)
            header.push('Buffer ' + mdl.bufferList[i] + ";");

        var dict = {};
        var n = "";

        let Xcoord = [];
        let Ycoord = [];


        ////////////////////////////////////////////////////////////////////////////////
        // Step 1
        // Parse the mass dictionnary to generate genexpr code
        // (using the massToCode function)
        ////////////////////////////////////////////////////////////////////////////////

        for (let name in mdl.massDict) {
            if (mdl.massDict.hasOwnProperty(name)) {
                dict = mdl.massDict[name];
                n = util.formatModuleName(name);
                struct.push("Data " + n + "(3);");
                init.push("init_mat(" + n + ", " + buildInitPosData(dict) + ");");
                compMasses.push(massToCode(n, dict));

                // Add motion buffer code for the mass-type element
                pushToMotionBuffers(n, dict);
                Xcoord.push(parseFloat(dict["pos"]["x"]));
                Ycoord.push(parseFloat(dict["pos"]["y"]));
            }
        }


        ////////////////////////////////////////////////////////////////////////////////
        // Step 2
        // Parse the macro dictionnary to generate genexpr code
        // (also using the massToCode function)
        ////////////////////////////////////////////////////////////////////////////////

        for (let name in mdl.macroDict) {
            if (mdl.macroDict.hasOwnProperty(name)) {
                dict = mdl.macroDict[name];
                n = util.formatModuleName(name);
                let size = 0;
                let type = dict["type"];
                let string = false;

                let length = parseInt(dict["args"][0]);
                let width = 0;

                if((type === "string") || (type === "stiffString") || (type === "chain")){
                    size = length;
                    string = true;
                }
                else {
                    width = parseInt(dict["args"][1]);
                    size = length * width;
                }

                if (isNaN(size))
                    throw "Macro length argument for " + name + " cannot be converted to an integer: " + size;

                struct.push("Data " + n + "(3, " + size + ");");
                init.push("init_multiple_masses(" + n + ", " + buildInitPosData(dict) + ");");
                compMasses.push(massToCode(n, dict));

                pushMacroToMotionBuffers(n, dict, size);

                if(string){
                    for(let i = 0; i < size; i++){
                        let a = parseFloat(dict["pos"]["x"]);
                        let b = parseFloat(dict["vel"]["x"]);
                        Xcoord.push(a + i * (b - a) / (size-1));

                        a = parseFloat(dict["pos"]["y"]);
                        b = parseFloat(dict["vel"]["y"]);
                        Ycoord.push(a + i * (b - a) / (size-1));
                    }
                }
                else {
                    // TODO: write Y and Z coords for mesh macro elements !
                    // This is wrong !!
                    for(let i = 0; i < size; i++){
                        let a = parseFloat(dict["pos"]["x"]);
                        let b = parseFloat(dict["vel"]["x"]);
                        Xcoord.push(a + i * (b - a) / (size-1));

                        a = parseFloat(dict["pos"]["y"]);
                        b = parseFloat(dict["vel"]["y"]);
                        Ycoord.push(a + i * (b - a) / (size-1));
                    }
                }
            }
        }


        ////////////////////////////////////////////////////////////////////////////////
        // Step 3
        // Parse the interaction dictionnary to generate genexpr code
        // using the interactionToCode function as well as the integrateProxies function
        ////////////////////////////////////////////////////////////////////////////////

        for (let name in mdl.interDict) {
            if (mdl.interDict.hasOwnProperty(name)) {
                dict = mdl.interDict[name];
                let prox1 = false, prox2 = false;
                let mass1, mass2;

                [prox1, mass1] = integrateProxies(dict["m1"]);
                [prox2, mass2] = integrateProxies(dict["m2"]);

                if(!prox1)
                    if (mdl.isNotPresentInMassOrInOut(mass1))
                        throw mass1 + " does not exist in model, can't create interaction " + name;
                if(!prox2)
                    if (mdl.isNotPresentInMassOrInOut(mass2))
                        throw mass2 + " does not exist in model, can't create interaction " + name;

                n = util.formatModuleName(name);
                compInteractions.push(interactionToCode(n, dict, util.formatModuleName(mass1), util.formatModuleName(mass2)));
            }
        }


        ////////////////////////////////////////////////////////////////////////////////
        // Step 4
        // Parse the input and output dictionnary to generate genexpr code
        // using the inOutToCode function
        ////////////////////////////////////////////////////////////////////////////////

        for (let name in mdl.inOutDict) {
            if (mdl.inOutDict.hasOwnProperty(name)) {
                dict = mdl.inOutDict[name];
                n = util.formatModuleName(name);

                // If the module is a position input, it is mostly calculated as a mass element
                if (dict["type"] === "posInput") {
                    struct.push("Data " + n + "(3);");
                    init.push("init_mat(" + n + ", " + parseFloat(dict["pos"]["z"]) + ", " + parseFloat(dict["pos"]["z"]) + ");");
                    compInput.push(inOutToCode(n, dict, null));

                    // Add motion buffer code for the mass-type element
                    Xcoord.push(parseFloat(dict["pos"]["x"]));
                    Ycoord.push(parseFloat(dict["pos"]["y"]));
                    pushToMotionBuffers(n, dict);
                }

                // Otherwise all the in out code codes into a specific section.
                else {
                    let prox = false;
                    let mass;
                    [prox, mass] = integrateProxies(dict["m"]);
                    if(!prox)
                        if (!mdl.isInAnyMassDict(mass))
                            throw mass + " does not exist in model, can't create interaction " + name;

                    n = util.formatModuleName(name);
                    if(dict["type"] === "frcInput")
                        compInteractions.push(inOutToCode(n, dict, util.formatModuleName(mass)));
                    else
                        compOutput.push(inOutToCode(n, dict, util.formatModuleName(mass)));
                    if(/^out/.test(n))
                        instanciatedOuts.push(n.toString());
                }
            }
        }


        ////////////////////////////////////////////////////////////////////////////////
        // Step 5
        // Parse the param dictionnary to generate genexpr code
        ////////////////////////////////////////////////////////////////////////////////

        for (let name in mdl.paramDict) {
            if (mdl.paramDict.hasOwnProperty(name)) {
                dict = mdl.paramDict[name];
                n = util.formatModuleName(name);

                if (dict["type"] === "param")
                    params.push("Param " + n + "(" + dict["args"] + ");");

                else if (dict["type"] === "audioParam"){
                    let nb = util.stripInOutToInt(dict["input"]);
                    compInput.push(n + " = in" + nb + ";");
                    nbInputs = Math.max(nbInputs, nb);
                }
            }
        }


        ////////////////////////////////////////////////////////////////////////////////
        // Step 6
        // Set the outputs for the codebox object.
        ////////////////////////////////////////////////////////////////////////////////

        let activeOutputs = nbOutputs;
        for(let i = 1; i <= activeOutputs; i++){
            if(instanciatedOuts.indexOf("out"+i) === -1){
                compOutput.push("out" + i + " = 0.;");
                console.log("outputs: " + nbOutputs + ", " + i + "\n");
            }
        }
        // Add one extra output for the number of masses in the model
        compOutput.push("out" + (++nbOutputs) + " = " + massIndex + ";");


        ////////////////////////////////////////////////////////////////////////////////
        // Step 7
        // Assemble all of the generated code fragments into the final genexpr code
        ////////////////////////////////////////////////////////////////////////////////

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

        if(!util.isEmpty(compInput)){
            codeboxCode = codeboxCode.concat("// Patch input routing\n");
            codeboxCode = codeboxCode.concat(compInput.join("\n"));
            codeboxCode = codeboxCode.concat("\n\n");
        }

        if(!util.isEmpty(compMasses)){
            codeboxCode = codeboxCode.concat("// Compute new positions of mass-type elements\n");
            codeboxCode = codeboxCode.concat(compMasses.join("\n"));
            codeboxCode = codeboxCode.concat("\n\n");
        }


        if(!util.isEmpty(compProxyMasses)){
            codeboxCode = codeboxCode.concat("// Compute virtual proxy positions from connected masses\n");
            codeboxCode = codeboxCode.concat(compProxyMasses.join("\n"));
            codeboxCode = codeboxCode.concat("\n\n");
        }

        if(!util.isEmpty(compInteractions)){
            codeboxCode = codeboxCode.concat("// Compute interaction forces\n");
            codeboxCode = codeboxCode.concat(compInteractions.join("\n"));
            codeboxCode = codeboxCode.concat("\n\n");
        }

        if(!util.isEmpty(compProxyInteractions)){
            codeboxCode = codeboxCode.concat("// Apply proxy forces to connected material points\n");
            codeboxCode = codeboxCode.concat(compProxyInteractions.join("\n"));
            codeboxCode = codeboxCode.concat("\n\n");
        }

        if(!util.isEmpty(compOutput)){
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
        for(let i = 0; i < mdl.bufferList.length; i++){
            codeboxCode = codeboxCode.concat(specificBuffers[mdl.bufferList[i]]["code"].join("\n"));
            codeboxCode = codeboxCode.concat("\n");
        }

        codeboxCode = codeboxCode.concat("}\n");
        codeboxCode = codeboxCode.concat("render_cpt = (render_cpt + 1) % 200;\n}\n");


        ////////////////////////////////////////////////////////////////////////////////
        // Mini (optional) final step:
        // Create a json file with the complementary X and Y coordinates for all material elements
        // This was supposed to be used to help generating jitter visualisation, but was never finished.
        ////////////////////////////////////////////////////////////////////////////////

        jsonSpat = {
            X : Xcoord,
            Y : Ycoord
        };

        console.log("Finished generating gen~ DSP code");
        return [codeboxCode, nbInputs, nbOutputs, jsonSpat];

    }
    catch (e){
        throw("Gen~ Code Generator Error: " + e);
    }
}

