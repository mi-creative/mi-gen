(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.mimsBundle = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
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

},{"./WebEngine1DModules.js":3,"./phyDict.js":8,"./utility.js":10}],3:[function(require,module,exports){
const math = require("mathjs");

const MassType = Object.freeze({
    NONE: "Undefined",
    MASS: "Mass",
    GROUND: "Ground",
    OSC: "Oscillator",
    POSIN: "PosInput"
});

const MacroType = Object.freeze({
    NONE: "Undefined",
    STRING: "String",
    MESH: "Mesh"
});


const InteractionType = Object.freeze({
    NONE: "Undefined",
    SPRING: "Spring",
    DAMPER: "Damper",
    SPRINGDAMPER: "SpringDamper",
    SPRINGNL3: "SpringNL3",
    SPRINGNL2: "SpringNL2",
    CONTACT: "Contact",
    CONTACTNL3: "ContactNL3",
    PLUCKNL: "NlPluck",
    BOWNL: "NlBow"
});


const ObserverType = Object.freeze({
    NONE: "Undefined",
    FRCINPUT: "ForceInput",
    POSOUTPUT: "PosOutput",
    POSINPUT: "PosInput"
});

const ProxyType = Object.freeze({
    NONE: "Undefined",
    STRINGPROXY: "StringProxy",
    MESHPROXY: "MeshProxy"
});


let GlobalParamScope = {};

let sampleRate = 44100;

/**
 * Abstract mass class: common behaviour for all mass-type elements.
 */
class AbstractMass{
    constructor(name, p, v = 0){
        if (this.constructor === AbstractMass) {
            throw new TypeError('Abstract class "AbstractMass" cannot be instantiated directly.');
        }
        this.pos = p;
        this.posR = p - v/sampleRate;
        this.frc = 0;
        this.name = name;
        this.type = MassType.UNDEFINED;
    }

    toString(){return this.name;}

    getName(){return this.name}
    getPos(){return this.pos}
    getPosR(){return this.posR}
    getFrc(){return this.frc}

    getSampleVel(){
        return this.pos - this.posR;
    }

    applyFrc(frcVal){
        this.frc += frcVal;
    }
}

/**
 * Regular mass physical element
 */
class Mass extends AbstractMass{
    constructor(name, mExpression, gravity, p, v = 0){
        super(name, p, v);
        this.M = math.compile(mExpression);
        this.grav = math.compile(gravity);
        this.type = MassType.MASS;
    }

    toString(){
        return this.name+"("+ this.type +", M: "+
            this.getM() +", pos: "+ this.getPos()+", posR: "+ this.getPosR() + ")";
    }

    getM(){return this.M.evaluate();}
    getGrav(){return this.grav.evaluate();}

    compute(){
        let tmp = 2. * this.pos - this.posR + (this.frc - this.getGrav()) / this.getM();
        this.posR = this.pos;
        this.pos = tmp;
        this.frc = 0;
    }
}

/**
 * Oscillator material element
 */
class Oscillator extends AbstractMass{
    constructor(name, mExpression, kExpression, zExpression, gravity, p, v){
        super(name, p, v);
        this.M = math.compile(mExpression);
        this.K = math.compile(kExpression);
        this.Z = math.compile(zExpression);
        this.grav = math.compile(gravity);
        this.type = MassType.OSC;
    }

    toString(){
        return this.name+"("+ this.type +", M: "+
            this.getM() +", K: "+ this.getK() +", Z: "+
            this.getZ() +", pos: "+ this.getPos()+", posR: "+ this.getPosR() + ")";
    }


    getM(){return this.M.evaluate(GlobalParamScope);}
    getK(){return this.K.evaluate(GlobalParamScope);}
    getZ(){return this.Z.evaluate(GlobalParamScope);}
    getGrav(){return this.grav.evaluate(GlobalParamScope);}

    compute(){
        this.A  = 2 - (this.getK() + this.getZ()) / this.getM();
        this.B =  this.getZ() / this.getM() - 1;
        let tmp = this.A * this.pos + this.B * this.posR + (this.frc - this.getGrav()) / this.getM();
        this.posR = this.pos;
        this.pos = tmp;
        this.frc = 0;
    }
}

/**
 * Ground (fixed point) physical element
 */
class Ground extends AbstractMass{
    constructor(name, p){
        super(name, p);
        this.type = MassType.GROUND;
    }

    toString(){
        return this.name+"("+ this.type + ", pos: "+ this.pos + ")";
    }

    compute(){
        this.frc = 0;
    }
}

/**
 * Position element
 */
class PositionInput extends AbstractMass{
    constructor(name, v){
        super(name, v);
        this.type = MassType.POSIN;
    }

    toString(){
        return this.name+"("+ this.type + ", pos: "+ this.pos + ")";
    }

    compute(){
        this.posR = this.pos;
        this.frc = 0;
    }

    setPos(p){
        this.pos = p;
    }
}


/**
 * Abstract Interaction type: common behaviour for all interaction modules
 */
class AbstractInteraction{
    constructor(name, mass1, mass2, lExpression = '0'){
        if (this.constructor === AbstractInteraction)
            throw new TypeError('Abstract class "AbstractInteraction" cannot be instantiated directly.');
        this.name = name;
        this.m1 = mass1;
        this.m2 = mass2;
        this.L = math.compile(lExpression);
        this.type = InteractionType.NONE;
    }

    getL(){return this.L.evaluate(GlobalParamScope);}
    getName(){return this.name}
    getM1(){return this.m1;}
    getM2(){return this.m2;}
}


/**
 * Spring module
 */
class Spring extends AbstractInteraction{
    constructor(name, mass1, mass2,  kExpression, L=0){
        super(name, mass1, mass2, L);
        this.K = math.compile(kExpression);
        this.type = InteractionType.SPRING;
    }

    getK(){return this.K.evaluate(GlobalParamScope);}

    compute(){
        let f = this.getK() * (this.getM1().getPos() - this.getM2().getPos());
        this.getM1().applyFrc(-f);
        this.getM2().applyFrc(f);
    }
}

/**
 * Spring Damper module
 */
class SpringDamper extends AbstractInteraction{
    constructor(name, mass1, mass2, kExpression, zExpression, L = 0){
        super(name, mass1, mass2, L);
        this.K = math.compile(kExpression);
        this.Z = math.compile(zExpression);
        this.type = InteractionType.SPRINGDAMPER;
    }

    getK(){return this.K.evaluate(GlobalParamScope);}
    getZ(){return this.Z.evaluate(GlobalParamScope);}

    compute(){
        let f = this.getK() * (this.getM1().getPos() - this.getM2().getPos())
                + this.getZ() * (this.getM1().getSampleVel() - this.getM2().getSampleVel());
        this.getM1().applyFrc(-f);
        this.getM2().applyFrc(f);
    }
}

/**
 * Damper module
 */
class Damper extends AbstractInteraction{
    constructor(name, mass1, mass2, zExpression){
        super(name, mass1, mass2);
        this.Z = math.compile(zExpression);
        this.type = InteractionType.DAMPER;
    }

    getZ(){return this.Z.evaluate(GlobalParamScope);}

    compute(){
        let f = this.getZ() * (this.getM1().getSampleVel() - this.getM2().getSampleVel());
        this.getM1().applyFrc(-f);
        this.getM2().applyFrc(f);
    }
}

/**
 * Contact module
 */
class Contact extends AbstractInteraction{
    constructor(name, mass1, mass2, kExpression, zExpression, lExpression = '0'){
        super(name, mass1, mass2, lExpression);
        this.K = math.compile(kExpression);
        this.Z = math.compile(zExpression);
        this.L = math.compile(lExpression);
        this.type = InteractionType.CONTACT;
    }

    getK(){return this.K.evaluate(GlobalParamScope);}
    getZ(){return this.Z.evaluate(GlobalParamScope);}
    getL(){return this.L.evaluate(GlobalParamScope);}

    compute(){
        let f = this.getK() * (this.getM1().getPos() - this.getM2().getPos() + this.getL()) +
            this.getZ() * (this.getM1().getSampleVel() - this.getM2().getSampleVel()) ;

        if ((this.getM1().getPos() - this.getM2().getPos()) > - this.getL()){
            this.getM1().applyFrc(-f);
            this.getM2().applyFrc(f);
        }
    }
}



class ContactNL3 extends AbstractInteraction{
    constructor(name, mass1, mass2, K, C, Z, L=0){
        super(name, mass1, mass2, L);
        this.K = K;
        this.Knl3 = C;
        this.Z = Z;
        this.type = InteractionType.CONTACTNL3;
    }
}



class SpringNL3 extends AbstractInteraction{
    constructor(name, mass1, mass2, K, C, Z, L=0){
        super(name, mass1, mass2, L);
        this.K = K;
        this.Knl3 = C;
        this.Z = Z;
        this.type = InteractionType.SPRINGNL3;
    }
}


class SpringNL2 extends AbstractInteraction{
    constructor(name, mass1, mass2, K, P, Z, L=0){
        super(name, mass1, mass2, L);
        this.K = K;
        this.Knl2 = P;
        this.Z = Z;
        this.type = InteractionType.SPRINGNL2;
    }
}


class Pluck extends AbstractInteraction{
    constructor(name, mass1, mass2, K, Z = 0, scale, L=0){
        super(name, mass1, mass2, L);
        this.Knl = K;
        this.Z = Z;
        this.nlscale = scale;
        this.Z = Z;
        this.type = InteractionType.PLUCKNL;
    }
}


class Bow extends AbstractInteraction{
    constructor(name, mass1, mass2, Z, scale, L=0){
        super(name, mass1, mass2, L);
        this.Znl = Z;
        this.nlscale = scale;
        this.type = InteractionType.BOWNL;
    }
}



class AbstractObserver{
    constructor(name, mass){
        if (this.constructor === AbstractObserver)
            throw new TypeError('Abstract class "AbstractObserver" cannot be instantiated directly.');
        this.name = name;
        this.observed = mass;
        this.type = ObserverType.NONE;
    }
    getName(){return this.name}
    getObserved(){return this.observed;}

}

class ForceInput extends AbstractObserver{}

class ForceOutput extends AbstractObserver{}

class PositionOutput extends AbstractObserver{}



class AbstractProxy{
    constructor(name, mac){
        if (this.constructor === AbstractProxy)
            throw new TypeError('Abstract class "AbstractProxy" cannot be instantiated directly.');
        this.name = name;
        this.mac = mac;
        this.type = ProxyType.NONE;
    }
    getName(){return this.name}
    getMacro(){return this.mac;}
}


class StringProxy extends AbstractProxy{
    constructor(name, mac, val){
        super(name, mac);
        this.type = ProxyType.STRINGPROXY;
        this.val = val;
    }
    getVal(){return this.val;}
}




class MeshProxy extends AbstractProxy{
    constructor(name, mac, valx, valy){
        super(name, mac);
        this.type = ProxyType.MESHPROXY;
        this.vx = valx;
        this.vy = valy;
    }
    getVal(){return [this.vx, this.vy];}
}




class AbstractMacro {
    constructor(name, nb){
        if (this.constructor === AbstractMacro)
            throw new TypeError('Abstract class "AbstractMacro" cannot be instantiated directly.');
        this.nbMasses = nb;
        this.masses = [];
        this.type = MacroType.NONE;
        this.name = name;
    }
    getNbMasses(){return this.nbMasses};
}


class String extends AbstractMacro{
    constructor(name, nb, mVal, kVal, zVal, start, end){
        super(name, nb);

        for(let i = 0; i < nb; i++){
            let coef1 = (nb-1-i)/(nb-1);
            let coef2 = i/(nb-1);

            const x = start.x * coef1 + end.x * coef2;
            const y = start.y * coef1 + end.y * coef2;
            const z = start.z * coef1 + end.z * coef2;

            this.masses.push(new Mass(this.name+"_m_"+i, mVal, new vec3(x,y,z)));
        }

        this.pos = start;
        this.endPos = end;

        this.M = mVal;
        this.K = kVal;
        this.Z = zVal;
        this.type = MacroType.STRING;
    }

    toString(){
        return this.name+"("+ this.type +", M: "+ this.M +", K: "+ this.K +", Z: "+ this.Z +", pos: "+ this.pos + ")";
    }

    getM(){return this.M;}
    getK(){return this.K;}
    getZ(){return this.Z;}
}

class Mesh extends AbstractMacro{
    constructor(name, nbL, nbW, mVal, kVal, zVal, start, end){
        super(name, nbL, start, end);
        this.nb_dim2 = nbW;
        this.M = mVal;
        this.K = kVal;
        this.Z = zVal;
        this.type = MacroType.MESH;
    }

    getNbMasses() {
        return this.nbMasses * this.nb_dim2;
    }

    getNbMassesLength(){
        return this.nbMasses;
    }
    getNbMassesWidth(){
        return this.nb_dim2;
    }

    toString(){
        return this.name+"("+ this.type +", M: "+ this.M +", K: "+ this.K +", Z: "+ this.Z +", pos: "+ this.pos + ")";
    }

    getM(){return this.M;}
    getK(){return this.K;}
    getZ(){return this.Z;}
}







module.exports = {
    Mass, Ground, Oscillator, PositionInput,
    String, Mesh,
    Spring, SpringDamper, Damper, Contact, ContactNL3, SpringNL3, SpringNL2, Pluck, Bow,
    ForceInput, ForceOutput, PositionOutput,
    StringProxy, MeshProxy,
    GlobalParamScope,
    MassType
}




},{"mathjs":1}],4:[function(require,module,exports){
const util = require("./utility.js");
const phyDict = require("./phyDict.js");



var TARGET = {
    UNDEFINED : {value: -1, name: "none"},
    GEN : {value: 0, name: "gen~"},
    FAUST: {value: 1, name: "Faust"},
    PROCESSING : {value: 2, name: "Processing"}
};



class AbstractCodeBuilder {

    /**
     * Abstract constructor, mainly used to declare class attributes.
     */
    constructor(model) {

        if (new.target === AbstractCodeBuilder) {
            throw new TypeError("Cannot construct AbstractCodeBuilder instances directly, please construct subclass");
        }

        this.m_target = TARGET.UNDEFINED;
        this.m_generatedCode = "";
        this.m_sampleRateString = "";
        this.m_targetDict = {};
        this.model = model;
        this.nbProxies = 0;
    }

    /**
     * Create a string of arguments separated by commas from a given module (mass or interaction, etc)
     * @param name name of the module
     * @param dict dictionnary associated with the module
     * @returns {string} the string of arguments.
     */
    makeArgString(dict){
        let argstring = "";
        let args = dict["args"];
        var type = dict["type"];
        let regArgNb = this.m_targetDict[type]["nbArgs"];
        let optArgNb = this.m_targetDict[type]["optArgs"].length;

        if (args.length < regArgNb || (args.length > regArgNb + optArgNb))
            throw "Wrong number of arguments to generate code for " + dict ;

        if (args) {
            for (let i = 0; i < args.length; i++) {
                argstring = argstring.concat(", ");
                if(i >= regArgNb){
                    let paramName = phyDict.genModDict[type]["optArgs"][i-regArgNb];
                    argstring = argstring.concat(paramName + " = ");

                    if(paramName === "gravity")
                        argstring = argstring.concat(args[i] + " / " + this.m_sampleRateString);
                    else
                        argstring = argstring.concat(args[i]);
                }
                else
                    argstring = argstring.concat(args[i]);
            }
        }
        return argstring;
    }

    /**
     * Build a string with the position and delayed position for 1D elements,
     * taking into account the target's sample rate format
     * @param dict dictionary of the material element to process.
     * @returns {*[]} a string containing the position and delayed position (separated by a comma).
     */
    buildInitPos1D(dict){
        let z = parseFloat(dict["pos"]["z"]);
        let velz = parseFloat(dict["vel"]["z"]);
        let delPos = z;
        if(velz !== 0)
            delPos = z + " - (" + velz + " / " + this.m_sampleRateString + ")";
        //return z + ", " + delPos;
        return [z.toString(), delPos.toString()];
    }

    /**
     * Check that a module type exists in the dictionary of physical modules
     * @param type
     * @param moduleDict
     * @returns {number}
     */
    checkIsValidModuleType(type, moduleDict){
    if(moduleDict.indexOf(type) > -1)
        return 1;
    else
        return 0;
    }


    /**
     * Check for proxies: if an interaction connects one or several macro elements, we must create proxies and re-route connections.
     * @param mList array with the mass name (will either be a name e.g @m1, or a name and list e.g [@s 0.1]
     * @returns {*[]} state (true or false, name of proxy module, and a dict of proxy information so it can be created according to target
     */
    checkForProxies(mList){
        let macroName;

        // If the mList is a composed term, then we have a proxy on our hands
        if(mList.length > 1){
            macroName = mList[0];
            let pName = "@proxy_" + this.nbProxies;

            if (!util.isPresentInDict(macroName, mdl.macroDict))
                throw  pName + " Code generation error: macro module " + macroName + " does not exist.";

            let alpha = mList[1];
            let beta = null;
            let proxType = "1D";
            if(mList.length === 3){
               beta = mList[2];
               proxType = "2D";
            }

            this.nbProxies++;
            return [true, pName, {"macroName":macroName, "proxType": proxType, "alpha":alpha, "beta":beta, "name":pName}];
        }
        else{
            if (util.isPresentInDict(mList, mdl.macroDict))
                throw "trying to connect to macro " + mList + ", but missing an argument.";
            return [false, mList[0], null];
        }
    }

}


/**
 * Gen DSP code builder class. Takes the model description and generated genexpr code,
 * to be used with the mi-gen library.
 */
class GenCodeBuilder extends AbstractCodeBuilder {

    /**
     * Create an instance of the class with a given model reference.
     * The constructor will specify certain things that are specific to Max/gen~'s terminology and
     * tell the builder to use the gen~ module dictionary.
     * @param model the physical model.
     */
    constructor(model){
        super(model);
        this.m_target = TARGET.GEN;
        this.m_targetDict = phyDict.genModDict;
        this.m_sampleRateString = "SAMPLERATE";
        this.clear();
    }

    /**
     * Clear the state of the code generator.
     */
    clear(){
        // Number of inputs, outputs and proxies in the resulting gen~ code
        this.nbInputs = 0;
        this.nbOutputs = 0;
        this.nbProxies = 0;

        // Code structure: various elements that must be declared outside the physics loop
        this.header = [];
        this.struct = [];
        this.context = [];
        this.params = [];
        this.init = [];

        // Code structure for the physics loop
        this.compMasses = [];
        this.compInteractions = [];
        this.compInput = [];
        this.compOutput = [];
        this.compProxyMasses = [];
        this.compProxyInteractions = [];

        // Buffer code for rendering purposes
        this.motionBufferCode = [];
        this.specificBuffers = {};

        this.massIndex = 0;
        this.instanciatedOuts = [];
    }

    /**
     * Gen specific operation: push a single physical element into the motion buffers for rendering
     * @param name name of the physical element
     * @param element dictionary of the physical element
     */
    pushToMotionBuffers(name, element){
        if(!util.isEmpty(element["buffer"])){
            for(let i = 0; i < element["buffer"].length; i++){
                let bName = element["buffer"][i];
                if (mdl.bufferList.includes(bName)){
                    this.specificBuffers[bName]["code"].push(bName +
                        ".poke(get_pos("+ name +"), "
                        + this.specificBuffers[bName]["index"] + ", 0);");
                    this.specificBuffers[bName]["index"]++;
                }
            }
        }
        this.motionBufferCode.push("motion.poke(get_pos("+ name +"), " + this.massIndex + ", 0);");
        this.massIndex++;
    }

    /**
     * Gen specific operation: push a macro physical element into the motion buffers for rendering
     * @param name name of the macro physical element
     * @param element dictionary of the macro physical element
     * @size the size of the macro element (in number of elementary physical modules)
     */
    pushMacroToMotionBuffers(name, element, size){
        if(!util.isEmpty(element["buffer"])){
            for(let i = 0; i < element["buffer"].length; i++){
                let bName = element["buffer"][i];
                if (mdl.bufferList.includes(bName)){
                    this.specificBuffers[bName]["code"].push("for(i = 0; i < channels("+ name +"); i+=1){");
                    this.specificBuffers[bName]["code"].push(bName + ".poke(get_pos_at("+ name +", i), "
                        + this.specificBuffers[bName]["index"] + " + i" + ", 0);");
                    this.specificBuffers[bName]["code"].push("}");
                    this.specificBuffers[bName]["index"] += size;
                }
            }
        }
        this.motionBufferCode.push("for(i = 0; i < channels("+ name +"); i+=1){");
        this.motionBufferCode.push("motion.poke(get_pos_at("+ name +", i), " + this.massIndex + " + i" + ", 0);");
        this.motionBufferCode.push("}");
        this.massIndex += size;
    }


    /**
     * Generate the additional code for a proxy module once we have detected one
     * @param name the name of the proxy module
     * @param proxDict a dictionary containing the relevant information for the module
     */
    createProxyInstance(pName, proxDict){

        let name = util.formatModuleName(pName);

            this.struct.push("Data " + name + "(3);");
            this.init.push("init_mat(" + name + ", 0, 0);");

            if(proxDict["proxType"] === "1D"){
                let proxArgs = name + ", "
                    + util.formatModuleName(proxDict["macroName"])
                    + ", " + proxDict["alpha"];

                this.compProxyMasses.push("set_proxy_pos_string("+ proxArgs + ");");
                this.compProxyInteractions.push("apply_proxy_frc_string(" + proxArgs + ");");
            }
            else if (proxDict["proxType"] === "2D"){
                let proxArgs = name + ", "
                    + util.formatModuleName(proxDict["macroName"])
                    + ", " + this.model.macroDict[proxDict["macroName"]]["args"][0]
                    + ", " + this.model.macroDict[proxDict["macroName"]]["args"][1]
                    + ", " + proxDict["alpha"]
                    + ", " + proxDict["beta"];

                this.compProxyMasses.push("set_proxy_pos_mesh(" + proxArgs + ");");
                this.compProxyInteractions.push("apply_proxy_frc_mesh(" + proxArgs + ");");
            }
    }

    /* Could probably extract some generic stuff from here to pool with the Faust generation stuff */

    inOutToCode(name, dict, connect){
        let type = dict["type"];

        if (type === "posInput"){
            let nb = parseInt(name.replace("p_in", ""));
            this.nbInputs = Math.max(this.nbInputs, nb);
            return phyDict.genModDict[type]["func"] + "(" + name + ", in" + nb.toString() + ");";
        }
        else if (type === "posOutput"){
            let nb = parseInt(name.replace("out", ""));
            //console.log(nb + "\n");
            this.nbOutputs = Math.max(this.nbOutputs, nb);
            return "out"+ nb.toString() + " = get_pos(" + connect + ");" ;
        }
        else if (type === "frcOutput"){
            let nb = parseInt(name.replace("out", ""));
            this.nbOutputs = Math.max(this.nbOutputs, nb);
            return "out"+ nb.toString() + " = get_frc(" + connect + ");" ;
        }
        else if (type === "frcInput"){
            let nb = parseInt(name.replace("p_in", ""));
            this.nbInputs = Math.max(this.nbInputs, nb);
            return "apply_input_force(" + connect + ", in"+ nb.toString() + ");";
        }
    }


    /**
     * Create gendsp code from the model dictionary
     */
    compileToGenExpr() {
        console.log("Starting to generate gen~ DSP code\n");

        // Initialise several arrays for specific buffers.
        for(let i = 0; i < this.model.bufferList.length; i++){
            this.specificBuffers[this.model.bufferList[i]] = {index : 0, code: []};
        }


        try {

            this.header.push('require(\\"migen-lib\\");');
            if (!util.isEmpty(mdl.macroDict)) {
                this.header.push('require(\\"migen-integrated\\");');
                this.header.push('require(\\"migen-proxies\\");');
            }

            this.header.push('\nBuffer motion;');
            for (let i = 0; i < mdl.bufferList.length; i++)
                this.header.push('Buffer ' + mdl.bufferList[i] + ";");

            let Xcoord = [];
            let Ycoord = [];

            // Step 1: Build the mass element code

            for (let name in this.model.massDict) {
                if (this.model.massDict.hasOwnProperty(name)) {
                    let dict = this.model.massDict[name];
                    let n = util.formatModuleName(name);
                    let type = dict["type"];

                    // Make sure that the type of this module really exists, throw error otherwise
                    if (!this.checkIsValidModuleType(type, phyDict.mass_modules))
                        throw type + " is an unknown module in " + phyDict.mass_modules;

                    this.struct.push("Data " + n + "(3);");
                    this.init.push("init_mat(" + n + ", " + this.buildInitPos1D(dict).join(", ") + ");");

                    this.compMasses.push(
                        this.m_targetDict[type]["func"]
                        + "(" + n + this.makeArgString(dict) + ");"
                    );

                    // Add motion buffer code for the mass-type element
                    this.pushToMotionBuffers(n, dict);
                    Xcoord.push(parseFloat(dict["pos"]["x"]));
                    Ycoord.push(parseFloat(dict["pos"]["y"]));
                }
            }

            // Step 2: build the macro element code

            for (let name in this.model.macroDict) {
                if (this.model.macroDict.hasOwnProperty(name)) {
                    let dict = this.model.macroDict[name];
                    let n = util.formatModuleName(name);
                    let type = dict["type"];

                    // Make sure that the type of this module really exists, throw error otherwise
                    if (!this.checkIsValidModuleType(type, phyDict.macro_modules))
                        throw type + " is an unknown module in " + phyDict.macro_modules;


                    let size = 0;
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

                    this.struct.push("Data " + n + "(3, " + size + ");");
                    this.init.push("init_multiple_masses(" + n + ", " + this.buildInitPos1D(dict).join(", ") + ");");

                    this.compMasses.push(
                        this.m_targetDict[type]["func"]
                        + "(" + n + this.makeArgString(dict) + ");"
                    );

                    this.pushMacroToMotionBuffers(n, dict, size);

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
                        // TODO: This is wrong !!
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

            // Step 3 : Interactions

            for (let name in this.model.interDict) {
                if (this.model.interDict.hasOwnProperty(name)) {
                    let dict = this.model.interDict[name];
                    let prox1 = false, prox2 = false;
                    var type = dict["type"];
                    let n = util.formatModuleName(name);
                    let mass1, mass2, proxDict1, proxDict2;

                    // Check if these interactions are connected to any proxy modules
                    [prox1, mass1, proxDict1] = this.checkForProxies(dict["m1"]);
                    [prox2, mass2, proxDict2] = this.checkForProxies(dict["m2"]);


                    // If they are, create the proxy code, else just check that the modules exist.
                    if(prox1)
                        this.createProxyInstance(mass1, proxDict1);
                    else {
                        if (this.model.isNotPresentInMassOrInOut(mass1))
                            throw mass1 + " does not exist in model, can't create interaction " + name;
                    }

                    if(prox2)
                        this.createProxyInstance(mass2, proxDict2);
                    else{
                        if (this.model.isNotPresentInMassOrInOut(mass2))
                            throw mass2 + " does not exist in model, can't create interaction " + name;
                    }

                    // Now create the gen code for the interaction
                    this.compInteractions.push(
                        this.m_targetDict[type]["func"] + "(" +
                        util.formatModuleName(mass1) + ", " + util.formatModuleName(mass2) +
                        this.makeArgString(dict) + ");"
                    );
                }
            }

            // Step 4 : Inputs and outputs

            for (let name in this.model.inOutDict) {
                if (this.model.inOutDict.hasOwnProperty(name)) {
                    let dict = this.model.inOutDict[name];
                    let n = util.formatModuleName(name);

                    // If the module is a position input, it is mostly calculated as a mass element
                    if (dict["type"] === "posInput") {
                        this.struct.push("Data " + n + "(3);");
                        this.init.push("init_mat(" + n + ", " + parseFloat(dict["pos"]["z"]) + ", " + parseFloat(dict["pos"]["z"]) + ");");
                        this.compInput.push(this.inOutToCode(n, dict, null));

                        // Add motion buffer code for the mass-type element
                        Xcoord.push(parseFloat(dict["pos"]["x"]));
                        Ycoord.push(parseFloat(dict["pos"]["y"]));
                        this.pushToMotionBuffers(n, dict);
                    }

                    // Otherwise all the in out code codes into a specific section.
                    else {
                        let prox = false;
                        let mass, proxDict;

                        // Check if this input/output is related to a proxy
                        [prox, mass, proxDict] = this.checkForProxies(dict["m"]);

                        // If so, create the proxy instance
                        if(prox)
                            this.createProxyInstance(mass, proxDict);
                        else {
                            if (this.model.isNotPresentInMassOrInOut(mass))
                                throw mass + " does not exist in model, can't create interaction " + name;
                        }

                        n = util.formatModuleName(name);

                        if(dict["type"] === "frcInput")
                            this.compInteractions.push(this.inOutToCode(n, dict, util.formatModuleName(mass)));
                        else
                            this.compOutput.push(this.inOutToCode(n, dict, util.formatModuleName(mass)));
                        if(/^out/.test(n))
                            this.instanciatedOuts.push(n.toString());
                    }
                }
            }

            // Step 5: parse the param dict to generate parameter code

            for (let name in this.model.paramDict) {
                if (this.model.paramDict.hasOwnProperty(name)) {
                    let dict = this.model.paramDict[name];
                    let n = util.formatModuleName(name);

                    if (dict["type"] === "param")
                        this.params.push("Param " + n + "(" + dict["args"] + ");");

                    else if (dict["type"] === "audioParam"){
                        let nb = util.stripInOutToInt(dict["input"]);
                        this.compInput.push(n + " = in" + nb + ";");
                        this.nbInputs = Math.max(this.nbInputs, nb);
                    }
                }
            }


            // Step 6 : Figure out the right number of outputs

            let activeOutputs = this.nbOutputs;
            for(let i = 1; i <= activeOutputs; i++){
                if(this.instanciatedOuts.indexOf("out"+i) === -1){
                    this.compOutput.push("out" + i + " = 0.;");
                    console.log("outputs: " + this.nbOutputs + ", " + i + "\n");
                }
            }
            // Add one extra output for the number of masses in the model
            this.compOutput.push("out" + (++this.nbOutputs) + " = " + this.massIndex + ";");

            // Step 7 : build the final code from all of this !

            this.context.push(this.params.join("\n"));
            this.context.push("Param display_motion(1);\n");
            this.context.push("//Model initialisation flag");
            this.context.push("History model_init(0);");
            this.context.push("History render_cpt(0);\n");

            this.init.unshift("if(model_init == 0){");
            this.init.unshift("//Initialisation code");
            this.init.push("model_init = 1;");
            this.init.push("}");

            let codeboxCode = "";

            codeboxCode = codeboxCode.concat(this.header.join("\n"));
            codeboxCode = codeboxCode.concat("\n\n");

            codeboxCode = codeboxCode.concat("// Data structure code\n\n");
            codeboxCode = codeboxCode.concat(this.struct.join("\n"));
            codeboxCode = codeboxCode.concat("\n\n");
            codeboxCode = codeboxCode.concat(this.context.join("\n"));
            codeboxCode = codeboxCode.concat("\n\n");

            codeboxCode = codeboxCode.concat(this.init.join("\n"));
            codeboxCode = codeboxCode.concat("\n\n");

            codeboxCode = codeboxCode.concat("// Model Computation");
            codeboxCode = codeboxCode.concat("\n\n");

            if(!util.isEmpty(this.compInput)){
                codeboxCode = codeboxCode.concat("// Patch input routing\n");
                codeboxCode = codeboxCode.concat(this.compInput.join("\n"));
                codeboxCode = codeboxCode.concat("\n\n");
            }

            if(!util.isEmpty(this.compMasses)){
                codeboxCode = codeboxCode.concat("// Compute new positions of mass-type elements\n");
                codeboxCode = codeboxCode.concat(this.compMasses.join("\n"));
                codeboxCode = codeboxCode.concat("\n\n");
            }

            if(!util.isEmpty(this.compProxyMasses)){
                codeboxCode = codeboxCode.concat("// Compute virtual proxy positions from connected masses\n");
                codeboxCode = codeboxCode.concat(this.compProxyMasses.join("\n"));
                codeboxCode = codeboxCode.concat("\n\n");
            }

            if(!util.isEmpty(this.compInteractions)){
                codeboxCode = codeboxCode.concat("// Compute interaction forces\n");
                codeboxCode = codeboxCode.concat(this.compInteractions.join("\n"));
                codeboxCode = codeboxCode.concat("\n\n");
            }

            if(!util.isEmpty(this.compProxyInteractions)){
                codeboxCode = codeboxCode.concat("// Apply proxy forces to connected material points\n");
                codeboxCode = codeboxCode.concat(this.compProxyInteractions.join("\n"));
                codeboxCode = codeboxCode.concat("\n\n");
            }

            if(!util.isEmpty(this.compOutput)){
                codeboxCode = codeboxCode.concat("// Patch output routing\n");
                codeboxCode = codeboxCode.concat(this.compOutput.join("\n"));
                codeboxCode = codeboxCode.concat("\n\n");
            }

            codeboxCode = codeboxCode.concat("// Motion data routing to Max/MSP buffer objects\n");
            codeboxCode = codeboxCode.concat("if (display_motion){\n");
            codeboxCode = codeboxCode.concat("if (render_cpt == 0){\n");
            codeboxCode = codeboxCode.concat(this.motionBufferCode.join("\n"));
            codeboxCode = codeboxCode.concat("\n");

            // insert specific buffer code here
            for(let i = 0; i < mdl.bufferList.length; i++){
                codeboxCode = codeboxCode.concat(this.specificBuffers[mdl.bufferList[i]]["code"].join("\n"));
                codeboxCode = codeboxCode.concat("\n");
            }

            codeboxCode = codeboxCode.concat("}\n");
            codeboxCode = codeboxCode.concat("render_cpt = (render_cpt + 1) % 200;\n}\n");

            this.m_generatedCode = codeboxCode;


            ////////////////////////////////////////////////////////////////////////////////
            // Mini (optional) final step:
            // Create a json file with the complementary X and Y coordinates for all material elements
            // This was supposed to be used to help generating jitter visualisation, but was never finished.
            ////////////////////////////////////////////////////////////////////////////////

            let jsonSpat = {
                X : Xcoord,
                Y : Ycoord
            };

            console.log("Finished generating gen~ DSP code");
            return [this.m_generatedCode, this.nbInputs, this.nbOutputs, jsonSpat];


        } catch (e) {
            throw("Gen~ Code Generator Error: " + e);
        }
    }

}





class FaustCodeBuilder extends AbstractCodeBuilder{

    constructor(model){
         super(model);
         this.m_target = TARGET.FAUST;
         this.m_targetDict = phyDict.faustModDict;
         this.m_sampleRateString = "ma.SR";
    }


    handleWrapper(proxDict, mWrappers, typeString){
        let macroName = util.formatModuleName(proxDict["macroName"]);
        let type = proxDict["proxType"];

        // First find the macro module in question
        if(!util.isPresentInDict(macroName, mWrappers))
            throw "The macro module " + macroName + "does not exist!";

        let newWrapper = {
            type: typeString,
            topology : type,
            alpha : proxDict["alpha"],
            beta : proxDict["beta"],
            name : proxDict["name"]
        };

        mWrappers[macroName].push(newWrapper);
    }

    compileToFaustDsp(){

        console.log("About to start building Faust DSP code...");

        //if(!util.isEmpty(mdl.macroDict))
        //    throw "The code contains macro elements, cannot generate Faust code !";

        try{

            // All the variables and state variables that we will need
            let fMass = [];
            let fMassIndexMap = {};
            let fInter = [];
            let fParams = [];

            let fFunctions = [];
            let fMacro = [];

            let posOutputMasses = {};
            let posInputMasses = {};
            let frcOutputMasses = {};
            let frcInputMasses = {};

            let macroAttributes = {};
            let macroWrappers = {};
            let macroCpt = 0;

            let deferredInteractions = [];

            let paramAudioIns = [];
            let cpt = 0;

            ////////////////////////////////////////////////////////////
            // Step 1
            // Parse the mass dictionary to generate Faust expressions
            ////////////////////////////////////////////////////////////

            for (let name in this.model.massDict) {
                if (this.model.massDict.hasOwnProperty(name)) {
                    let dict = this.model.massDict[name];
                    let args = dict["args"];
                    let type = dict["type"];

                    if(!this.checkIsValidModuleType(type, phyDict.mass_modules))
                        throw type + " is an unknown module in " + phyDict.mass_modules;

                    // In Faust we must fill in "optional" arguments with actual values
                    if(args.length < this.m_targetDict[type]["nbArgs"] + this.m_targetDict[type]["optArgs"].length)
                        args.push("0");
                    let argstring = args.join(", ");

                    let posData = this.buildInitPos1D(dict);

                    // if the module is a ground, it only takes one initial parameter (no velocity)
                    if(type ==="ground"){
                        fMassIndexMap[name] = {index:cpt++, pos:posData[0], posR: posData[0]};
                        fMass.push(this.m_targetDict[type]["func"] +  "(" + posData[0]  + ")");
                    }
                    else {
                        fMassIndexMap[name] = {index:cpt++, pos:posData[0], posR: posData[1]};
                        fMass.push(this.m_targetDict[type]["func"] +  "(" + argstring + ", " + posData.join(", ") + ")");
                    }
                }
            }


            // Step 2: build the macro element code

            for (let name in this.model.macroDict) {
                if (this.model.macroDict.hasOwnProperty(name)) {
                    let dict = this.model.macroDict[name];
                    let n = util.formatModuleName(name);
                    let type = dict["type"];
                    let args = dict["args"];

                    // Make sure that the type of this module really exists, throw error otherwise
                    if (!this.checkIsValidModuleType(type, phyDict.macro_modules))
                        throw type + " is an unknown module in " + phyDict.macro_modules;

                    let size = 0;
                    let top1D = false;
                    let length = parseInt(dict["args"][0]);
                    let width = 0;

                    if ((type === "string") || (type === "stiffString") || (type === "chain")) {
                        size = length;
                        top1D = true;
                    } else {
                        width = parseInt(dict["args"][1]);
                        size = length * width;
                    }

                    if (isNaN(size))
                        throw "Macro length argument for " + name + " cannot be converted to an integer: " + size;


                    // In Faust we must fill in "optional" arguments with actual values
                    if (args.length < this.m_targetDict[type]["nbArgs"] + this.m_targetDict[type]["optArgs"].length)
                        args.push("0");
                    let argstring = args.join(", ");

                    let posData = this.buildInitPos1D(dict);


                    // We probably want to keep a state of the macro elements as they come
                    // since the interaction / in-out connections will define the wrapper that
                    // we'll have to create around them, adding elements that need to be routed
                    macroAttributes[n] = {
                        type: type,
                        nbNodes : size,
                        argstr : argstring,
                        posData: posData,
                        top1D: top1D
                    };

                    // create an empty array that we'll fill with the proxies and in/out stuff
                    macroWrappers[n] = [];

                }

            }

            ////////////////////////////////////////////////////////////
            // Step 3
            // Parse the in/out dictionary to generate Faust expressions
            ////////////////////////////////////////////////////////////

            for (let name in this.model.inOutDict) {
                if (this.model.inOutDict.hasOwnProperty(name)) {
                    let dict = this.model.inOutDict[name];
                    let type = dict["type"];
                    if (dict["type"] === "posInput"){
                        fMass.push(this.m_targetDict[type]["func"] + "(" + dict["pos"]["z"] + ")");
                        fMassIndexMap[name] = {index:cpt++, pos:dict["pos"]["z"], posR:dict["pos"]["z"]};
                        posInputMasses[util.stripInOutToInt(name)] = {pos:dict["pos"]["z"]};
                    }
                }
            }

            for (let name in this.model.inOutDict) {
                if (this.model.inOutDict.hasOwnProperty(name)) {
                    let dict = this.model.inOutDict[name];
                    if(dict["type"] === "posOutput")
                        posOutputMasses[util.stripInOutToInt(name)] = fMassIndexMap[dict["m"]]["index"];
                    else if(dict["type"] === "frcOutput")
                        frcOutputMasses[util.stripInOutToInt(name)] = fMassIndexMap[dict["m"]]["index"];
                    else if(dict["type"] === "frcInput")
                        frcInputMasses[util.stripInOutToInt(name)] = fMassIndexMap[dict["m"]]["index"];
                }
            }

            ////////////////////////////////////////////////////////////
            // Step 4
            // Parse the param dictionary to generate Faust expressions
            ////////////////////////////////////////////////////////////

            for (let name in this.model.paramDict) {
                if (this.model.paramDict.hasOwnProperty(name)) {
                    let dict = this.model.paramDict[name];
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


            ////////////////////////////////////////////////////////////
            // Step 6
            // Parse all interactions and generate Faust code
            ////////////////////////////////////////////////////////////

            let i_cpt = 0;
            for (let name in this.model.interDict) {
                if (this.model.interDict.hasOwnProperty(name)) {
                    let dict = this.model.interDict[name];
                    let type = dict["type"];
                    let args = dict["args"];
                    let func = this.m_targetDict[type]["func"];

                    // In Faust we must fill in "optional" arguments with actual values
                    if(args.length < this.m_targetDict[type]["nbArgs"] + this.m_targetDict[type]["optArgs"].length)
                        args.push("0");
                    let argstring = args.join(", ");

                    let prox1 = false, prox2 = false;
                    let mass1, mass2, proxDict1, proxDict2;

                    // Check if these interactions are connected to any proxy modules
                    [prox1, mass1, proxDict1] = this.checkForProxies(dict["m1"]);
                    [prox2, mass2, proxDict2] = this.checkForProxies(dict["m2"]);


                    // If they are, register a proxy/wrapper, else just check that the modules exist.
                    if (prox1)
                        this.handleWrapper(proxDict1, macroWrappers, "coupling");
                    else {
                        if (this.model.isNotPresentInMassOrInOut(mass1))
                            throw mass1 + " does not exist in model, can't create interaction " + name;
                    }

                    if (prox2)
                        this.handleWrapper(proxDict2, macroWrappers, "coupling");
                    else{
                        if (this.model.isNotPresentInMassOrInOut(mass2))
                            throw mass2 + " does not exist in model, can't create interaction " + name;
                    }

                    //OH SHIT, this is where it's going to get ugly...
                    // can't generate the routing matrix stuff here because we need to have parsed all
                    // interactions, ins and outs before we know what order to route things in...
                    // possible solution: if no proxies , generate the routing here and now
                    // otherwise, gather all the data we'll need about the interaction and do another pass
                    // at the end, when we're sure of all connexions to a given macro structure.

                    deferredInteractions.push(
                        {
                            m1 : mass1,
                            m2 : mass2,
                            func : func,
                            argstr :argstring
                            // Do we need anything more here ??
                        });
                }
            }


            /// Once we have finished handling all the interactions
            /// (hence finding how many proxies need to exist for each macro element)
            /// we can actually generate the routing functions

            // First let's create the indexes for the proxy elements for each macroWrapper
            let stringWrappersIdx = 0;
            let proxy_cpt = 0;

            for (let macroName in macroWrappers) {
                if (macroWrappers.hasOwnProperty(macroName)) {

                    let wrappers = macroWrappers[macroName];
                    let attrib = macroAttributes[macroName];
                    let function_args = [];
                    let couProxies= 0, inProxies = 0, posOutProxies = 0, frcOutProxies = 0;

                    for (const wrapper of wrappers) {

                        // Now we can create the new indexes that will be sorted by macro element
                        fMassIndexMap[wrapper["name"]] = {index:cpt++, pos:0, posR: 0};
                        proxy_cpt++;

                        // Define the arguments of the function depending on the type of wrapper
                        switch(wrapper["topology"]){
                            case "1D":
                                function_args.push(wrapper["alpha"]);
                                break;
                            case "2D":
                                function_args.push(wrapper["alpha"]);
                                function_args.push(wrapper["beta"]);
                                break;
                        }

                        // Figure out the type of proxy: coupling or in/out
                        switch(wrapper["type"]){
                            case "coupling":
                                couProxies++;
                                break;
                            case "frcInput":
                                inProxies++;
                                break;
                            case "posOutput":
                                posOutProxies++;
                                break;
                            case "frcOutput":
                                frcOutProxies++;
                                break;
                        }
                    }


                    // now we could actually create the code for the "wrapped" macro element
                    if(attrib["top1D"] === true ){
                        let wc;
                        let arg = [];

                        wc = "stringWrapper_" + stringWrappersIdx + "(";
                        arg.push("nbMass");
                        for(let i = 0; i < couProxies; i++)
                            arg.push("cpl_"+ i);

                        wc = wc.concat(arg.join(', ') + ") = (\n");

                        let wa = [];
                        for(let i = 0; i < couProxies; i++)
                            wa.push("strProxFrc(nbMass, cpl_"+ i + ")");

                        wc = wc.concat(wa.join(", "));
                        wc = wc.concat(":\n");
                        wc = wc.concat("prox2str(nbMass, " + couProxies+ "):\n");

                        // Remove the first argument from the string as we want to use it as a parameter.
                        let argWoNbMass = attrib["argstr"].split(/,(.+)/)[1];

                        let base = this.m_targetDict[attrib["type"]]["func"] + "("
                            + "nbMass, " + argWoNbMass + ", "
                            + attrib["posData"].join(", ") + "):\n";
                        wc = wc.concat(base);

                        wc = wc.concat("str2prox(nbMass, " + couProxies+ "):\n");

                        wa = [];
                        for(let i = 0; i < couProxies; i++)
                            wa.push("strProxPos(nbMass, cpl_"+ i + ")");
                        wc = wc.concat(wa.join(", "));
                        wc = wc.concat(");\n");
                        //console.log(wc);
                        fFunctions.push(wc);

                        let funCall = "stringWrapper_" + stringWrappersIdx + "(" + attrib["nbNodes"] + ", ";
                        funCall = funCall.concat(function_args.join(", ") + ")");
                        //console.log(funCall);
                        fMacro.push(funCall);

                        stringWrappersIdx++;
                    }
                    else {
                        // TODO: handle mesh type elements.
                    }
                }
            }


            ////////////////////////////////////////////////////////////
            // Step 5
            // Create variables and structures
            ////////////////////////////////////////////////////////////

            let nbMasses = fMass.length + proxy_cpt;
            let nbInter = Object.keys(this.model.interDict).length;

            let nbPosOut = Object.keys(posOutputMasses).length;
            let nbFrcOut = Object.keys(frcOutputMasses).length;
            let nbOut = nbPosOut + nbFrcOut;

            let nbPosInput = Object.keys(posInputMasses).length;
            let nbFrcInput = Object.keys(frcInputMasses).length;

            // Create the routing matrix now that we have the correct number of elements
            let routingMatrix = Array(nbMasses).fill(null).map(() => Array(2*nbInter).fill(0));

            // Now let's all the interactions now that we have full completion of the mass elements.
            for (const inter of deferredInteractions) {

                routingMatrix[fMassIndexMap[inter["m1"]]["index"]] [2*i_cpt] = 1;
                routingMatrix[fMassIndexMap[inter["m2"]]["index"]] [2*i_cpt+1] = 1;

                 fInter.push(inter["func"] +  "(" + inter["argstr"] + ", " +
                     fMassIndexMap[inter["m1"]]["pos"] + ", " +
                     fMassIndexMap[inter["m2"]]["pos"] + ")");

                i_cpt++;

            }


            ////////////////////////////////////////////////////////////
            // Step 7
            // Generate the routing tables used by Faust
            ////////////////////////////////////////////////////////////

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


            ////////////////////////////////////////////////////////////
            // Step 8
            // Now that we have all this, we can generate the Faust dsp !
            ////////////////////////////////////////////////////////////

            let fDSP = "import(\"stdfaust.lib\");\n\n";

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

            let fPosInputRoute = "";
            if (nbPosInput > 1)
                fPosInputRoute = "par(i, nbMass - nbPosIn, _), ro.interleave(nbPosIn, 2):\n\t";


            let fWith = "";
            if(nbInter){
                fWith =
                    "with{\n\t" + m2l + "\n\t" + l2m +"\n"
                    + "\tnbMass = " + nbMasses + ";\n";
            }
            else {
                fWith =
                    "with{\n\t" + "\tnbMass = " + nbMasses + ";\n";
            }




            if(nbFrcInput > 0){
                frcPassThrough = ",\n\tpar(i, nbFrcIn,_)";
                fWith = fWith.concat("\tnbFrcIn = " + nbFrcInput + ";\n");
            }

            if(nbPosInput > 0)
                fWith = fWith.concat("\tnbPosIn = " + nbPosInput + ";\n");

            if (fInter.length > 0)
                interDSP = interDSP.concat(fInter.join(",\n\t") + ",\n");


            if(nbOut+nbFrcInput > 0)
                if(nbFrcInput > 0)
                    if(nbPosOut)
                        interCable = "\tpar(i, nbPosOut+nbFrcIn, _)";
                    else
                        interCable = "\tpar(i, nbFrcIn, _)";
                else
                if(nbPosOut)
                    interCable = "\tpar(i, nbPosOut, _)";
                else
                    interDSP = interDSP.replace(/,\s*$/, "");


            if(nbOut > 0){
                outCable = ", par(i, nbOut , _)";
                fWith = fWith.concat("\tnbOut = " + nbOut + ";\n");
            }

            if(nbPosOut >0)
                fWith = fWith.concat("\tnbPosOut = " + nbPosOut + ";\n");


            fWith = fWith.concat("};\n");

            // TODO: fix this better!
            let tmp = "";
            if( (fMacro.length < 0)){
                tmp = ",\n\t";
            }


            let interactionSection;
            if(nbInter === 0) {
                interactionSection = "";
            }
            else {
                interactionSection =
                    ":\n\t"
                    + "RoutingMassToLink "
                    + frcPassThrough
                    + ":\n\t"
                    + interDSP
                    + interCable
                    + ":\n\t"
                    + "RoutingLinkToMass\n"
                    + ")~par(i, nbMass, _):"
                    + "\npar(i, nbMass, !)" + outCable + "\n";
            }




            fDSP = fDSP.concat(
                "model = (\n\t"
                + fPosInputRoute
                + fMass.join(",\n\t")
                + tmp
                + fMacro.join(",\n\t")
                + frcPassThrough
                + interactionSection

                /*+ "RoutingMassToLink "
                + frcPassThrough
                + ":\n\t"
                + interDSP
                + interCable
                + ":\n\t"
                + "RoutingLinkToMass\n)~par(i, nbMass, _):"
                */

                + fWith
            );


            fDSP = fDSP.concat("\n\n" + fFunctions.join("\n") + "\n\n");


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
}



module.exports = {GenCodeBuilder, FaustCodeBuilder};

},{"./phyDict.js":8,"./utility.js":10}],5:[function(require,module,exports){

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

},{}],6:[function(require,module,exports){
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
const codeBuilder = require("./codeBuilder.js");
//const mdl2faust = require("./mdl2faust.js");
const webSim = require("./WebEngine1D");

let simu = new webSim.PhysicsSim();

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
    if(mdl.isValid()){
        //return mdl2gen.generateGenCode();
        let genBuilder = new codeBuilder.GenCodeBuilder(mdl);
        return genBuilder.compileToGenExpr();
    }
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
    /*if(!mdl.isFaustCompatible()){
        console.log("The model contains modules that are incompatible with Faust generation.");
        //throw "Faust DSP create error: The model is incompatible with Faust. Does it contain macro modules?";

    }
    else{*/
        if(mdl.isValid()){
            let faustBuilder = new codeBuilder.FaustCodeBuilder(mdl);
            return faustBuilder.compileToFaustDsp();
            //return mdl2faust.generateFaustCode();
        }
        else
            throw "Faust dsp create error: Invalid model state. Please parse a model first.";
    //}
}


function createSimulationJS(){
    simu = new webSim.PhysicsSim();
    simu.loadModel(mdl);
}

/**
 * Run a simulation step from the JS web simulator
 */
function simulationStep(){
    if(simu.isReady())
        simu.compute();
}

/**
 * Get the dict of simulation positions from the simulation
 * @returns {the}
 */
function getSimPositions(){
    if(simu.isReady())
        return simu.getSimPositions();
}


/**
 * Update a position input value (posInput module)
 * @param name name of the pos input (e.g p_in1)
 * @param val value to apply
 */
function update_posInput(name, val){
    simu.applyPosInput(name, parseFloat(val));
}

/**
 * Update a global scope parameter in the simulation context
 * @param name name of the parameter
 * @param val value to assign
 */
function update_param(name, val){
    simu.updateParameter(name, parseFloat(val));
}

/**
 * get the dictionary of global parameters used within the simulation scope
 * @returns {{}}
 */
function get_param_dict(){
    return simu.getParameterScope();
}

/**
 * Apply a force input to a frcInput element in the model
 * @param name the name of the force input (e.g. f_in1)
 * @param val the value to apply
 */
function apply_frcInput(name, val){
    simu.applyFrcInput(name, parseFloat(val));
}


// This doesn't return anything yet, so avoid...
function parseAndGenerateDSP(text){
    parseMIMSFile(text);
    generateGenDSP();
    buildGendspPatch();
    generateFaustDSP();
}



// Pour Jérôme: un essai, je sais pas si ça va résoudre ton problème !
if (typeof window === 'undefined') {
    // in NodeJS context, do nothing
} else {
    window.createSimulationJS = createSimulationJS;
    window.simulationStep = simulationStep;
    window.getSimPositions = getSimPositions;
    window.parseMIMSFile = parseMIMSFile;
    window.generateGenDSP = generateGenDSP;
    window.generateFaustDSP = generateFaustDSP;
    window.get_param_dict = get_param_dict;
    window.update_param = update_param;
    window.apply_frcInput = apply_frcInput;
}

module.exports = {
    parseMIMSFile : parseMIMSFile,
    generateGenDSP :generateGenDSP,
    generateFaustDSP : generateFaustDSP,
    buildGendspPatch : buildGendspPatch,
    parseAndGenerateDSP : parseAndGenerateDSP,
    createSimulationJS : createSimulationJS,
    simulationStep : simulationStep,
    getSimPositions : getSimPositions,
    update_posInput : update_posInput,
    update_param : update_param,
    apply_frcInput : apply_frcInput,
    get_param_dict : get_param_dict,

};
},{"./WebEngine1D":2,"./codeBuilder.js":4,"./gendspCreator.js":5,"./scriptParser":9}],7:[function(require,module,exports){
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
        return 1;
        //return util.isEmpty(mdl.macroDict);
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
},{"./utility.js":10}],8:[function(require,module,exports){
var all_modules, in_out_modules, interaction_modules, macro_modules, mass_modules, other_modules;
mass_modules = ["mass", "osc", "ground"];
interaction_modules = ["damper", "spring", "nlSpring2", "nlSpring3", "nlPluck", "nlBow", "contact", "springDamper", "nlSpringDamper", "nlContact"];
macro_modules = ["string", "stiffString", "chain", "mesh", "closedMesh", "cornerMesh"];
in_out_modules = ["posInput", "posOutput", "frcInput", "frcOutput"];
other_modules = ["none", "param", "audioParam"];
all_modules = ((((mass_modules + interaction_modules) + macro_modules) + in_out_modules) + other_modules);


const genModDict = {
    "mass" : {func : "compute_mass", nbArgs:1, optArgs : ["gravity"]},
    "osc" : {func : "compute_osc", nbArgs:3, optArgs : ["gravity"]},
    "ground" : { func :"compute_ground", nbArgs:0, optArgs : 0},
    "spring" : { func :"compute_spring", nbArgs:1, optArgs : 0},
    "springDamper" : { func :"compute_spring_damper", nbArgs:2, optArgs : 0},
    "damper" : { func :"compute_damper", nbArgs:1, optArgs : 0},
    "contact" : { func :"compute_contact", nbArgs:2, optArgs : ["thresh"]},
    "nlContact" : { func :"compute_contact_nl3_clipped", nbArgs:4, optArgs : ["thresh"]},
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
    "mass" : {func : "mi.mass", nbArgs:1, optArgs : ["gravity"]},
    "osc" : {func : "mi.oscil", nbArgs:3, optArgs : ["gravity"]},
    "ground" : { func :"mi.ground", nbArgs:0, optArgs : 0},
    "spring" : { func :"mi.spring", nbArgs:1, optArgs : 0},
    "springDamper" : { func :"mi.springDamper", nbArgs:2, optArgs : 0},
    "damper" : { func :"mi.damper", nbArgs:1, optArgs : 0},
    "contact" : { func :"mi.collision", nbArgs:2, optArgs : ["thresh"]},
    "nlContact" : { func :"mi.nlCollisionClipped", nbArgs:4, optArgs : ["thresh"]},
    "nlSpring2" : { func :"mi.nlSpringDamper2", nbArgs:3, optArgs : 0},
    "nlSpring3" : { func :"mi.nlSpringDamper3", nbArgs:3, optArgs : 0},
    "nlSpringDamper" : { func :"mi.nlSpringDamperClipped", nbArgs:4, optArgs : 0},
    "nlBow" : { func :"mi.nlBow", nbArgs:2, optArgs : ["smooth"]},
    "nlPluck" : { func :"mi.nlPluck", nbArgs:2, optArgs : ["Z"]},
    "posInput" : { func :"mi.posInput", nbArgs:0, optArgs : 0},
    "string" : { func :"macroString", nbArgs:4, optArgs : ["Zo"]}
    //"frcInput" : { func :"mi.apply_input_force", nbArgs:0, optArgs : 0},
};


module.exports = {mass_modules, interaction_modules, macro_modules, in_out_modules, other_modules, all_modules,
    genModDict, faustModDict};

},{}],9:[function(require,module,exports){
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
},{"./modelState.js":7,"./phyDict.js":8,"./utility.js":10}],10:[function(require,module,exports){

/** Some utility functions used here and there **/


/**
 * Format a module label (e.g. @m1) to the format used in gen~ code (m1, or p_in1 if position input).
 * @param name The label of the module in the MIMS script.
 * @returns {void | string} the formatted name to be used in gen~ code.
 */
function formatModuleName(name, char = "p"){
    var m = name.toString().replace("@", "");
    if(/^in/.test(m))
        m = char.concat("_".concat(m));
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

// Pour Jérôme: un essai, je sais pas si ça va résoudre ton problème !
if (typeof window === 'undefined') {
    // in NodeJS context, do nothing
} else {
    // Specific window declarations for browser based operation
    window.isPresentInDict = isPresentInDict;
    window.isEmpty = isEmpty;
}


module.exports = {
    formatModuleName, stripInOutToInt, checkIsModule,
    isPresentInDict, posStringToDict, isEmpty
};
},{}]},{},[6])(6)
});
