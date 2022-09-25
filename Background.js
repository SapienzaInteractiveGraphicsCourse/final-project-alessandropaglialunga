"use strict";

class Background {
	constructor(gl, program, canvasWidth, canvasHeight, verticies, colors){
		this.gl = gl;
		this.program = program;
		this.modelViewMatrixLoc = this.gl.getUniformLocation( this.program, "uModelViewMatrix" );
    	this.projectionMatrixLoc = this.gl.getUniformLocation( this.program, "uProjectionMatrix" );
		this.canvasWidth = canvasWidth;
		this.canvasHeight = canvasHeight;
		this.lengthRatio = 0.1;
		this.sectorLength = this.canvasWidth*this.lengthRatio/2;
		this.numberOfSectorAlong_X = 10;//Math.round(this.canvasWidth/this.sectorLength);
		this.heightRatio = 0.1;
		this.sectorHeight = this.canvasHeight*this.heightRatio/2
		this.numberOfSectorAlong_Y = 10;//Math.round(this.canvasHeight/this.sectorHeight);
		this.sectors = [];
		this.initilizeSectors();
		this.sectorVerticies = verticies;
		this.sectorVertexColors = colors;
		this.loadWebGLBuffer();
		this.loadProjectionAndModelViewMatrix();
	}
}

Background.prototype.loadProjectionAndModelViewMatrix = function(){
	var near = 10;
	var far = -10;
	var radius = 1.0;
	var theta = 0.0;
	var phi = 0.0;
	var left = -1.0;
	var right = 1.0;
	var topy = 1.0;
	var bottom = -1.0;
	const at = vec3(0.0, 0.0, 0.0);
	const up = vec3(0.0, 1.0, 0.0);
	const eye = vec3(0, 1, 1);
	this.modelViewMatrix = lookAt(eye, at , up);
	this.projectionMatrix = ortho(left, right, bottom, topy, near, far);
}

Background.prototype.initilizeSectors = function(){
	for(var i = 0; i < this.numberOfSectorAlong_X; i++)
		for(var j = 0; j < this.numberOfSectorAlong_Y; j++){
			var x = -1 + this.lengthRatio/2 + this.lengthRatio*i;
			var y = -1 + this.lengthRatio/2 + this.heightRatio*j;
			var colorIdx;
			if (Math.floor(Math.random()*100)/100 <= 0.49)
				colorIdx = 0;
			else
				colorIdx = Math.floor(Math.random()*6) + 1;
			var transform = translate(x, y, -1);
			transform = mult(transform, scale(this.lengthRatio, this.heightRatio, this.lengthRatio))
			this.sectors.push({y: x, x: y, colorIdx: colorIdx, transform: transform});
		}
}

Background.prototype.loadWebGLBuffer = function(){
	this.loadVerticesInformations();
	var subcubeVerticiesBuffer = this.gl.createBuffer();
    this.gl.bindBuffer( this.gl.ARRAY_BUFFER, subcubeVerticiesBuffer );
    this.gl.bufferData( this.gl.ARRAY_BUFFER, flatten(this.sectorVerticies), this.gl.STATIC_DRAW);
    var positionLoc = this.gl.getAttribLocation( this.program, "aPosition" );
    this.gl.vertexAttribPointer( positionLoc, 4, this.gl.FLOAT, false, 0, 0 );
    this.gl.enableVertexAttribArray( positionLoc );
    

    var subcubeVertexColorsBuffer = this.gl.createBuffer();
    this.gl.bindBuffer( this.gl.ARRAY_BUFFER, subcubeVertexColorsBuffer );
    this.gl.bufferData( this.gl.ARRAY_BUFFER, flatten(this.sectorVertexColors), this.gl.STATIC_DRAW );
    var colorLoc = this.gl.getAttribLocation(this.program, "aColor");
    this.gl.vertexAttribPointer(colorLoc, 4, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(colorLoc);
}

Background.prototype.loadVerticesInformations = function(){
	var vertexIndices = Array();
    vertexIndices[0] = [1, 0, 3, 2]; //FRONT
    vertexIndices[1] = [2, 3, 7, 6]; //LEFT
    vertexIndices[2] = [3, 0, 4, 7]; //BOTTOM
    vertexIndices[3] = [6, 5, 1, 2]; //TOP
    vertexIndices[4] = [4, 5, 6, 7]; //BACK
    vertexIndices[5] = [5, 4, 0, 1]; //RIGHT
    for(var k = 0; k < this.numberOfSectorAlong_X; k++)
		for(var j = 0; j < this.numberOfSectorAlong_Y; j++)
		    for(var i = 0; i < 6; i++)
		    	quad(vertexIndices[i][0], vertexIndices[i][1], vertexIndices[i][2], vertexIndices[i][3], this.sectorVerticies, this.sectorVertexColors, this.sectors[k*this.numberOfSectorAlong_Y+j].colorIdx);
}

Background.prototype.render = function(){
	this.gl.uniformMatrix4fv(this.modelViewMatrixLoc, false, flatten(this.modelViewMatrix));
    //this.gl.uniformMatrix4fv(this.projectionMatrixLoc, false, flatten(this.projectionMatrix));
	for(var k = 0; k < this.numberOfSectorAlong_X; k++)
		for(var j = 0; j < this.numberOfSectorAlong_Y; j++){
			this.gl.uniformMatrix4fv(this.modelViewMatrixLoc, false, flatten(this.sectors[k*this.numberOfSectorAlong_Y+j].transform));
			for(var i = 0; i < 6; i++)
				this.gl.drawArrays(this.gl.TRIANGLE_FAN, 6*9*6 + (k*this.numberOfSectorAlong_Y + j)*24 + 4*i, 4);
		}
}
