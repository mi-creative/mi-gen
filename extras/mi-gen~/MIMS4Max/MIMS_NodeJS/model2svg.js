const { createSVGWindow } = require('svgdom');
const window = createSVGWindow();
const SVG = require('svg.js')(window);
const document = window.document;

function drawSVG(){

    var draw = new SVG(document.documentElement).size(300, 300);
    var rect = draw.rect(100, 100).attr({ fill: '#f06' })


    console.log(rect.svg());
}


module.exports = {
    drawSVG : drawSVG
}