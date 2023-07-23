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


    function makeArgDict(type, list, argStart, argEnd, expected, opt = 0){

        // Do some regexp stuff to transform argument string into a list
        var args = makeArgList(list, argStart, argEnd, expected, opt);
    
        var argDict = {};
        
        // Process the mandatory arguments first
        for (let i=0; i < expected; i++) {
            if(args.length >= i)
                argDict[phyDict.genModDict[type]["argTypes"][i]] = args[i];
            else
                throw "Insufficient Argument Length."
        }
        
        // Check if we have any optional arguments
        if(args.length > expected){
            for(let i =0; i < opt; i++){
                if(args.length >= expected+i)
                    argDict[phyDict.genModDict[type]["optArgs"][i]] = args[expected+i];
                else
                    throw "Insufficient Argument Length."
            }
        }


        return argDict;
        
    }




    try {

        let name = util.checkIsModule(list[0]);
        let type = list[1];
        let len = list.length;
        let args = [];
        let expected_args, opt_args;
        let pos, vel;

        let argDict = {};

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
            argDict = makeArgDict(type, list, 2, 2, expected_args, opt_args);

            //console.log(args);
            //console.log(phyDict.genModDict[type]);
            //console.log(phyDict.genModDict[type]["argTypes"]);
            /*
            for (let i=0; i < expected_args; i++) {
                if(args.length >= i)
                    argDict[phyDict.genModDict[type]["argTypes"][i]] = args[i];
                else
                    throw "Insufficient Argument Length."
            }
            */
            //console.log(argDict);

            if (type === "ground")
                vel = "0";
            mdl.massDict[name] = {
                type: type,
                //args: util.massArgsListToDict(type, args),
                args: argDict,
                //args:args,
                pos: util.posStringToDict(pos),
                vel: util.posStringToDict(vel),
                buffer : activeBufferList.slice()
            }
        }

        else if (phyDict.interaction_modules.indexOf(type) > -1) {

            var m1 = util.checkIsModule(list[2]);
            var m2 = util.checkIsModule(list[3]);

            argDict = makeArgDict(type, list, 4, 0, expected_args, opt_args);

            //args = makeArgList(list, 4, 0, expected_args, opt_args);

            mdl.interDict[name] = {
                type: type,
                m1: m1,
                m2: m2,
                args: argDict
            }
        }

        else if (phyDict.macro_modules.indexOf(type) > -1) {
            pos = list[len - 2];
            vel = list[len - 1];

            argDict = makeArgDict(type, list, 2, 2, expected_args, opt_args);
            //args = makeArgList(list, 2, 2, expected_args, opt_args);
            
            mdl.macroDict[name] = {
                type: type,
                args: argDict,
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