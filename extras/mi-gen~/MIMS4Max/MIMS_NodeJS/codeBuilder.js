const util = require("./utility.js");
const phyDict = require("./phyDict.js");



var TARGET = {
    UNDEFINED : {value: -1, name: "none"},
    GEN : {value: 0, name: "gen~"},
    FAUST: {value: 1, name: "Faust"},
    PROCESSING : {value: 2, name: "Processing"}
};



class AbstractCodeBuilder {

    /**
     * Abstract constructor, mainly used to declare class attributes.
     */
    constructor(model) {

        if (new.target === AbstractCodeBuilder) {
            throw new TypeError("Cannot construct AbstractCodeBuilder instances directly, please construct subclass");
        }

        this.m_target = TARGET.UNDEFINED;
        this.m_generatedCode = "";
        this.m_sampleRateString = "";
        this.m_targetDict = {};
        this.model = model;
        this.nbProxies = 0;
        this.sampleRateInvariant = 1;
    }

    /**
     * Create a string of arguments separated by commas from a given module (mass or interaction, etc)
     * @param name name of the module
     * @param dict dictionnary associated with the module
     * @returns {string} the string of arguments.
     */
    makeArgString(dict){

        //console.log(dict);

        let argstring = "";
        let args = dict["args"];
        var type = dict["type"];
        let regArgNb = this.m_targetDict[type]["nbArgs"];
        let optArgNb = this.m_targetDict[type]["optArgs"].length;

        if (args.length < regArgNb || (args.length > regArgNb + optArgNb))
            throw "Wrong number of arguments to generate code for " + dict ;

        if (args) {

            //console.log("full dict: " + args);
            for(let param in args){
                //console.log("current element dict: " + dictVal);
                //console.log("current element dict: " + args[dictVal]);

                argstring = argstring.concat(", ");

                switch(param){
                    case "M":
                        argstring = argstring.concat(args[param]);
                        break;

                    case "K":
                    case "K2":
                    case "Knl":
                    case "KnlP":
                    case "KnlQ":
                    case "Klim":

                        argstring = argstring.concat(args[param] + " * _Ksr");
                        break;

                    case "Z":
                    case "Znl":
                    case "Vscale":
                        argstring = argstring.concat(args[param] + " * _Zsr");
                        break;

                    

                    case "gravity":
                        argstring = argstring.concat("gravity = " + args[param] + " * _Ksr / 44100");
                        break;

                    case "thresh":
                        argstring = argstring.concat("thresh = " + args[param]);
                        break;

                    case "Zo":
                        argstring = argstring.concat("Zo = " + args[param] + " * _Zsr");
                        break;

                    case "smooth":
                        argstring = argstring.concat("smooth = " + args[param]);
                        break;
                    

                    default:
                        argstring = argstring.concat(args[param]);

                }
            }

        }

        //console.log(argstring);
        
        /*
        if (args) {
            for (let i = 0; i < args.length; i++) {
                argstring = argstring.concat(", ");
                if(i >= regArgNb){
                    let paramName = phyDict.genModDict[type]["optArgs"][i-regArgNb];
                    argstring = argstring.concat(paramName + " = ");


                    if(paramName === "gravity")
                        argstring = argstring.concat(args[i] + " / " + this.m_sampleRateString);
                    else
                        argstring = argstring.concat(args[i]);
                }
                else
                    argstring = argstring.concat(args[i]);
            }
        }
        */
        return argstring;
    }

    /**
     * Build a string with the position and delayed position for 1D elements,
     * taking into account the target's sample rate format
     * @param dict dictionary of the material element to process.
     * @returns {*[]} a string containing the position and delayed position (separated by a comma).
     */
    buildInitPos1D(dict){
        let z = parseFloat(dict["pos"]["z"]);
        let velz = parseFloat(dict["vel"]["z"]);
        let delPos = z;
        if(velz !== 0)
            delPos = z + " - (" + velz + " / " + this.m_sampleRateString + ")";
        //return z + ", " + delPos;
        return [z.toString(), delPos.toString()];
    }

    /**
     * Check that a module type exists in the dictionary of physical modules
     * @param type
     * @param moduleDict
     * @returns {number}
     */
    checkIsValidModuleType(type, moduleDict){
    if(moduleDict.indexOf(type) > -1)
        return 1;
    else
        return 0;
    }


    /**
     * Check for proxies: if an interaction connects one or several macro elements, we must create proxies and re-route connections.
     * @param mList array with the mass name (will either be a name e.g @m1, or a name and list e.g [@s 0.1]
     * @returns {*[]} state (true or false, name of proxy module, and a dict of proxy information so it can be created according to target
     */
    checkForProxies(mList){
        let macroName;

        // If the mList is a composed term, then we have a proxy on our hands
        if(mList.length > 1){
            macroName = mList[0];
            let pName = "@proxy_" + this.nbProxies;

            if (!util.isPresentInDict(macroName, mdl.macroDict))
                throw  pName + " Code generation error: macro module " + macroName + " does not exist.";

            let alpha = mList[1];
            let beta = null;
            let proxType = "1D";
            if(mList.length === 3){
               beta = mList[2];
               proxType = "2D";
            }

            this.nbProxies++;
            return [true, pName, {"macroName":macroName, "proxType": proxType, "alpha":alpha, "beta":beta, "name":pName}];
        }
        else{
            if (util.isPresentInDict(mList, mdl.macroDict))
                throw "trying to connect to macro " + mList + ", but missing an argument.";
            return [false, mList[0], null];
        }
    }

}


