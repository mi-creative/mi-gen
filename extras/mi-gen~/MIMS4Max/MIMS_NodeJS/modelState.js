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
