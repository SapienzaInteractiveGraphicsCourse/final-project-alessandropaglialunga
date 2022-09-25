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
    vec4(0.8, 0.8, 0.8, 1.0),  // gray
    vec4(1.0, 0.0, 0.0, 1.0),  // red
    vec4(1.0, 1.0, 0.0, 1.0),  // yellow
    vec4(0.0, 1.0, 0.0, 1.0),  // green
    vec4(0.0, 0.0, 1.0, 1.0),  // blue
    vec4(1.0, 0.0, 1.0, 1.0),  // magenta
    vec4(0.0, 1.0, 1.0, 1.0),  // cyan
    vec4(1.0, 1.0, 1.0, 1.0),  // white
];

var generalCubeTexCoords = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

function quad(a, b, c, d, vertexBuffer, colorBuffer, normalBuffer, textureBuffer, colorIdx){
	vertexBuffer.push(generalCubeVerticies[a]);
    vertexBuffer.push(generalCubeVerticies[b]);
    vertexBuffer.push(generalCubeVerticies[c]);
    vertexBuffer.push(generalCubeVerticies[d]);

    var t1 = subtract(generalCubeVerticies[b], generalCubeVerticies[a]);
    var t2 = subtract(generalCubeVerticies[c], generalCubeVerticies[b]);
    var normal = cross(t1, t2);
    normal = vec3(normal);
    for(var i = 0; i < 4; i++){
        normalBuffer.push(normal);
        textureBuffer.push(generalCubeTexCoords[i]);
    }

    if(colorIdx == -1)
        for(var i = 0; i < 4; i++)
            colorBuffer.push(generalCubeVertexColors[a]);
    else
        for(var i = 0; i < 4; i++)
            colorBuffer.push(generalCubeVertexColors[colorIdx]);
}