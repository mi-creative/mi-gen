var all_modules, in_out_modules, interaction_modules, macro_modules, mass_modules, other_modules;
mass_modules = ["mass", "massG", "osc", "ground"];
interaction_modules = ["damper", "spring", "nlSpring", "nlSpring2", "nlSpring3", "nlPluck", "nlBow", "contact", "springDamper", "nlSpringDamper", "nlContact"];
macro_modules = ["string", "stiffString", "chain", "mesh", "closedMesh", "cornerMesh"];
in_out_modules = ["posInput", "posOutput", "frcInput", "frcOutput"];
other_modules = ["none", "param", "audioParam"];
all_modules = ((((mass_modules + interaction_modules) + macro_modules) + in_out_modules) + other_modules);


const genModDict = {
    "mass" : {func : "compute_mass", nbArgs:1, optArgs : ["gravity"]},
    //"massG" : {func: "compute_massG", nbArgs:2, optArgs : 0},
    "osc" : {func : "compute_osc", nbArgs:3, optArgs : ["gravity"]},
    "ground" : { func :"compute_ground", nbArgs:0, optArgs : 0},
    "spring" : { func :"compute_spring", nbArgs:1, optArgs : 0},
    "springDamper" : { func :"compute_spring_damper", nbArgs:2, optArgs : 0},
    "damper" : { func :"compute_damper", nbArgs:1, optArgs : 0},
    "contact" : { func :"compute_contact", nbArgs:2, optArgs : ["thresh"]},
    "nlContact" : { func :"compute_contact_nl3_clipped", nbArgs:4, optArgs : ["thresh"]},
    //"nlSpring" : { func :"compute_spring_damper_nl3", nbArgs:3},
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
    //"frcInput" : { func :"mi.apply_input_force", nbArgs:0, optArgs : 0},
};


module.exports = {mass_modules, interaction_modules, macro_modules, in_out_modules, other_modules, all_modules, genModDict, faustModDict};