/**
 * Gen DSP code builder class. Takes the model description and generated genexpr code,
 * to be used with the mi-gen library.
 */
class GenCodeBuilder extends AbstractCodeBuilder {

    /**
     * Create an instance of the class with a given model reference.
     * The constructor will specify certain things that are specific to Max/gen~'s terminology and
     * tell the builder to use the gen~ module dictionary.
     * @param model the physical model.
     */
    constructor(model){
        super(model);
        this.m_target = TARGET.GEN;
        this.m_targetDict = phyDict.genModDict;
        this.m_sampleRateString = "SAMPLERATE";
        this.clear();
    }

    /**
     * Clear the state of the code generator.
     */
    clear(){
        // Number of inputs, outputs and proxies in the resulting gen~ code
        this.nbInputs = 0;
        this.nbOutputs = 0;
        this.nbProxies = 0;

        // Code structure: various elements that must be declared outside the physics loop
        this.header = [];
        this.struct = [];
        this.context = [];
        this.params = [];
        this.init = [];

        // Code structure for the physics loop
        this.compMasses = [];
        this.compInteractions = [];
        this.compInput = [];
        this.compOutput = [];
        this.compProxyMasses = [];
        this.compProxyInteractions = [];

        // Buffer code for rendering purposes
        this.motionBufferCode = [];
        this.specificBuffers = {};

        this.massIndex = 0;
        this.instanciatedOuts = [];
    }

    /**
     * Gen specific operation: push a single physical element into the motion buffers for rendering
     * @param name name of the physical element
     * @param element dictionary of the physical element
     */
    pushToMotionBuffers(name, element){
        if(!util.isEmpty(element["buffer"])){
            for(let i = 0; i < element["buffer"].length; i++){
                let bName = element["buffer"][i];
                if (mdl.bufferList.includes(bName)){
                    this.specificBuffers[bName]["code"].push(bName +
                        ".poke(get_pos("+ name +"), "
                        + this.specificBuffers[bName]["index"] + ", 0);");
                    this.specificBuffers[bName]["index"]++;
                }
            }
        }
        this.motionBufferCode.push("motion.poke(get_pos("+ name +"), " + this.massIndex + ", 0);");
        this.massIndex++;
    }

    /**
     * Gen specific operation: push a macro physical element into the motion buffers for rendering
     * @param name name of the macro physical element
     * @param element dictionary of the macro physical element
     * @size the size of the macro element (in number of elementary physical modules)
     */
    pushMacroToMotionBuffers(name, element, size){
        if(!util.isEmpty(element["buffer"])){
            for(let i = 0; i < element["buffer"].length; i++){
                let bName = element["buffer"][i];
                if (mdl.bufferList.includes(bName)){
                    this.specificBuffers[bName]["code"].push("for(i = 0; i < channels("+ name +"); i+=1){");
                    this.specificBuffers[bName]["code"].push(bName + ".poke(get_pos_at("+ name +", i), "
                        + this.specificBuffers[bName]["index"] + " + i" + ", 0);");
                    this.specificBuffers[bName]["code"].push("}");
                    this.specificBuffers[bName]["index"] += size;
                }
            }
        }
        this.motionBufferCode.push("for(i = 0; i < channels("+ name +"); i+=1){");
        this.motionBufferCode.push("motion.poke(get_pos_at("+ name +", i), " + this.massIndex + " + i" + ", 0);");
        this.motionBufferCode.push("}");
        this.massIndex += size;
    }


    /**
     * Generate the additional code for a proxy module once we have detected one
     * @param name the name of the proxy module
     * @param proxDict a dictionary containing the relevant information for the module
     */
    createProxyInstance(pName, proxDict){

        let name = util.formatModuleName(pName);

            this.struct.push("Data " + name + "(3);");
            this.init.push("init_mat(" + name + ", 0, 0);");

            if(proxDict["proxType"] === "1D"){
                let proxArgs = name + ", "
                    + util.formatModuleName(proxDict["macroName"])
                    + ", " + proxDict["alpha"];

                this.compProxyMasses.push("set_proxy_pos_string("+ proxArgs + ");");
                this.compProxyInteractions.push("apply_proxy_frc_string(" + proxArgs + ");");
            }
            else if (proxDict["proxType"] === "2D"){
                let proxArgs = name + ", "
                    + util.formatModuleName(proxDict["macroName"])
                    + ", " + this.model.macroDict[proxDict["macroName"]]["args"]["nbX"]
                    + ", " + this.model.macroDict[proxDict["macroName"]]["args"]["nbY"]
                    + ", " + proxDict["alpha"]
                    + ", " + proxDict["beta"];

                this.compProxyMasses.push("set_proxy_pos_mesh(" + proxArgs + ");");
                this.compProxyInteractions.push("apply_proxy_frc_mesh(" + proxArgs + ");");
            }
    }

    /* Could probably extract some generic stuff from here to pool with the Faust generation stuff */

