const util = require("./utility.js");
const mi = require("./WebEngine1DModules.js");
const phyDict = require("./phyDict.js");


/**
 * PhysicsSim class: a JS-based 1D simulation engine for web browsers!
 * Will be too slow for audio calculations, meant as a way experiment and check
 * model behaviour at low speeds inside the MIMS_Online system.
 */
class PhysicsSim{

    /**
     * Main constructor method: initialises the physics simulation context.
     */
    constructor() {
        console.log("This is the physics context\n");

        this.matArray = [];
        this.matTable = [];

        this.intArray = [];
        this.intTable = [];

        this.paramArray = [];
        this.observerArray = [];
        this.observerTable = [];
        this.macroArray = [];
        this.macroTable = [];
        this.proxyArray = [];
        this.macroMasses = 0;

        this.mDict = {};
        this.modelReady = false;

        this.frcIn = {};

        for(const key in mi.GlobalParamScope) {
            delete mi.GlobalParamScope.key;
        }

    }

    /**
     * Load a physical model dictionary into the simulator
     * @param modelDict the model dictionary to load (parsed from a MIMS description)
     */
    loadModel(modelDict){
        this.mDict = modelDict;

        for (let name in this.mDict.paramDict){
            if (this.mDict.paramDict.hasOwnProperty(name)) {
                let dict = this.mDict.paramDict[name];
                let args = dict["args"];
                let n = util.formatModuleName(name);
                this.addParam(n, parseFloat(args));
            }
        }

        //console.log("param scope: " + JSON.stringify(mi.GlobalParamScope));

        for (let name in this.mDict.massDict) {
            if (this.mDict.massDict.hasOwnProperty(name)) {
                let dict = this.mDict.massDict[name];
                let args = dict["args"];
                let n = util.formatModuleName(name);
                let type = dict["type"];
                let mass, grav = 0;
                let pos = parseFloat(dict["pos"]["z"]);
                let vel = parseFloat(dict["vel"]["z"]);

                switch (type) {
                    case 'mass':
                        if(args.length > 1){
                            grav = args[1];
                            mass = args[0];
                        }
                        else
                            mass = args[0];
                        this.addMass(n, args[0], grav, pos, vel);
                        break;
                    case 'ground':
                        this.addGround(n, pos);
                        break;
                    case 'osc':
                        if(args.length > 3)
                            grav = args[3];
                        this.addOscillator(n, args[0], args[1], args[2], grav, pos, vel);
                        break;
                    case 'posInput':
                        this.addPositionInput(n, pos);
                        break;
                    default:
                        console.log("Unrecognised mass type !");
                }
            }
        }

        for (let name in this.mDict.inOutDict) {
            if (this.mDict.inOutDict.hasOwnProperty(name)) {
                let dict = this.mDict.inOutDict[name];
                let type = dict["type"];
                let n;

                switch (type) {
                    case 'posInput':
                        let pos = parseFloat(dict["pos"]["z"])
                        n = util.formatModuleName(name, "p");
                        this.addPositionInput(n, pos);
                        break;
                    case 'frcInput':
                        console.log(dict["m"]);
                        n = util.formatModuleName(name, "f");
                        let moduleName = util.formatModuleName(dict["m"]);
                        this.addForceInput(n, moduleName);
                        break;
                    default:
                        console.log("Unrecognised input type !");
                }
            }
        }

        console.log(this.frcIn);


        for (let name in this.mDict.interDict) {
            if (this.mDict.interDict.hasOwnProperty(name)) {
                let dict = this.mDict.interDict[name];
                let args = dict["args"];
                let type = dict["type"];
                let n = util.formatModuleName(name);
                let mass1, mass2;
                let L = 0;

                mass1 = util.formatModuleName(dict["m1"]);
                mass2 = util.formatModuleName(dict["m2"]);

                switch (type) {
                    case 'spring':
                        this.addSpring(n, mass1, mass2, args[0]);
                        break;
                    case 'springDamper':
                        this.addSpringDamper(n, mass1, mass2, args[0], args[1]);
                        break;
                    case 'damper':
                        this.addDamper(n, mass1, mass2, args[0]);
                        break;
                    case 'contact':
                        if(args.length>2)
                            L = args[2];
                        this.addContact(n, mass1, mass2, args[0], args[1], L);
                        break;
                    default:
                        console.log("Unrecognised interaction type !");
                }
            }
        }

        this.modelReady = true;
        console.log("PhysicsSim::loadModel : finished loading physical model.")

    }

    /**
     * Check if the simulation engine is ready (if a valid model has been loaded into it).
     * @returns {boolean} true if the simulator is ready
     */
    isReady(){
        return this.modelReady;
    }

