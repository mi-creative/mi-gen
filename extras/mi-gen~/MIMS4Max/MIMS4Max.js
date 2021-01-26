const maxAPI = require("max-api");
const fs =require("fs");

const mimsWorker = require("./MIMS_NodeJS/mimsWorker.js");

let genPatchData = [];
let faustFile = "";
let jsonCode = {}
/**
 * Adding function handlers (functions that can be called from the Max context).
 */
maxAPI.addHandlers({

    parseMimsScript: (...args) => {

        maxAPI.post("Parsing MIMS script...");
        console.log("Parsing MIMS code...");
        maxAPI.outlet("error", "");
        maxAPI.outlet("state", "Parsing MIMS file");
        try{

            let res = mimsWorker.parseMIMSFile(args[0].toString());

            maxAPI.outlet("model", res[1]);
            maxAPI.outlet("state", res[2]);
            maxAPI.outlet("error", res[3]);

            genPatchData = mimsWorker.generateGenDSP();
            maxAPI.outlet("code", genPatchData[0]);

            // Copy extra JSON dict containing X-Y positions
            jsonCode = genPatchData[3];

            faustFile = mimsWorker.generateFaustDSP();
        }
        catch (e) {
            maxAPI.outlet("state", "Errors detected during the model script parsing.");
            maxAPI.outlet("error", e);
        }

        console.log("...done");
    },


    createGenDSPFile: (...args) => {
        if(mdl.isValid()){
            maxAPI.post("About to generate the gen DSP file...");
            try{
                // Do this on Mac to conform to a standard absolute path starting from the root /
                //if(/^Macintosh/.test(args[0]))
                //    args[0] = args[0].replace("Macintosh HD:", "");

                // build the max gendsp patch surrounding the codebox code.
                let gendspPatch = mimsWorker.buildGendspPatch(genPatchData);

                // Weite the resulting patch to the specified destination.
                writeDspFile(args[0], gendspPatch);

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
        if(mdl.isValid()){
            if(mdl.isFaustCompatible()){
                maxAPI.post("About to generate Faust DSP file...");
                try{
                    //let fDSP = generateFaustCode();
                    writeDspFile(args[0], faustFile);
                }
                catch(e){
                    maxAPI.outlet("state", "Errors detected during Faust DSP file generation.");
                    maxAPI.outlet("error", e);
                    maxAPI.post(e);
                }
            }
            else {
                maxAPI.post("Some modules are incompatible with Faust. Cannot create file.")
                maxAPI.outlet("state", "Some modules are incompatible with Faust. Cannot create file.");

            }

        }
        else{
            maxAPI.post("Please load a model first.");
            maxAPI.outlet("state", "Please load a model first.");
        }
    },


    clear:() =>{
        maxAPI.post("Clearing the model\n");
        mdl.clear();
        maxAPI.outlet("state", "No loaded model");
        maxAPI.outlet("error", "");
        maxAPI.outlet("code", "");
        maxAPI.outlet("model", {});
    }
});


function writeDspFile(filePath, fileContent){
	maxAPI.post("about to write file");

    // Do this on Mac to conform to a standard absolute path starting from the root /
    //if(/^Macintosh/.test(filePath))
    //    filePath = filePath.replace("Macintosh HD:", "");

    fs.writeFileSync(filePath.toString(), fileContent, (err)=> {
        if (err) {
            throw err;
        }
        //console.log("Successfully Written to File.");
    });
    maxAPI.post("...done.");
    maxAPI.outlet("state", "Successfully wrote to " + filePath);
    maxAPI.outlet("code", "SUCCESS!");
}

