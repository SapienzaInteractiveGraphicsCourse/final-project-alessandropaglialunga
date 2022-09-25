"use strict";

class RubikCube {
	constructor(gl, program, subcubeLength, numSubcubesPerLine, offsetBtwSubcubes, verticies, colors){
		this.gl = gl;
		this.program = program;
		this.subcubeLength = subcubeLength;
		this.offsetBtwSubcubes = offsetBtwSubcubes;
		this.numFace = 6;
		this.numSubcubesPerLine = numSubcubesPerLine;
		this.subcubes = [];
		this.groundTruth = [];
		this.rotationOrientationFlag = false; //false for clockwise rotation; true for counterclockwise rotation
		this.initilizeMatrices();
		this.subcubeVerticies = verticies;
		this.subcubeVertexColors = colors;
		this.loadWebGLBuffer();
		this.rotationAxisPerFace = [vec3(0,0,1), vec3(0,1,0), vec3(1,0,0)];
	}
}

RubikCube.prototype.initilizeMatrices = function(){
	var counter = 0;
	this.cubeLength = (this.subcubeLength + this.offsetBtwSubcubes) * (this.numSubcubesPerLine-1) + this.subcubeLength;
	var distanceBtw2SubcubesCenter = this.subcubeLength + this.offsetBtwSubcubes;
	for(var zId = 0; zId < this.numSubcubesPerLine; zId++)
		for(var yId = 0; yId < this.numSubcubesPerLine; yId++)
			for(var xId = 0; xId < this.numSubcubesPerLine; xId++){
				var xPos = Math.round((xId*distanceBtw2SubcubesCenter - (this.cubeLength - this.subcubeLength)/2)*100)/100;
				var yPos = Math.round((yId*distanceBtw2SubcubesCenter - (this.cubeLength - this.subcubeLength)/2)*100)/100;
				var zPos = Math.round((zId*distanceBtw2SubcubesCenter - (this.cubeLength - this.subcubeLength)/2)*100)/100;
				if (xId == 0 || xId == this.numSubcubesPerLine-1 || yId == 0 || yId == this.numSubcubesPerLine-1
				|| zId == 0 || zId == this.numSubcubesPerLine-1){
					var indicesOfVisibleFaces = this.visibleFace(xPos, yPos, zPos);
					this.subcubes.push(new Subcube( this.gl, this.program, xPos, yPos, zPos, this.subcubeLength, indicesOfVisibleFaces, counter));
					this.groundTruth.push([xPos, yPos, zPos]);
					counter += 1 + indicesOfVisibleFaces.length;
				}
			}
}

RubikCube.prototype.visibleFace = function(xId, yId, zId){
	var X_negativeBorder = (xId <= -(this.cubeLength - this.subcubeLength)/2)                          ? true : false;
	var X_positiveBorder = (xId >=  (this.cubeLength - this.subcubeLength)/2 - this.offsetBtwSubcubes) ? true : false;
	var Y_negativeBorder = (yId <= -(this.cubeLength - this.subcubeLength)/2)                          ? true : false;
	var Y_positiveBorder = (yId >=  (this.cubeLength - this.subcubeLength)/2 - this.offsetBtwSubcubes) ? true : false;
	var Z_negativeBorder = (zId <= -(this.cubeLength - this.subcubeLength)/2)                          ? true : false;
	var Z_positiveBorder = (zId >=  (this.cubeLength - this.subcubeLength)/2 - this.offsetBtwSubcubes) ? true : false;
	var indicesOfVisibleFaces = [];
	if (X_negativeBorder) //LEFT
		indicesOfVisibleFaces.push(5);
	if (X_positiveBorder) //RIGHT
		indicesOfVisibleFaces.push(1);
	if (Y_negativeBorder) //BOTTOM
		indicesOfVisibleFaces.push(2);
	if (Y_positiveBorder) //TOP
		indicesOfVisibleFaces.push(3);
	if (Z_negativeBorder) //BACK
		indicesOfVisibleFaces.push(4);
	if (Z_positiveBorder) //FRONT
		indicesOfVisibleFaces.push(0);
	return indicesOfVisibleFaces;
}

RubikCube.prototype.loadWebGLBuffer = function(){
	this.loadVerticesInformations();
	var subcubeVerticiesBuffer = this.gl.createBuffer();
    this.gl.bindBuffer( this.gl.ARRAY_BUFFER, subcubeVerticiesBuffer );
    this.gl.bufferData( this.gl.ARRAY_BUFFER, flatten(this.subcubeVerticies), this.gl.STATIC_DRAW);
    var positionLoc = this.gl.getAttribLocation( this.program, "aPosition" );
    this.gl.vertexAttribPointer( positionLoc, 4, this.gl.FLOAT, false, 0, 0 );
    this.gl.enableVertexAttribArray( positionLoc );
    

    var subcubeVertexColorsBuffer = this.gl.createBuffer();
    this.gl.bindBuffer( this.gl.ARRAY_BUFFER, subcubeVertexColorsBuffer );
    this.gl.bufferData( this.gl.ARRAY_BUFFER, flatten(this.subcubeVertexColors), this.gl.STATIC_DRAW );
    var colorLoc = this.gl.getAttribLocation(this.program, "aColor");
    this.gl.vertexAttribPointer(colorLoc, 4, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(colorLoc);
}

RubikCube.prototype.loadVerticesInformations = function(){
	for(var i = 0; i < this.subcubes.length; i++)
		this.subcubes[i].loadVerticesInformations(this.subcubeVerticies, this.subcubeVertexColors);
}

RubikCube.prototype.rotateFace = function(face, angleStep){
	var subcubesOfTargetFace = this.findSubecubesOfTargetFace(face);
    var rotationAxis = this.rotationAxisPerFace[Math.floor(face/2)]; 
    var rotationDirection = (this.rotationOrientationFlag) ? 1 : -1;
    if(face % 2 == 1)
    	rotationDirection *= -1;
    for(var i = 0; i < subcubesOfTargetFace.length; i++)
		subcubesOfTargetFace[i].rotate(face, rotationAxis, rotationDirection, angleStep);
}

RubikCube.prototype.findSubecubesOfTargetFace = function(face){
	var xPos = 100, yPos = 100, zPos = 100;
	var offset = Math.round((this.cubeLength - this.subcubeLength)*100/2)/100;
	switch(face){
		case 0: zPos = -offset;
				break;
		case 1: zPos = offset;
				break;
		case 2: yPos = -offset;
				break;
		case 3: yPos = offset;
				break;
		case 4: xPos = -offset;
				break;
		case 5: xPos = offset;
				break;
	}
	var subcubesOfTargetFace = [];
	for(var i = 0; i < this.subcubes.length; i++)
		if(this.subcubes[i].transform[0][3] >= xPos-0.05 && this.subcubes[i].transform[0][3] <= xPos+0.05)
			subcubesOfTargetFace.push(this.subcubes[i]);
		else if(this.subcubes[i].transform[1][3] >= yPos-0.05 && this.subcubes[i].transform[1][3] <= yPos+0.05)
			subcubesOfTargetFace.push(this.subcubes[i]);
		else if(this.subcubes[i].transform[2][3] >= zPos-0.05 && this.subcubes[i].transform[2][3] <= zPos+0.05)
			subcubesOfTargetFace.push(this.subcubes[i]);

	return subcubesOfTargetFace;
}

RubikCube.prototype.render = function(modelViewMatrix, modelViewMatrixLoc){
	for(var i = 0; i < this.subcubes.length; i++)
		this.subcubes[i].render(modelViewMatrix, modelViewMatrixLoc);
}