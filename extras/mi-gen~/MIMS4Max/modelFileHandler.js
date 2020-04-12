var fs = require('fs');
const maxAPI = require("max-api");


maxAPI.addHandlers({
    loadFile: (...args) => {
        maxAPI.post("Loading file: ", args[0]);
        fs.readFile(args[0], function(err, buf) {
            if (err) console.log(err);
            console.log(buf.toString());
            console.log(buf.toString().length);

            var bufString = buf.toString();
            bufString = bufString.replace('\r', '');

            maxAPI.outlet(["loadFile", bufString]);
        });
    },
    saveFile: (...args) => {
        maxAPI.post("Saving to file file: ", args[0]);

        var filePath = args[0];
        var fileContent = args[1].toString();

        console.log(fileContent);

        fileContent = fileContent.replace('"','');
        fileContent = fileContent.replace("/", '');
        fileContent = fileContent.replace('"', '');

        console.log(fileContent);

        fs.truncate(filePath, 0, function(){console.log('done')})

        fs.writeFile(filePath, fileContent, (err)=> {
            if (err) console.log(err);
            console.log("Successfully Written to File.");
        });
    }
});