    /**
     * Get a dict of the material points in the current simulation and their respective positions.
     * @returns the dictionary containing module names and positions.
     */
    getSimPositions(){
        let simStatePos = {};
        this.getMatArray().forEach(function(m) {
            simStatePos[m.getName()]  = m.getPos();
        });
        return simStatePos;
    }

    /*
    getTable(){
        return this.matArray;
    }
    */

    /**
     * Apply force to a given force input point in the model
     * @param name the module identifier
     * @param val the force to apply
     */
    // Todo: check that we're applying force to an actual frcInput module
    applyFrcInput(name, val){
        if(util.isPresentInDict(name, this.frcIn)){
            let mName = this.frcIn[name];
            this.applyFrcToAnyMass(mName, val);
        }
    }

    /**
     * Apply force to any mass in the model (not necessarily declared with frcInput module!)
     * @param name
     * @param val
     */
    applyFrcToAnyMass(name, val){
        if(this.isMassInModel(name))
            this.findMass(name).applyFrc(val);
        else
            console.log("Cannot find mass to apply force to");
    }


    /**
     * Apply an input position to a posInput module
     * @param name the module identifier
     * @param val the position value to apply
     */
    applyPosInput(name, val){
        if(this.isMassInModel(name)){
            let m = this.findMass(name);
            if (m.type === mi.MassType.POSIN){
                m.setPos(val);
            }
        }
        else
            console.log("Cannot find position input to drive");
    }

    /**
     * Update a labelled physical parameter (defined in a global dict that all modules may refer to when computing)
     * @param name name of the labelled parameter
     * @param val value to apply to this parameter
     */
    updateParameter(name, val){
        if(util.isPresentInDict(name, mi.GlobalParamScope)){
            mi.GlobalParamScope[name] = val;
        }
    }

    /**
     * Get the dict containing the global parameter values used to calculate physical parameters
     * @returns {{}}
     */
    getParameterScope(){
        return mi.GlobalParamScope;
    }


    getNumberOfMats(){return this.matArray.length;}
    getNumberOfInteractions(){return this.intArray.length;}
    getNumberOfParams(){return this.paramArray.length;}
    getNumberOfObservers(){return this.observerArray.length;}
    getNumberOfMacroObjects(){return this.macroArray.length;}
    getNumberOfMacroMasses(){return this.macroMasses;}
    getNumberOfProxies(){return this.proxyArray.length;}

    getMatArray(){return this.matArray;}
    getInteractionArray(){return this.intArray;}
    getParamArray(){ return this.paramArray;}
    getObserverArray(){return this.observerArray;}
    getMacroArray(){return this.macroArray;}
    getProxyArray(){return this.proxyArray;}


    checkMassName(name){
        if (this.matTable.includes(name))
            throw new Error("AddMass Errror: The name "+ name + "is already used in the model !");
    }

    /**
     * Check if a mass identifier exists in the current simulation
     * @param mass_id the mass identifier
     * @returns {boolean} true if exists, false otherwise
     */
    isMassInModel(mass_id){
        return this.matTable.indexOf(mass_id) > -1;
    }

    /**
     * Fin a mass object within the simulation. Beware, throws error if the module is not found!
     * @param mass_param the mass identifier
     * @returns {*} a reference to the material element object
     */
    findMass(mass_param){
        let m1;
        if(Number.isInteger(mass_param) && mass_param < this.matTable.length)
            m1 = this.matArray[mass_param];
        else if (this.isMassInModel(mass_param))
            m1 = this.matArray[this.matTable.indexOf(mass_param)];
        else
            throw new Error("FindMass Errror: The mass "+ mass_param + " doesn't exist in the model !");
        return m1;
    }

    findMacro(mac_param){
        let m1;
        //console.log(mac_param);
        //console.log(this.macroTable.indexOf(mac_param));

        if(Number.isInteger(mac_param) && mac_param < this.macroTable.length)
            m1 = this.macroArray[mac_param];
        else if (this.macroTable.indexOf(mac_param) > -1)
            m1 = this.macroArray[this.macroTable.indexOf(mac_param)];
        else
            throw new Error("FindMacro Errror: The macro object "+ mac_param + " doesn't exist in the model !");
        return m1;
    }


    checkIntName(name){
        if (this.intTable.includes(name))
            throw new Error("CheckIntParams Errror: The name "+ name + " is already used in the model !");
    }



    checkForProxy(id){
        let c;
        if(Array.isArray(id)){
            //console.log(id[0]);
            c = this.addProxy(id);
        }
        else
            c = this.findMass(id);
        return c;
    }