    inOutToCode(name, dict, connect){
        let type = dict["type"];

        if (type === "posInput"){
            let nb = parseInt(name.replace("p_in", ""));
            this.nbInputs = Math.max(this.nbInputs, nb);
            return phyDict.genModDict[type]["func"] + "(" + name + ", in" + nb.toString() + ");";
        }
        else if (type === "posOutput"){
            let nb = parseInt(name.replace("out", ""));
            //console.log(nb + "\n");
            this.nbOutputs = Math.max(this.nbOutputs, nb);
            return "out"+ nb.toString() + " = get_pos(" + connect + ");" ;
        }
        else if (type === "frcOutput"){
            let nb = parseInt(name.replace("out", ""));
            this.nbOutputs = Math.max(this.nbOutputs, nb);
            return "out"+ nb.toString() + " = get_frc(" + connect + ");" ;
        }
        else if (type === "frcInput"){
            let nb = parseInt(name.replace("p_in", ""));
            this.nbInputs = Math.max(this.nbInputs, nb);
            return "apply_input_force(" + connect + ", in"+ nb.toString() + ");";
        }
    }


    /**
     * Create gendsp code from the model dictionary
     */
    compileToGenExpr() {
        console.log("Starting to generate gen~ DSP code\n");

        // Initialise several arrays for specific buffers.
        for(let i = 0; i < this.model.bufferList.length; i++){
            this.specificBuffers[this.model.bufferList[i]] = {index : 0, code: []};
        }


        try {

            this.header.push("// Code generated by the mi-gen~ compiler");
            this.header.push("// Developed by James Leonard");
            this.header.push("// james [at] plasticlobsterstudios [dot] com\n");


            this.header.push('require(\\"migen-lib\\");');
            if (!util.isEmpty(mdl.macroDict)) {
                this.header.push('require(\\"migen-integrated\\");');
                this.header.push('require(\\"migen-proxies\\");');
            }


            this.header.push('\nBuffer motion;');
            for (let i = 0; i < mdl.bufferList.length; i++)
                this.header.push('Buffer ' + mdl.bufferList[i] + ";");

            let Xcoord = [];
            let Ycoord = [];

            // Step 1: Build the mass element code

            for (let name in this.model.massDict) {
                if (this.model.massDict.hasOwnProperty(name)) {
                    let dict = this.model.massDict[name];
                    let n = util.formatModuleName(name);
                    let type = dict["type"];

                    // Make sure that the type of this module really exists, throw error otherwise
                    if (!this.checkIsValidModuleType(type, phyDict.mass_modules))
                        throw type + " is an unknown module in " + phyDict.mass_modules;

                    this.struct.push("Data " + n + "(3);");
                    this.init.push("init_mat(" + n + ", " + this.buildInitPos1D(dict).join(", ") + ");");

                    this.compMasses.push(
                        this.m_targetDict[type]["func"]
                        + "(" + n + this.makeArgString(dict) + ");"
                    );

                    // Add motion buffer code for the mass-type element
                    this.pushToMotionBuffers(n, dict);
                    Xcoord.push(parseFloat(dict["pos"]["x"]));
                    Ycoord.push(parseFloat(dict["pos"]["y"]));
                }
            }

            // Step 2: build the macro element code

            for (let name in this.model.macroDict) {
                if (this.model.macroDict.hasOwnProperty(name)) {
                    let dict = this.model.macroDict[name];
                    let n = util.formatModuleName(name);
                    let type = dict["type"];

                    // Make sure that the type of this module really exists, throw error otherwise
                    if (!this.checkIsValidModuleType(type, phyDict.macro_modules))
                        throw type + " is an unknown module in " + phyDict.macro_modules;


                    let size = 0;
                    let string = false;
                    let length = parseInt(dict["args"]["nbMass"]);
                    let width = 0;

                    if((type === "string") || (type === "stiffString") || (type === "chain")){
                        size = length;
                        string = true;
                    }
                    else {
                        console.log(parseInt(dict["args"]["nbX"]));
                        console.log(parseInt(dict["args"]["nbY"]));

                        length = parseInt(dict["args"]["nbX"]);
                        width = parseInt(dict["args"]["nbY"]);
                        size = length * width;
                    }

                    if (isNaN(size))
                        throw "Macro length argument for " + name + " cannot be converted to an integer: " + size;

                    this.struct.push("Data " + n + "(3, " + size + ");");
                    this.init.push("init_multiple_masses(" + n + ", " + this.buildInitPos1D(dict).join(", ") + ");");

                    this.compMasses.push(
                        this.m_targetDict[type]["func"]
                        + "(" + n + this.makeArgString(dict) + ");"
                    );

                    this.pushMacroToMotionBuffers(n, dict, size);

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
                        // TODO: This is wrong !!
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

            // Step 3 : Interactions

            for (let name in this.model.interDict) {
                if (this.model.interDict.hasOwnProperty(name)) {
                    let dict = this.model.interDict[name];
                    let prox1 = false, prox2 = false;
                    var type = dict["type"];
                    let n = util.formatModuleName(name);
                    let mass1, mass2, proxDict1, proxDict2;

                    // Check if these interactions are connected to any proxy modules
                    [prox1, mass1, proxDict1] = this.checkForProxies(dict["m1"]);
                    [prox2, mass2, proxDict2] = this.checkForProxies(dict["m2"]);


                    // If they are, create the proxy code, else just check that the modules exist.
                    if(prox1)
                        this.createProxyInstance(mass1, proxDict1);
                    else {
                        if (this.model.isNotPresentInMassOrInOut(mass1))
                            throw mass1 + " does not exist in model, can't create interaction " + name;
                    }

                    if(prox2)
                        this.createProxyInstance(mass2, proxDict2);
                    else{
                        if (this.model.isNotPresentInMassOrInOut(mass2))
                            throw mass2 + " does not exist in model, can't create interaction " + name;
                    }

                    // Now create the gen code for the interaction
                    this.compInteractions.push(
                        this.m_targetDict[type]["func"] + "(" +
                        util.formatModuleName(mass1) + ", " + util.formatModuleName(mass2) +
                        this.makeArgString(dict) + ");"
                    );
                }
            }

            // Step 4 : Inputs and outputs

            for (let name in this.model.inOutDict) {
                if (this.model.inOutDict.hasOwnProperty(name)) {
                    let dict = this.model.inOutDict[name];
                    let n = util.formatModuleName(name);

                    // If the module is a position input, it is mostly calculated as a mass element
                    if (dict["type"] === "posInput") {
                        this.struct.push("Data " + n + "(3);");
                        this.init.push("init_mat(" + n + ", " + parseFloat(dict["pos"]["z"]) + ", " + parseFloat(dict["pos"]["z"]) + ");");
                        this.compInput.push(this.inOutToCode(n, dict, null));

                        // Add motion buffer code for the mass-type element
                        Xcoord.push(parseFloat(dict["pos"]["x"]));
                        Ycoord.push(parseFloat(dict["pos"]["y"]));
                        this.pushToMotionBuffers(n, dict);
                    }

                    // Otherwise all the in out code codes into a specific section.
                    else {
                        let prox = false;
                        let mass, proxDict;

                        // Check if this input/output is related to a proxy
                        [prox, mass, proxDict] = this.checkForProxies(dict["m"]);

                        // If so, create the proxy instance
                        if(prox)
                            this.createProxyInstance(mass, proxDict);
                        else {
                            if (this.model.isNotPresentInMassOrInOut(mass))
                                throw mass + " does not exist in model, can't create interaction " + name;
                        }

                        n = util.formatModuleName(name);

                        if(dict["type"] === "frcInput")
                            this.compInteractions.push(this.inOutToCode(n, dict, util.formatModuleName(mass)));
                        else
                            this.compOutput.push(this.inOutToCode(n, dict, util.formatModuleName(mass)));
                        if(/^out/.test(n))
                            this.instanciatedOuts.push(n.toString());
                    }
                }
            }

            // Step 5: parse the param dict to generate parameter code

            for (let name in this.model.paramDict) {
                if (this.model.paramDict.hasOwnProperty(name)) {
                    let dict = this.model.paramDict[name];
                    let n = util.formatModuleName(name);

                    if (dict["type"] === "param")
                        this.params.push("Param " + n + "(" + dict["args"] + ");");

                    else if (dict["type"] === "audioParam"){
                        let nb = util.stripInOutToInt(dict["input"]);
                        this.compInput.push(n + " = in" + nb + ";");
                        this.nbInputs = Math.max(this.nbInputs, nb);
                    }
                }
            }


            // Step 6 : Figure out the right number of outputs

            let activeOutputs = this.nbOutputs;
            for(let i = 1; i <= activeOutputs; i++){
                if(this.instanciatedOuts.indexOf("out"+i) === -1){
                    this.compOutput.push("out" + i + " = 0.;");
                    console.log("outputs: " + this.nbOutputs + ", " + i + "\n");
                }
            }
            // Add one extra output for the number of masses in the model
            this.compOutput.push("out" + (++this.nbOutputs) + " = " + this.massIndex + ";");

            // Step 7 : build the final code from all of this !

            this.context.push(this.params.join("\n"));
            this.context.push("Param display_motion(1);\n");
            this.context.push("//Model initialisation flag");
            this.context.push("History model_init(0);");
            this.context.push("History render_cpt(0);\n");

            if(this.model.sampleRateInvariant === 1){
                this.context.push("//Make the model sample rate 'invariant'");
                this.context.push('_Zsr = 44100 / SAMPLERATE;');
                this.context.push('_Ksr = _Zsr * _Zsr;');
                //this.context.push('_Gsr = _Ksr / 44100;');
            }
            else {
                this.context.push("//Basic param factors: behaviour will shift with sample rate");
                this.context.push('_Zsr = 1;');
                this.context.push('_Ksr = 1;');
                //this.context.push('_Gsr = 1 / SAMPLERATE;');

            }

            this.init.unshift("if(model_init == 0){");
            this.init.unshift("//Initialisation code");
            this.init.push("model_init = 1;");
            this.init.push("}");

            let codeboxCode = "";

            codeboxCode = codeboxCode.concat(this.header.join("\n"));
            codeboxCode = codeboxCode.concat("\n\n");

            codeboxCode = codeboxCode.concat("// Data structure code\n\n");
            codeboxCode = codeboxCode.concat(this.struct.join("\n"));
            codeboxCode = codeboxCode.concat("\n\n");
            codeboxCode = codeboxCode.concat(this.context.join("\n"));
            codeboxCode = codeboxCode.concat("\n\n");

            codeboxCode = codeboxCode.concat(this.init.join("\n"));
            codeboxCode = codeboxCode.concat("\n\n");

            codeboxCode = codeboxCode.concat("// Model Computation");
            codeboxCode = codeboxCode.concat("\n\n");

            if(!util.isEmpty(this.compInput)){
                codeboxCode = codeboxCode.concat("// Patch input routing\n");
                codeboxCode = codeboxCode.concat(this.compInput.join("\n"));
                codeboxCode = codeboxCode.concat("\n\n");
            }

            if(!util.isEmpty(this.compMasses)){
                codeboxCode = codeboxCode.concat("// Compute new positions of mass-type elements\n");
                codeboxCode = codeboxCode.concat(this.compMasses.join("\n"));
                codeboxCode = codeboxCode.concat("\n\n");
            }

            if(!util.isEmpty(this.compProxyMasses)){
                codeboxCode = codeboxCode.concat("// Compute virtual proxy positions from connected masses\n");
                codeboxCode = codeboxCode.concat(this.compProxyMasses.join("\n"));
                codeboxCode = codeboxCode.concat("\n\n");
            }

            if(!util.isEmpty(this.compInteractions)){
                codeboxCode = codeboxCode.concat("// Compute interaction forces\n");
                codeboxCode = codeboxCode.concat(this.compInteractions.join("\n"));
                codeboxCode = codeboxCode.concat("\n\n");
            }

            if(!util.isEmpty(this.compProxyInteractions)){
                codeboxCode = codeboxCode.concat("// Apply proxy forces to connected material points\n");
                codeboxCode = codeboxCode.concat(this.compProxyInteractions.join("\n"));
                codeboxCode = codeboxCode.concat("\n\n");
            }

            if(!util.isEmpty(this.compOutput)){
                codeboxCode = codeboxCode.concat("// Patch output routing\n");
                codeboxCode = codeboxCode.concat(this.compOutput.join("\n"));
                codeboxCode = codeboxCode.concat("\n\n");
            }

            codeboxCode = codeboxCode.concat("// Motion data routing to Max/MSP buffer objects\n");
            codeboxCode = codeboxCode.concat("if (display_motion){\n");
            codeboxCode = codeboxCode.concat("if (render_cpt == 0){\n");
            codeboxCode = codeboxCode.concat(this.motionBufferCode.join("\n"));
            codeboxCode = codeboxCode.concat("\n");

            // insert specific buffer code here
            for(let i = 0; i < mdl.bufferList.length; i++){
                codeboxCode = codeboxCode.concat(this.specificBuffers[mdl.bufferList[i]]["code"].join("\n"));
                codeboxCode = codeboxCode.concat("\n");
            }

            codeboxCode = codeboxCode.concat("}\n");
            codeboxCode = codeboxCode.concat("render_cpt = (render_cpt + 1) % 200;\n}\n");

            this.m_generatedCode = codeboxCode;


            ////////////////////////////////////////////////////////////////////////////////
            // Mini (optional) final step:
            // Create a json file with the complementary X and Y coordinates for all material elements
            // This was supposed to be used to help generating jitter visualisation, but was never finished.
            ////////////////////////////////////////////////////////////////////////////////

            let jsonSpat = {
                X : Xcoord,
                Y : Ycoord
            };

            console.log("Finished generating gen~ DSP code");
            return [this.m_generatedCode, this.nbInputs, this.nbOutputs, jsonSpat];


        } catch (e) {
            throw("Gen~ Code Generator Error: " + e);
        }
    }

}





class FaustCodeBuilder extends AbstractCodeBuilder{

    constructor(model){
         super(model);
         this.m_target = TARGET.FAUST;
         this.m_targetDict = phyDict.faustModDict;
         this.m_sampleRateString = "ma.SR";
    }


    handleWrapper(proxDict, mWrappers, typeString){
        let macroName = util.formatModuleName(proxDict["macroName"]);
        let type = proxDict["proxType"];

        // First find the macro module in question
        if(!util.isPresentInDict(macroName, mWrappers))
            throw "The macro module " + macroName + "does not exist!";

        let newWrapper = {
            type: typeString,
            topology : type,
            alpha : proxDict["alpha"],
            beta : proxDict["beta"],
            name : proxDict["name"]
        };

        mWrappers[macroName].push(newWrapper);
    }

    compileToFaustDsp(){

        console.log("About to start building Faust DSP code...");

        //if(!util.isEmpty(mdl.macroDict))
        //    throw "The code contains macro elements, cannot generate Faust code !";

        try{

            // All the variables and state variables that we will need
            let fMass = [];
            let fMassIndexMap = {};
            let fInter = [];
            let fParams = [];

            let fFunctions = [];
            let fMacro = [];

            let posOutputMasses = {};
            let posInputMasses = {};
            let frcOutputMasses = {};
            let frcInputMasses = {};

            let macroAttributes = {};
            let macroWrappers = {};
            let macroCpt = 0;

            let deferredInteractions = [];

            let paramAudioIns = [];
            let cpt = 0;

            ////////////////////////////////////////////////////////////
            // Step 1
            // Parse the mass dictionary to generate Faust expressions
            ////////////////////////////////////////////////////////////

            for (let name in this.model.massDict) {
                if (this.model.massDict.hasOwnProperty(name)) {
                    let dict = this.model.massDict[name];
                    let args = dict["args"];
                    let type = dict["type"];

                    if(!this.checkIsValidModuleType(type, phyDict.mass_modules))
                        throw type + " is an unknown module in " + phyDict.mass_modules;

                    // In Faust we must fill in "optional" arguments with actual values
                    if(args.length < this.m_targetDict[type]["nbArgs"] + this.m_targetDict[type]["optArgs"].length)
                        args.push("0");
                    let argstring = args.join(", ");

                    let posData = this.buildInitPos1D(dict);

                    // if the module is a ground, it only takes one initial parameter (no velocity)
                    if(type ==="ground"){
                        fMassIndexMap[name] = {index:cpt++, pos:posData[0], posR: posData[0]};
                        fMass.push(this.m_targetDict[type]["func"] +  "(" + posData[0]  + ")");
                    }
                    else {
                        fMassIndexMap[name] = {index:cpt++, pos:posData[0], posR: posData[1]};
                        fMass.push(this.m_targetDict[type]["func"] +  "(" + argstring + ", " + posData.join(", ") + ")");
                    }
                }
            }


            // Step 2: build the macro element code

            for (let name in this.model.macroDict) {
                if (this.model.macroDict.hasOwnProperty(name)) {
                    let dict = this.model.macroDict[name];
                    let n = util.formatModuleName(name);
                    let type = dict["type"];
                    let args = dict["args"];

                    // Make sure that the type of this module really exists, throw error otherwise
                    if (!this.checkIsValidModuleType(type, phyDict.macro_modules))
                        throw type + " is an unknown module in " + phyDict.macro_modules;

                    let size = 0;
                    let top1D = false;
                    let length = parseInt(dict["args"][0]);
                    let width = 0;

                    if ((type === "string") || (type === "stiffString") || (type === "chain")) {
                        size = length;
                        top1D = true;
                    } else {
                        width = parseInt(dict["args"][1]);
                        size = length * width;
                    }

                    if (isNaN(size))
                        throw "Macro length argument for " + name + " cannot be converted to an integer: " + size;


                    // In Faust we must fill in "optional" arguments with actual values
                    if (args.length < this.m_targetDict[type]["nbArgs"] + this.m_targetDict[type]["optArgs"].length)
                        args.push("0");
                    let argstring = args.join(", ");

                    let posData = this.buildInitPos1D(dict);


                    // We probably want to keep a state of the macro elements as they come
                    // since the interaction / in-out connections will define the wrapper that
                    // we'll have to create around them, adding elements that need to be routed
                    macroAttributes[n] = {
                        type: type,
                        nbNodes : size,
                        argstr : argstring,
                        posData: posData,
                        top1D: top1D
                    };

                    // create an empty array that we'll fill with the proxies and in/out stuff
                    macroWrappers[n] = [];

                }

            }

            ////////////////////////////////////////////////////////////
            // Step 3
            // Parse the in/out dictionary to generate Faust expressions
            ////////////////////////////////////////////////////////////

            for (let name in this.model.inOutDict) {
                if (this.model.inOutDict.hasOwnProperty(name)) {
                    let dict = this.model.inOutDict[name];
                    let type = dict["type"];
                    if (dict["type"] === "posInput"){
                        fMass.push(this.m_targetDict[type]["func"] + "(" + dict["pos"]["z"] + ")");
                        fMassIndexMap[name] = {index:cpt++, pos:dict["pos"]["z"], posR:dict["pos"]["z"]};
                        posInputMasses[util.stripInOutToInt(name)] = {pos:dict["pos"]["z"]};
                    }
                }
            }

            for (let name in this.model.inOutDict) {
                if (this.model.inOutDict.hasOwnProperty(name)) {
                    let dict = this.model.inOutDict[name];
                    if(dict["type"] === "posOutput")
                        posOutputMasses[util.stripInOutToInt(name)] = fMassIndexMap[dict["m"]]["index"];
                    else if(dict["type"] === "frcOutput")
                        frcOutputMasses[util.stripInOutToInt(name)] = fMassIndexMap[dict["m"]]["index"];
                    else if(dict["type"] === "frcInput")
                        frcInputMasses[util.stripInOutToInt(name)] = fMassIndexMap[dict["m"]]["index"];
                }
            }

            ////////////////////////////////////////////////////////////
            // Step 4
            // Parse the param dictionary to generate Faust expressions
            ////////////////////////////////////////////////////////////

            for (let name in this.model.paramDict) {
                if (this.model.paramDict.hasOwnProperty(name)) {
                    let dict = this.model.paramDict[name];
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


            ////////////////////////////////////////////////////////////
            // Step 6
            // Parse all interactions and generate Faust code
            ////////////////////////////////////////////////////////////

            let i_cpt = 0;
            for (let name in this.model.interDict) {
                if (this.model.interDict.hasOwnProperty(name)) {
                    let dict = this.model.interDict[name];
                    let type = dict["type"];
                    let args = dict["args"];
                    let func = this.m_targetDict[type]["func"];

                    // In Faust we must fill in "optional" arguments with actual values
                    if(args.length < this.m_targetDict[type]["nbArgs"] + this.m_targetDict[type]["optArgs"].length)
                        args.push("0");
                    let argstring = args.join(", ");

                    let prox1 = false, prox2 = false;
                    let mass1, mass2, proxDict1, proxDict2;

                    // Check if these interactions are connected to any proxy modules
                    [prox1, mass1, proxDict1] = this.checkForProxies(dict["m1"]);
                    [prox2, mass2, proxDict2] = this.checkForProxies(dict["m2"]);


                    // If they are, register a proxy/wrapper, else just check that the modules exist.
                    if (prox1)
                        this.handleWrapper(proxDict1, macroWrappers, "coupling");
                    else {
                        if (this.model.isNotPresentInMassOrInOut(mass1))
                            throw mass1 + " does not exist in model, can't create interaction " + name;
                    }

                    if (prox2)
                        this.handleWrapper(proxDict2, macroWrappers, "coupling");
                    else{
                        if (this.model.isNotPresentInMassOrInOut(mass2))
                            throw mass2 + " does not exist in model, can't create interaction " + name;
                    }

                    //OH SHIT, this is where it's going to get ugly...
                    // can't generate the routing matrix stuff here because we need to have parsed all
                    // interactions, ins and outs before we know what order to route things in...
                    // possible solution: if no proxies , generate the routing here and now
                    // otherwise, gather all the data we'll need about the interaction and do another pass
                    // at the end, when we're sure of all connexions to a given macro structure.

                    deferredInteractions.push(
                        {
                            m1 : mass1,
                            m2 : mass2,
                            func : func,
                            argstr :argstring
                            // Do we need anything more here ??
                        });
                }
            }


            /// Once we have finished handling all the interactions
            /// (hence finding how many proxies need to exist for each macro element)
            /// we can actually generate the routing functions

            // First let's create the indexes for the proxy elements for each macroWrapper
            let stringWrappersIdx = 0;
            let proxy_cpt = 0;

            for (let macroName in macroWrappers) {
                if (macroWrappers.hasOwnProperty(macroName)) {

                    let wrappers = macroWrappers[macroName];
                    let attrib = macroAttributes[macroName];
                    let function_args = [];
                    let couProxies= 0, inProxies = 0, posOutProxies = 0, frcOutProxies = 0;

                    for (const wrapper of wrappers) {

                        // Now we can create the new indexes that will be sorted by macro element
                        fMassIndexMap[wrapper["name"]] = {index:cpt++, pos:0, posR: 0};
                        proxy_cpt++;

                        // Define the arguments of the function depending on the type of wrapper
                        switch(wrapper["topology"]){
                            case "1D":
                                function_args.push(wrapper["alpha"]);
                                break;
                            case "2D":
                                function_args.push(wrapper["alpha"]);
                                function_args.push(wrapper["beta"]);
                                break;
                        }

                        // Figure out the type of proxy: coupling or in/out
                        switch(wrapper["type"]){
                            case "coupling":
                                couProxies++;
                                break;
                            case "frcInput":
                                inProxies++;
                                break;
                            case "posOutput":
                                posOutProxies++;
                                break;
                            case "frcOutput":
                                frcOutProxies++;
                                break;
                        }
                    }


                    // now we could actually create the code for the "wrapped" macro element
                    if(attrib["top1D"] === true ){
                        let wc;
                        let arg = [];

                        wc = "stringWrapper_" + stringWrappersIdx + "(";
                        arg.push("nbMass");
                        for(let i = 0; i < couProxies; i++)
                            arg.push("cpl_"+ i);

                        wc = wc.concat(arg.join(', ') + ") = (\n");

                        let wa = [];
                        for(let i = 0; i < couProxies; i++)
                            wa.push("strProxFrc(nbMass, cpl_"+ i + ")");

                        wc = wc.concat(wa.join(", "));
                        wc = wc.concat(":\n");
                        wc = wc.concat("prox2str(nbMass, " + couProxies+ "):\n");

                        // Remove the first argument from the string as we want to use it as a parameter.
                        let argWoNbMass = attrib["argstr"].split(/,(.+)/)[1];

                        let base = this.m_targetDict[attrib["type"]]["func"] + "("
                            + "nbMass, " + argWoNbMass + ", "
                            + attrib["posData"].join(", ") + "):\n";
                        wc = wc.concat(base);

                        wc = wc.concat("str2prox(nbMass, " + couProxies+ "):\n");

                        wa = [];
                        for(let i = 0; i < couProxies; i++)
                            wa.push("strProxPos(nbMass, cpl_"+ i + ")");
                        wc = wc.concat(wa.join(", "));
                        wc = wc.concat(");\n");
                        //console.log(wc);
                        fFunctions.push(wc);

                        let funCall = "stringWrapper_" + stringWrappersIdx + "(" + attrib["nbNodes"] + ", ";
                        funCall = funCall.concat(function_args.join(", ") + ")");
                        //console.log(funCall);
                        fMacro.push(funCall);

                        stringWrappersIdx++;
                    }
                    else {
                        // TODO: handle mesh type elements.
                    }
                }
            }


            ////////////////////////////////////////////////////////////
            // Step 5
            // Create variables and structures
            ////////////////////////////////////////////////////////////

            let nbMasses = fMass.length + proxy_cpt;
            let nbInter = Object.keys(this.model.interDict).length;

            let nbPosOut = Object.keys(posOutputMasses).length;
            let nbFrcOut = Object.keys(frcOutputMasses).length;
            let nbOut = nbPosOut + nbFrcOut;

            let nbPosInput = Object.keys(posInputMasses).length;
            let nbFrcInput = Object.keys(frcInputMasses).length;

            // Create the routing matrix now that we have the correct number of elements
            let routingMatrix = Array(nbMasses).fill(null).map(() => Array(2*nbInter).fill(0));

            // Now let's all the interactions now that we have full completion of the mass elements.
            for (const inter of deferredInteractions) {

                routingMatrix[fMassIndexMap[inter["m1"]]["index"]] [2*i_cpt] = 1;
                routingMatrix[fMassIndexMap[inter["m2"]]["index"]] [2*i_cpt+1] = 1;

                 fInter.push(inter["func"] +  "(" + inter["argstr"] + ", " +
                     fMassIndexMap[inter["m1"]]["pos"] + ", " +
                     fMassIndexMap[inter["m2"]]["pos"] + ")");

                i_cpt++;

            }


            ////////////////////////////////////////////////////////////
            // Step 7
            // Generate the routing tables used by Faust
            ////////////////////////////////////////////////////////////

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

            if(!util.isEmpty(forceOutputStrings)){
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

            if(!util.isEmpty(posOutputMasses))
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

            */


            ////////////////////////////////////////////////////////////
            // Step 8
            // Now that we have all this, we can generate the Faust dsp !
            ////////////////////////////////////////////////////////////

            let fDSP = "import(\"stdfaust.lib\");\n\n";

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

            let fPosInputRoute = "";
            if (nbPosInput > 1)
                fPosInputRoute = "par(i, nbMass - nbPosIn, _), ro.interleave(nbPosIn, 2):\n\t";


            let fWith = "";
            if(nbInter){
                fWith =
                    "with{\n\t" + m2l + "\n\t" + l2m +"\n"
                    + "\tnbMass = " + nbMasses + ";\n";
            }
            else {
                fWith =
                    "with{\n\t" + "\tnbMass = " + nbMasses + ";\n";
            }




            if(nbFrcInput > 0){
                frcPassThrough = ",\n\tpar(i, nbFrcIn,_)";
                fWith = fWith.concat("\tnbFrcIn = " + nbFrcInput + ";\n");
            }

            if(nbPosInput > 0)
                fWith = fWith.concat("\tnbPosIn = " + nbPosInput + ";\n");

            if (fInter.length > 0)
                interDSP = interDSP.concat(fInter.join(",\n\t") + ",\n");


            if(nbOut+nbFrcInput > 0)
                if(nbFrcInput > 0)
                    if(nbPosOut)
                        interCable = "\tpar(i, nbPosOut+nbFrcIn, _)";
                    else
                        interCable = "\tpar(i, nbFrcIn, _)";
                else
                if(nbPosOut)
                    interCable = "\tpar(i, nbPosOut, _)";
                else
                    interDSP = interDSP.replace(/,\s*$/, "");


            if(nbOut > 0){
                outCable = ", par(i, nbOut , _)";
                fWith = fWith.concat("\tnbOut = " + nbOut + ";\n");
            }

            if(nbPosOut >0)
                fWith = fWith.concat("\tnbPosOut = " + nbPosOut + ";\n");


            fWith = fWith.concat("};\n");

            // TODO: fix this better!
            let tmp = "";
            if( (fMacro.length < 0)){
                tmp = ",\n\t";
            }


            let interactionSection;
            if(nbInter === 0) {
                interactionSection = "";
            }
            else {
                interactionSection =
                    ":\n\t"
                    + "RoutingMassToLink "
                    + frcPassThrough
                    + ":\n\t"
                    + interDSP
                    + interCable
                    + ":\n\t"
                    + "RoutingLinkToMass\n"
                    + ")~par(i, nbMass, _):"
                    + "\npar(i, nbMass, !)" + outCable + "\n";
            }




            fDSP = fDSP.concat(
                "model = (\n\t"
                + fPosInputRoute
                + fMass.join(",\n\t")
                + tmp
                + fMacro.join(",\n\t")
                + frcPassThrough
                + interactionSection

                /*+ "RoutingMassToLink "
                + frcPassThrough
                + ":\n\t"
                + interDSP
                + interCable
                + ":\n\t"
                + "RoutingLinkToMass\n)~par(i, nbMass, _):"
                */

                + fWith
            );


            fDSP = fDSP.concat("\n\n" + fFunctions.join("\n") + "\n\n");


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
        catch (e){
            throw("Faust Code Generator Error: " + e);
        }
    }
}



module.exports = {GenCodeBuilder, FaustCodeBuilder};
