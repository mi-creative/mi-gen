var fs = require('fs');


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
function generateDspObj(name, codeboxCode, nbIn, nbOut) {
    try {

        var newStringList = "";

        for (let i = 0; i < codeboxCode.length; i++) {
            if (codeboxCode[i] == '\n')
                newStringList = newStringList.concat("\\r\\n");
            else
                newStringList = newStringList.concat(codeboxCode[i]);
            //this.generated_code[i] = this.generated_code[i].replace("\n", "\\r\\n");
        }

        //this.generated_code = newStringList;
        //console.log("test");

        var outFileString = "";
        //outFileString = open(name, "w");
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

        //console.log("test");
        //console.log(outFileString);

        /*
        fs.truncate(name, 0, function () {
            console.log('done')
        });
        */


        fs.writeFileSync(name, outFileString, (err)=> {
            if (err) console.log(err);
            console.log("Successfully Written to File.");
        });


        /*
        fs.writeFile(name, outFileString, (err) => {
            if (err) console.log(err);
            console.log("Successfully Written to File.");
        });

         */
    } catch(e){
        throw "gendsp File Writer error: "+ e;
    }
}


module.exports = {generateDspObj}
//# sourceMappingURL=jsMIMS_GenObjWriter.js.map