    addProxy(list){
        let prox;
        if(list.length < 3){
            prox = new mi.StringProxy("prox_s"+this.getNumberOfProxies(), this.findMacro(list[0]), list[1])
            this.proxyArray.push(prox);
        }
        else if (list.length < 4) {
            prox = new mi.MeshProxy("prox_m"+this.getNumberOfProxies(), this.findMacro(list[0]), list[1], list[2]);
            this.proxyArray.push(prox);
        }
        else
            throw new Error("addProxy Errror: Not a string or a mesh !");
        return prox;
    }


    /**
     * Compute a simulation step for the current model: first a mass step, then an interaction step.
     */
    compute(){
        this.getMatArray().forEach(function(m) {
            m.compute();
        });
        this.getInteractionArray().forEach(function(i) {
            i.compute();
        });
    }




    addMass(name, mVal, gravity, pos, vel){
        this.checkMassName(name);
        this.matArray.push(new mi.Mass(name, mVal, gravity, pos, vel));
        this.matTable.push(name);
    }

    addGround(name, pos){
        this.checkMassName(name);
        this.matArray.push(new mi.Ground(name, pos));
        this.matTable.push(name);
    }

    addOscillator(name, mVal, kVal, zVal, gravity, pos, vel){
        this.checkMassName(name);
        this.matArray.push(new mi.Oscillator(name, mVal, kVal, zVal, gravity, pos, vel));
        this.matTable.push(name);
    }

    addPositionInput(name, pos){
        this.checkMassName(name);
        this.matArray.push(new mi.PositionInput(name, pos));
        this.matTable.push(name);
    }



    /*
    addString(name, nb, mVal, kVal, zVal, pos, end){
        this.checkMassName(name);
        this.macroArray.push(new mi.String(name, nb, mVal, kVal, zVal, new mi.vec3(pos[0], pos[1], pos[2]), new mi.vec3(end[0], end[1], end[2])));
        this.macroTable.push(name);
        this.macroMasses += nb;
    }

    addMesh(name, nbX, nbY, mVal, kVal, zVal, pos, end){
        this.checkMassName(name);
        this.macroArray.push(new mi.Mesh(name, nbX, nbY, mVal, kVal, zVal,
            new mi.vec3(pos[0], pos[1], pos[2]), new mi.vec3(end[0], end[1], end[2])));
        this.macroTable.push(name);
        this.macroMasses += nbX*nbY;
    }

    */



    addSpring(name, mass1, mass2, K, L = 0){
        this.checkIntName(name);
        var c1 = this.checkForProxy(mass1);
        var c2 = this.checkForProxy(mass2);
        this.intArray.push(new mi.Spring(name, c1, c2,  K, L));
        this.intTable.push(name);
    }


    addSpringDamper(name, mass1, mass2, K, Z, L = 0){
        this.checkIntName(name);
        var c1 = this.checkForProxy(mass1);
        var c2 = this.checkForProxy(mass2);
        this.intArray.push(new mi.SpringDamper(name, c1, c2, K, Z, L));
        this.intTable.push(name);
    }

    addDamper(name, mass1, mass2, Z){
        this.checkIntName(name);
        var c1 = this.checkForProxy(mass1);
        var c2 = this.checkForProxy(mass2);
        this.intArray.push(new mi.Damper(name, c1, c2, Z));
        this.intTable.push(name);
    }


    addContact(name, mass1, mass2, K, Z, L = 0){
        this.checkIntName(name);
        var c1 = this.checkForProxy(mass1);
        var c2 = this.checkForProxy(mass2);
        this.intArray.push(new mi.Contact(name, c1, c2, K, Z, L));
        this.intTable.push(name);
    }


    addParam(pName, initVal){
        // TODO: check if param already exists!
        this.paramArray.push({name: pName, value: initVal});
        mi.GlobalParamScope[pName] = initVal;
    }


    addForceInput(fName, mass){
        this.checkIntName(fName);
        this.checkMassName(fName);
        this.frcIn[fName] = mass;
        //this.observerArray.push(new mi.ForceInput(fName, this.checkForProxy(mass)));
    }

    addForceOutput(fName, mass){
        this.checkIntName(fName);
        this.checkMassName(fName);
        this.observerArray.push(new mi.ForceOutput(fName, this.checkForProxy(mass)));
    }

    addPositionOutput(pName, mass){
        this.checkIntName(pName);
        this.checkMassName(pName);
        this.observerArray.push(new mi.PositionOutput(pName, this.checkForProxy(mass)));
    }

}


module.exports = {PhysicsSim};
