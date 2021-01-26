var fs = require('fs');
const maxAPI = require("max-api");
const path = require("path");


maxAPI.addHandlers({
    loadFile: (...args) => {
        maxAPI.post("Loading file: ", args[0]);

        // Do this on Mac to conform to a standard absolute path starting from the root /
        //if(/^Macintosh/.test(args[0]))
        //    args[0] = args[0].replace("Macintosh HD:", "");


        fs.readFile(args[0], function(err, buf) {
            if (err) {
                console.log(err);
                maxAPI.post(err);
            }
            console.log(buf.toString());
            console.log(buf.toString().length);

            var bufString = buf.toString();
            bufString = bufString.replace('\r', '');

            maxAPI.outlet(["loadFile", bufString]);
        });
    },
    saveFile: (...args) => {
        maxAPI.post("Saving to file : ", args[0]);

        var filePath = args[0];

        // Do this on Mac to conform to a standard absolute path starting from the root /
        //if(/^Macintosh/.test(filePath))
        //    filePath = filePath.replace("Macintosh HD:", "");


        var fileContent = args[1].toString();

        console.log(fileContent);
        fileContent = fileContent.replace('"','');
        fileContent = fileContent.replace("/", '');
        fileContent = fileContent.replace('"', '');

        console.log(fileContent);

        //maxAPI.post("bla : ", args[0]);

		
        fs.writeFileSync(filePath, fileContent, (err)=> {
            if (err)  {
                console.log(err);
                maxAPI.post(err);
            }
            console.log("Successfully Written to File.");
        });
		
    }
});


