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
                    fMass.push("mi.posInput(" + dict["pos"]["z"] + ")");
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
        let fDSP = "import(\"stdfaust.lib\");\n\n";
        //let fDSP = "import(\"stdfaust.lib\");\nimport(\"mi.lib\");\n\n";

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