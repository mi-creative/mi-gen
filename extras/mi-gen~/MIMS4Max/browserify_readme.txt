To create a browser compatible version of the tool, use browserify:

browserify MIMS_NodeJS/mimsWorker.js --standalone mimsBundle > browserified/mimsBrowser.js

This will create a mimsBundle object that can be used to access functions.
The globally defined mdl object will also be accessible in the client context.