"use strict";

var coloredShimHeight = 0.05;
var initialCubeZPos = -2;
var finalCubeZPos = 0;

var generalCubeVerticies = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];

var generalCubeVertexColors = [
    vec4(0.0, 0.0, 0.0, 1.0),  // black
    vec4(1.0, 0.0, 0.0, 1.0),  // red
    vec4(1.0, 1.0, 0.0, 1.0),  // yellow
    vec4(0.0, 1.0, 0.0, 1.0),  // green
    vec4(0.0, 0.0, 1.0, 1.0),  // blue
    vec4(1.0, 0.0, 1.0, 1.0),  // magenta
    vec4(0.0, 1.0, 1.0, 1.0),  // cyan
    vec4(1.0, 1.0, 1.0, 1.0),  // white
];

function quad(a, b, c, d, vertexBuffer, colorBuffer, colorIdx){
	vertexBuffer.push(generalCubeVerticies[a]);
    vertexBuffer.push(generalCubeVerticies[b]);
    vertexBuffer.push(generalCubeVerticies[c]);
    vertexBuffer.push(generalCubeVerticies[d]);
    if(colorIdx == -1)
        for(var i = 0; i < 4; i++)
            colorBuffer.push(generalCubeVertexColors[a]);
    else
        for(var i = 0; i < 4; i++)
            colorBuffer.push(generalCubeVertexColors[colorIdx]);
}

//const sleep = ms => new Promise(r => setTimeout(r, ms));