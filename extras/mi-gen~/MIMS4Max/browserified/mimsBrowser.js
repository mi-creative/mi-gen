(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.mimsBundle = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

function generateHeader() {
    return "{\n\t\"patcher\" : \t{\n\t\t\"fileversion\" : 1,\n\t\t\"appversion\" : \t\t{\n\t\t\t\"major\" : 7,\n\t\t\t\"minor\" : 3,\n\t\t\t\"revision\" : 1,\n\t\t\t\"architecture\" : \"x64\",\n\t\t\t\"modernui\" : 1\n\t\t}\n,\n\t\t\"rect\" : [ 67.0, 109.0, 700.0, 500.0 ],\n\t\t\"editing_bgcolor\" : [ 0.9, 0.9, 0.9, 1.0 ],\n\t\t\"bglocked\" : 0,\n\t\t\"openinpresentation\" : 0,\n\t\t\"default_fontsize\" : 12.0,\n\t\t\"default_fontface\" : 0,\n\t\t\"default_fontname\" : \"Arial\",\n\t\t\"gridonopen\" : 1,\n\t\t\"gridsize\" : [ 15.0, 15.0 ],\n\t\t\"gridsnaponopen\" : 1,\n\t\t\"objectsnaponopen\" : 1,\n\t\t\"statusbarvisible\" : 2,\n\t\t\"toolbarvisible\" : 1,\n\t\t\"lefttoolbarpinned\" : 0,\n\t\t\"toptoolbarpinned\" : 0,\n\t\t\"righttoolbarpinned\" : 0,\n\t\t\"bottomtoolbarpinned\" : 0,\n\t\t\"toolbars_unpinned_last_save\" : 0,\n\t\t\"tallnewobj\" : 0,\n\t\t\"boxanimatetime\" : 200,\n\t\t\"enablehscroll\" : 1,\n\t\t\"enablevscroll\" : 1,\n\t\t\"devicewidth\" : 0.0,\n\t\t\"description\" : \"\",\n\t\t\"digest\" : \"\",\n\t\t\"tags\" : \"\",\n\t\t\"style\" : \"\",\n\t\t\"subpatcher_template\" : \"\",\n                ";
}
function generateNewObjBox(box_Id, nb_In, nb_Out, objName, xPos, yPos) {
    var boxText;
    boxText = (((((((((((("{ \"box\" : \t\t\t\t{\n\t\t\t\t\t\"id\" : \" " + box_Id) + " \",\n\t\t\t\t\t\"maxclass\" : \"newobj\",\n\t\t\t\t\t\"numinlets\" :  ") + nb_In.toString()) + ",\n\t\t\t\t\t\"numoutlets\" : ") + nb_Out.toString()) + ",\n\t\t\t\t\t\"outlettype\" : [ \"\" ],\n\t\t\t\t\t\"patching_rect\" : [ ") + yPos.toString()) + ", ") + xPos.toString()) + ", 30.0, 22.0 ],\n\t\t\t\t\t\"style\" : \"\",\n\t\t\t\t\t\"text\" : \" ") + objName) + " \"\n\t\t\t\t} }");
    return boxText;
}
function generateCodeBox(codeStr, box_Id, nb_In, nb_Out, xPos, yPos) {
    var boxText;
    boxText = (((((((((((("{ \"box\" : \t\t\t\t{\n\t\t\t\t\t\"code\" : \" " + codeStr) + " \",\n\t\t\t\t\t\"fontface\" : 0,\n\t\t\t\t\t\"fontname\" : \"Arial\",\n\t\t\t\t\t\"fontsize\" : 12.0,\n\t\t\t\t\t\"id\" : \" ") + box_Id) + " \",\n\t\t\t\t\t\"maxclass\" : \"codebox\",\n\t\t\t\t\t\"numinlets\" : ") + nb_In.toString()) + ",\n\t\t\t\t\t\"numoutlets\" : ") + nb_Out.toString()) + ",\n\t\t\t\t\t\"outlettype\" : [ \"\" ],\n\t\t\t\t\t\"patching_rect\" : [ ") + yPos.toString()) + ", ") + xPos.toString()) + ", 550.0, 300.0 ],\n\t\t\t\t\t\"style\" : \"\"\n\t\t\t\t} }");
    return boxText;
}
function generatePatchLines(source, srcNb, dest, dstNb) {
    var text;
    text = ((((((((" {\n\t\t\t\t\"patchline\" : \t\t\t\t{\n\t\t\t\t\t\"destination\" : [ \" " + dest) + " \", ") + dstNb.toString()) + " ],\n\t\t\t\t\t\"disabled\" : 0,\n\t\t\t\t\t\"hidden\" : 0,\n\t\t\t\t\t\"source\" : [ \" ") + source) + " \", ") + srcNb.toString()) + " ]\n\t\t\t\t}\n\t\t\t}");
    return text;
}
function generate(codeboxCode, nbIn, nbOut) {
    try {
        var newStringList = "";

        for (let i = 0; i < codeboxCode.length; i++) {
            if (codeboxCode[i] === '\n')
                newStringList = newStringList.concat("\\r\\n");
            else
                newStringList = newStringList.concat(codeboxCode[i]);
        }

        var outFileString = "";
        outFileString = outFileString.concat(generateHeader());
        outFileString = outFileString.concat("\n \"boxes\" : [ ");
        outFileString = outFileString.concat(generateCodeBox(newStringList, "phyMdlBox", nbIn, nbOut, 70.0, 20.0));
        outFileString = outFileString.concat(", ");
        for (var x = 1, _pj_a = (nbIn + 1); (x < _pj_a); x += 1) {
            outFileString = outFileString.concat(generateNewObjBox(("inbox_" + x.toString()), 0, 1, ("in " + x.toString()), 20.0, (x * 70.0)));
            outFileString = outFileString.concat(", ");
        }
        for (var x = 1, _pj_a = nbOut; (x < _pj_a); x += 1) {
            outFileString = outFileString.concat(generateNewObjBox(("outbox_" + x.toString()), 1, 0, ("out " + x.toString()), 420.0, (x * 50.0)));
            outFileString = outFileString.concat(", ");
        }
        outFileString = outFileString.concat(generateNewObjBox(("outbox_" + nbOut.toString()), 1, 0, ("out " + nbOut.toString()), 420.0, (nbOut * 50.0)));
        outFileString = outFileString.concat("],\n \"lines\" : [  ");
        for (var x = 0, _pj_a = nbIn; (x < _pj_a); x += 1) {
            outFileString = outFileString.concat(generatePatchLines(("inbox_" + (x + 1).toString()), 0, "phyMdlBox", x));
            outFileString = outFileString.concat(", ");
        }
        for (var x = 0, _pj_a = (nbOut - 1); (x < _pj_a); x += 1) {
            outFileString = outFileString.concat(generatePatchLines("phyMdlBox", x, ("outbox_" + (x + 1).toString()), 0));
            outFileString = outFileString.concat(", ");
        }
        outFileString = outFileString.concat(generatePatchLines("phyMdlBox", (nbOut - 1), ("outbox_" + nbOut.toString()), 0));
        outFileString = outFileString.concat("] } } ");

        return outFileString;

    } catch(e){
        throw "gendsp Patch Builder error: "+ e;
    }
}


module.exports = {generate}

},{}],2:[function(require,module,exports){
const util = require("./utility.js");
const phyDict = require("./phyDict.js");

function generateFaustCode(){

    if(!util.isEmpty(mdl.macroDict))
        throw "The code contains macro elements, cannot generate Faust code !";

    try{

        let fMass = [];
        let fMassIndexMap = {};
        let fInter = [];
        let fParams = [];

        let dict = {};

        let cpt = 0;
        for (let name in mdl.massDict) {
            if (mdl.massDict.hasOwnProperty(name)) {
                dict = mdl.massDict[name];
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

                let pos = dict["pos"]["z"];
                let delPos = pos;
                let posString = "";
                if(type === "ground" )
                    posString = pos;
                else{
                    if(parseFloat(dict["vel"]["z"]) !== 0)
                        delPos = dict["pos"]["z"] + " - (" + dict["vel"]["z"] + "/ ma.SR)";
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

        for (let name in mdl.inOutDict) {
            if (mdl.inOutDict.hasOwnProperty(name)) {
                dict = mdl.inOutDict[name];
                if (dict["type"] === "posInput"){
                    fMass.push("posInput(" + dict["pos"]["z"] + ")");
                    fMassIndexMap[name] = {index:cpt++, pos:dict["pos"]["z"], posR:dict["pos"]["z"]};
                    posInputMasses[util.stripInOutToInt(name)] = {pos:dict["pos"]["z"]};
                }
            }
        }

        for (let name in mdl.inOutDict) {
            if (mdl.inOutDict.hasOwnProperty(name)) {
                dict = mdl.inOutDict[name];
                if(dict["type"] === "posOutput")
                    posOutputMasses[util.stripInOutToInt(name)] = fMassIndexMap[dict["m"]]["index"];
                else if(dict["type"] === "frcOutput")
                    frcOutputMasses[util.stripInOutToInt(name)] = fMassIndexMap[dict["m"]]["index"];
                else if(dict["type"] === "frcInput")
                    frcInputMasses[util.stripInOutToInt(name)] = fMassIndexMap[dict["m"]]["index"];
            }
        }

        for (let name in mdl.paramDict) {
            if (mdl.paramDict.hasOwnProperty(name)) {
                dict = mdl.paramDict[name];
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


        let nbMasses = fMass.length;
        let nbInter = Object.keys(mdl.interDict).length;
        let routingMatrix = Array(nbMasses).fill(null).map(() => Array(2*nbInter).fill(0));
        let nbOut = Object.keys(posOutputMasses).length + Object.keys(frcOutputMasses).length;

        let nbFrcInput = Object.keys(frcInputMasses).length;

        let i_cpt = 0;
        for (let name in mdl.interDict) {
            if (mdl.interDict.hasOwnProperty(name)) {
                dict = mdl.interDict[name];
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

                if (mdl.isNotPresentInMassOrInOut(mass1))
                    throw mass1 + " does not exist in model, can't create interaction " + name;
                if (mdl.isNotPresentInMassOrInOut(mass2))
                    throw mass2 + " does not exist in model, can't create interaction " + name;

                routingMatrix[fMassIndexMap[mass1]["index"]] [2*i_cpt] = 1;
                routingMatrix[fMassIndexMap[mass2]["index"]] [2*i_cpt+1] = 1;

                fInter.push(func +  "(" + argstring + ", " +
                    fMassIndexMap[mass1]["pos"] + ", " +
                    fMassIndexMap[mass2]["pos"] + ")");

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
    catch (e){
        throw("Faust Code Generator Error: " + e);
    }
}

module.exports = {generateFaustCode};
},{"./phyDict.js":6,"./utility.js":8}],3:[function(require,module,exports){
const util = require("./utility.js");
const phyDict = require("./phyDict.js");

/**
 * Parse the module dictionaries of a parsed MIMS Script to generate gen~ codebox code.
 * This method first parses dictionaries of modules to generate lists of code
 * then creates a single string containing the entire codebox code for the model.
 */
function generateGenCode(){

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
        if(velz !== 0)
            delPos = z + " - (" + velz + "/ SAMPLERATE)";
        return z + ", " + delPos;
    }

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


        for (let name in mdl.interDict) {
            if (mdl.interDict.hasOwnProperty(name)) {
                dict = mdl.interDict[name];
                let prox1 = false, prox2 = false;
                let mass1, mass2;

                [prox1, mass1] = integrateProxies(dict["m1"]/*, struct, init, compProxyMasses, compProxyInteractions*/);
                [prox2, mass2] = integrateProxies(dict["m2"]/*, struct, init, compProxyMasses, compProxyInteractions*/);

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
                    [prox, mass] = integrateProxies(dict["m"]/*, struct, init, compProxyMasses, compProxyInteractions*/);
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


module.exports = {generateGenCode};
},{"./phyDict.js":6,"./utility.js":8}],4:[function(require,module,exports){
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
const mdl2gen = require("./mdl2gen.js");
const mdl2faust = require("./mdl2faust.js");


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
    if(mdl.isValid())
        return mdl2gen.generateGenCode();
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
    if(!mdl.isFaustCompatible()){
        console.log("The model contains modules that are incompatible with Faust generation.");
        //throw "Faust DSP create error: The model is incompatible with Faust. Does it contain macro modules?";

    }
    else{
        if(mdl.isValid())
            return mdl2faust.generateFaustCode();
        else
            throw "Faust dsp create error: Invalid model state. Please parse a model first.";
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
},{"./gendspCreator.js":1,"./mdl2faust.js":2,"./mdl2gen.js":3,"./scriptParser":7}],5:[function(require,module,exports){
(function (global){
const util = require("./utility.js");

class MiModel{
    constructor(){
        this.clear();
    }

    /**
     * Clear all the data associated with a MIMS model and reset the parser state.
     */
    clear(){
        this.state = 0;
        this.massDict = {};
        this.interDict = {};
        this.inOutDict = {};
        this.macroDict = {};
        this.paramDict = {};
        this.bufferList = [];
    }

    isValid(){
        return this.state === 1;
    }

    isFaustCompatible(){
        return util.isEmpty(mdl.macroDict);
    }


    /**
     * Check if a mass-type element (either a mass or macro or input/output is present in the dictionaries
     * @param mass the name of the element to test (e.g. @m1)
     * @returns {boolean} true if the element is found, false otherwise.
     */
    isInAnyMassDict(mass){
        return util.isPresentInDict(mass, this.massDict)
            || util.isPresentInDict(mass, this.inOutDict)
            || util.isPresentInDict(mass, this.macroDict);
    }


    isInAnyDict(name){
        return (util.isPresentInDict(name, this.massDict)
            || util.isPresentInDict(name, this.interDict)
            || util.isPresentInDict(name, this.macroDict)
            || util.isPresentInDict(name, this.paramDict)
            || util.isPresentInDict(name, this.paramDict))
    }

    isNotPresentInMassOrInOut(mass){
        return (
            !util.isPresentInDict(mass, this.massDict)
            && !util.isPresentInDict(mass, this.inOutDict)
            && !util.isPresentInDict(mass, this.macroDict)
        );
    }
}

// Global model object
global.mdl = new MiModel();


module.exports = {
                MiModel
                };

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./utility.js":8}],6:[function(require,module,exports){
var all_modules, in_out_modules, interaction_modules, macro_modules, mass_modules, other_modules;
mass_modules = ["mass", "massG", "osc", "ground"];
interaction_modules = ["damper", "spring", "nlSpring", "nlSpring2", "nlSpring3", "nlPluck", "nlBow", "contact", "springDamper", "nlSpringDamper", "nlContact"];
macro_modules = ["string", "stiffString", "chain", "mesh", "closedMesh", "cornerMesh"];
in_out_modules = ["posInput", "posOutput", "frcInput", "frcOutput"];
other_modules = ["none", "param", "audioParam"];
all_modules = ((((mass_modules + interaction_modules) + macro_modules) + in_out_modules) + other_modules);


const genModDict = {
    "mass" : {func : "compute_mass", nbArgs:1, optArgs : ["gravity"]},
    //"massG" : {func: "compute_massG", nbArgs:2, optArgs : 0},
    "osc" : {func : "compute_osc", nbArgs:3, optArgs : ["gravity"]},
    "ground" : { func :"compute_ground", nbArgs:0, optArgs : 0},
    "spring" : { func :"compute_spring", nbArgs:1, optArgs : 0},
    "springDamper" : { func :"compute_spring_damper", nbArgs:2, optArgs : 0},
    "damper" : { func :"compute_damper", nbArgs:1, optArgs : 0},
    "contact" : { func :"compute_contact", nbArgs:2, optArgs : ["thresh"]},
    "nlContact" : { func :"compute_contact_nl3_clipped", nbArgs:4, optArgs : ["thresh"]},
    //"nlSpring" : { func :"compute_spring_damper_nl3", nbArgs:3},
    "nlSpring2" : { func :"compute_spring_damper_nl2", nbArgs:3, optArgs : 0},
    "nlSpring3" : { func :"compute_spring_damper_nl3", nbArgs:3, optArgs : 0},
    "nlSpringDamper" : { func :"compute_spring_damper_nl3_clipped", nbArgs:4, optArgs : 0},
    "nlBow" : { func :"compute_nlBow", nbArgs:2, optArgs : ["smooth"]},
    "nlPluck" : { func :"compute_nlPluck", nbArgs:2, optArgs : ["Z"]},
    "posInput" : { func :"update_input_pos", nbArgs:0, optArgs : 0},
    "frcInput" : { func :"apply_input_force", nbArgs:0, optArgs : 0},
    "string" : { func :"compute_string", nbArgs:4, optArgs : ["Zo"]},
    "chain" : { func :"compute_chain", nbArgs:4, optArgs : ["Zo"]},
    "stiffString" : { func :"compute_stiff_string", nbArgs:5, optArgs : ["Zo"]},
    "mesh" : { func :"compute_open_mesh", nbArgs:5, optArgs : ["Zo"]},
    "closedMesh" : { func :"compute_closed_mesh", nbArgs:5, optArgs : ["Zo"]},
    "cornerMesh" : { func :"compute_corner_mesh", nbArgs:5, optArgs : ["Zo"]}
};

const faustModDict = {
    "mass" : {func : "mass", nbArgs:1, optArgs : ["gravity"]},
    "osc" : {func : "osc", nbArgs:3, optArgs : ["gravity"]},
    "ground" : { func :"ground", nbArgs:0, optArgs : 0},
    "spring" : { func :"spring", nbArgs:1, optArgs : 0},
    "springDamper" : { func :"springDamper", nbArgs:2, optArgs : 0},
    "damper" : { func :"damper", nbArgs:1, optArgs : 0},
    "contact" : { func :"collision", nbArgs:2, optArgs : ["thresh"]},
    "nlContact" : { func :"nlCollisionClipped", nbArgs:4, optArgs : ["thresh"]},
    "nlSpring2" : { func :"nlSpringDamper2", nbArgs:3, optArgs : 0},
    "nlSpring3" : { func :"nlSpringDamper3", nbArgs:3, optArgs : 0},
    "nlSpringDamper" : { func :"nlSpringDamperClipped", nbArgs:4, optArgs : 0},
    "nlBow" : { func :"nlBow", nbArgs:2, optArgs : ["smooth"]},
    "nlPluck" : { func :"nlPluck", nbArgs:2, optArgs : ["Z"]},
    "posInput" : { func :"posInput", nbArgs:0, optArgs : 0},
    "frcInput" : { func :"apply_input_force", nbArgs:0, optArgs : 0},
};


module.exports = {mass_modules, interaction_modules, macro_modules, in_out_modules, other_modules, all_modules, genModDict, faustModDict};

},{}],7:[function(require,module,exports){
const phyDict = require("./phyDict.js");
const util = require("./utility.js");
const modelState = require("./modelState.js");

let activeBufferList = [];

/**
 * Parse an entire MIMS Script file
 * @param text the file as a single string of text.
 */
function parseMIMSFile(text){
    mdl.clear();
    activeBufferList = [];

    try {
        var lines = text.split(/\r\n|\r|\n/);
        for(var i = 0; i < lines.length; i++)
            parseCommand(lines[i]);
        mdl.state = 1;

        var out = {
            masses: mdl.massDict,
            interactions: mdl.interDict,
            macroStructures: mdl.macroDict,
            inOuts: mdl.inOutDict,
            parameters: mdl.paramDict
        };
        return  [0, out, "Finished parsing.", "No errors to report."];

    } catch(e){
        mdl.state = 0;
        throw "Script Parse Error: " + e;
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
                    mdl.bufferList.push(s);
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

        let name = util.checkIsModule(list[0]);
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

        if (mdl.isInAnyDict(name)) {
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
            mdl.massDict[name] = {
                type: type,
                args: args,
                pos: util.posStringToDict(pos),
                vel: util.posStringToDict(vel),
                buffer : activeBufferList.slice()
            }
        }

        else if (phyDict.interaction_modules.indexOf(type) > -1) {

            var m1 = util.checkIsModule(list[2]);
            var m2 = util.checkIsModule(list[3]);
            args = makeArgList(list, 4, 0, expected_args, opt_args);

            mdl.interDict[name] = {
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
            mdl.macroDict[name] = {
                type: type,
                args: args,
                pos: util.posStringToDict(pos),
                vel: util.posStringToDict(vel),
                buffer : activeBufferList.slice()
            };
        }

        // Could definitely refactor a lot of this stuff
        else if (type === "posInput") {
            if (len !== 3) {
                throw "Bad number of arguments for " + type + " element: " + name;
            } else {
                if (!/in/.test(name))
                    throw "Bad name for " + type + " " + name;
                else {
                    mdl.inOutDict[name] = {
                        type: type,
                        pos: util.posStringToDict(list[2]),
                        vel: util.posStringToDict(list[2]),
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
                    mdl.inOutDict[name] = {
                        type: type,
                        m: util.checkIsModule(list[2])
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
                    mdl.inOutDict[name] = {
                        type: type,
                        m: util.checkIsModule(list[2])
                    }
                }
            }
        }

        else if (type === "param") {
            if (len !== 3) {
                throw "Bad number of arguments for " + type + " element: " + name;
            } else {
                mdl.paramDict[name] = {
                    type: type,
                    args: list[2]
                }
            }
        } else if (type === "audioParam") {
            if (len !== 3) {
                throw "Bad number of arguments for " + type + " element: " + name;
            } else {
                let input = util.checkIsModule(list[2]);
                if (!/in/.test(input))
                    throw "Bad name for " + type + " " + name;
                mdl.paramDict[name] = {
                    type: type,
                    input: input.toString()
                }
            }
        }
    } catch (e){
        throw("Parsing Error: " + e);
    }
}

module.exports = {parseMIMSFile};
},{"./modelState.js":5,"./phyDict.js":6,"./utility.js":8}],8:[function(require,module,exports){

/** Some utility functions used here and there **/


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



module.exports = {
    formatModuleName, stripInOutToInt, checkIsModule,
    isPresentInDict, posStringToDict, isEmpty
};
},{}]},{},[4])(4)
});
