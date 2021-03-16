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



