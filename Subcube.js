"use strict";

class Subcube {
	constructor(gl, program, x, y, z, length, indicesOfVisibleFaces, webglBufferIdx){
        this.webglBufferIdx = webglBufferIdx;
		this.length = length;
		this.gl = gl;
		this.program = program;
		this.numFace = 6;
        this.Xpos = x; this.Ypos = y; this.Zpos = z;
		this.transform = translate(x, y, z);
		this.transform = mult(this.transform, scale(length, length, length));
		this.referenceFrameOrientation = mat4();
		this.indicesOfVisibleFaces = indicesOfVisibleFaces;
		this.animationParameters = {flag: false};
        this.coloredShims = [];
        this.coloredShimLength = this.length - 0.1;
	}
}

Subcube.prototype.loadVerticesInformations = function(vertexBuffer, colorBuffer, normalBuffer, textureBuffer, whiteWoodTexture){
    this.whiteWoodTexture = whiteWoodTexture;
    var vertexIndices = Array();
    vertexIndices[0] = [1, 0, 3, 2]; //FRONT
    vertexIndices[1] = [2, 3, 7, 6]; //LEFT
    vertexIndices[2] = [3, 0, 4, 7]; //BOTTOM
    vertexIndices[3] = [6, 5, 1, 2]; //TOP
    vertexIndices[4] = [4, 5, 6, 7]; //BACK
    vertexIndices[5] = [5, 4, 0, 1]; //RIGHT
    for(var i = 0; i < 6; i++)
        quad(vertexIndices[i][0], vertexIndices[i][1], vertexIndices[i][2], vertexIndices[i][3], vertexBuffer, colorBuffer, normalBuffer, textureBuffer, 0);
    for(var j = 0; j < this.indicesOfVisibleFaces.length; j++){
        var subcubeFaceIdx = this.indicesOfVisibleFaces[j];
        var x = this.Xpos, y = this.Ypos, z = this.Zpos;
        var axis = "X";
        switch(subcubeFaceIdx){
            case 0: z += this.length/2 + coloredShimHeight/2; axis = "Z"; break;
            case 1: x += this.length/2 + coloredShimHeight/2; break;
            case 2: y -= this.length/2 + coloredShimHeight/2; axis = "Y"; break;
            case 3: y += this.length/2 + coloredShimHeight/2; axis = "Y"; break;
            case 4: z -= this.length/2 + coloredShimHeight/2; axis = "Z";break;
            case 5: x -= this.length/2 + coloredShimHeight/2; break;
        }
        this.coloredShims.push(new ColoredShim(this.gl, this.program, x, y, z, this.coloredShimLength, coloredShimHeight, vertexIndices[subcubeFaceIdx][0], axis));
        for(var i = 0; i < 6; i++)
            quad(vertexIndices[i][0], vertexIndices[i][1], vertexIndices[i][2], vertexIndices[i][3], vertexBuffer, colorBuffer, normalBuffer, textureBuffer, vertexIndices[subcubeFaceIdx][0]);
   }
}

Subcube.prototype.rotate = function(face, rotationAxis, rotationDirection, angleStep){
    var currentX = this.transform[0][3];
    var currentY = this.transform[1][3];
    var currentZ = this.transform[2][3];
    var fixedVariable;
    switch(face){
        case 0: 
        case 1: fixedVariable = "Z";
                break;
        case 2: 
        case 3: fixedVariable = "Y";
                break;
        case 4: 
        case 5: fixedVariable = "X";
                break;
    }
    this.animationParameters = 
    {flag: true, time: 0, initialX: currentX, initialY: currentY, initialZ: currentZ, 
     constantVariable: fixedVariable, angleStep: angleStep, finalAngle: 90, 
     rotationAxis: rotationAxis, rotationDirection: rotationDirection};
}

Subcube.prototype.render = function(modelViewMatrix, modelViewMatrixLoc){
    if (this.animationParameters.flag)
        this.animation();
	var instanceMatrix = mult(modelViewMatrix, this.transform);
	this.gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
	for(var j = 0; j < 6; j++)
		this.gl.drawArrays(this.gl.TRIANGLE_FAN,this.webglBufferIdx*24 + 4*j, 4);
    for(var i = 0; i < this.coloredShims.length; i++){
        var instanceMatrix = mult(modelViewMatrix, this.coloredShims[i].transform);
        this.gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
        for(var j = 0; j < 6; j++)
            this.gl.drawArrays(this.gl.TRIANGLE_FAN, (this.webglBufferIdx+1+i)*24 + 4*j, 4);
    }
}

Subcube.prototype.configureTexture = function(image){
    var texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 512, 512, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
    this.gl.generateMipmap(this.gl.TEXTURE_2D);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST_MIPMAP_LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE );
    this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE );
}

Subcube.prototype.animation = function(){
    var radius, initialAngle;
    var initialX = this.animationParameters.initialX;
    var initialY = this.animationParameters.initialY;
    var initialZ = this.animationParameters.initialZ;
    var angleStep = this.animationParameters.angleStep;
    var time = this.animationParameters.time;
    var rotationDirection = this.animationParameters.rotationDirection;
    var rotationAxis = this.animationParameters.rotationAxis;
    var nextX, nextY, nextZ, nextAngle;
    switch(this.animationParameters.constantVariable){
        case "X": radius = Math.sqrt(initialY*initialY + initialZ*initialZ);
                  initialAngle = Math.atan2(initialY, initialZ);
                  nextAngle = initialAngle + ((time*angleStep)*Math.PI/180) * rotationDirection;
                  nextX = initialX;
                  nextY = radius*Math.sin(nextAngle);
                  nextZ = radius*Math.cos(nextAngle);
                break;
        case "Y": radius = Math.sqrt(initialZ*initialZ + initialX*initialX);
                  initialAngle = Math.atan2(initialZ, initialX);
                  nextAngle = initialAngle + ((time*angleStep)*Math.PI/180) * rotationDirection;
                  nextX = radius*Math.cos(nextAngle);
                  nextY = initialY;
                  nextZ = radius*Math.sin(nextAngle);
                break;
        case "Z": radius = Math.sqrt(initialY*initialY + initialX*initialX);
                  initialAngle = Math.atan2(initialY, initialX);
                  nextAngle = initialAngle + ((time*angleStep)*Math.PI/180) * rotationDirection*-1;
                  nextX = radius*Math.cos(nextAngle);
                  nextY = radius*Math.sin(nextAngle);
                  nextZ = initialZ;
                break;
    }
    if((time*angleStep) == this.animationParameters.finalAngle){
        this.animationParameters.flag = false;
        angleStep = 0;
    }
    this.transform = mult(rotate(angleStep*rotationDirection, rotationAxis), this.transform);
    this.transform[0][3] = nextX;
    this.transform[1][3] = nextY;
    this.transform[2][3] = nextZ;
    for(var i = 0; i < this.coloredShims.length; i++){
        var x = nextX, y = nextY, z = nextZ;
        switch(this.coloredShims[i].colorIdx - 1){
            case 0: z += this.length/2 + coloredShimHeight/2; break;
            case 1: x += this.length/2 + coloredShimHeight/2; break;
            case 2: y -= this.length/2 + coloredShimHeight/2; break;
            case 3: y += this.length/2 + coloredShimHeight/2; break;
            case 4: z -= this.length/2 + coloredShimHeight/2; break;
            case 5: x -= this.length/2 + coloredShimHeight/2; break;
        }
        this.coloredShims[i].transform = mult(rotate(angleStep*rotationDirection, rotationAxis), this.coloredShims[i].transform);
    }
    this.animationParameters.time += 1;
}