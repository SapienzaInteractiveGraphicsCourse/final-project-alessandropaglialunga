"use strict";

window.onload = function init(){
	var canvas = document.getElementById("gl-canvas");
	var gl = canvas.getContext("webgl2");
	if(!gl){alert("WebGL context is not available!");}
	var width = document.documentElement.scrollWidth;
	var height = document.documentElement.scrollHeight;
	document.body.style.height = height + 'px';
    var rubikGameObject = new RubikGame(canvas, gl, width, height);
    setTimeout(showHTMLElement(), 1000);
}

function showHTMLElement(){
	document.getElementById("startButton").hidden = false;
    document.getElementById("easyButton").hidden = false;
    document.getElementById("mediumButton").hidden = false;
    document.getElementById("hardButton").hidden = false;
    document.getElementById("audioIcon").hidden = false; 
    document.getElementById("resetButton").hidden = false;
	document.getElementById("timerText").hidden = false;
	document.getElementById("numberOfMovesText").hidden = false;
}

class RubikGame {
	constructor(canvas, gl, width, height) {
		this.canvas = canvas;
		this.gl = gl;
		this.canvas.width = width;
		this.canvas.height = height;
		this.aspect = this.canvas.width/this.canvas.height;
	    this.gl.viewport( 0, 0, this.canvas.width, this.canvas.height );
	    this.gl.enable( this.gl.DEPTH_TEST );
	    this.program = initShaders(gl, "vertex-shader", "fragment-shader");
    	this.gl.useProgram( this.program );
    	this.verticies = [];
    	this.colors = [];
    	this.normals = [];
    	this.textures = [];
	    this.RubikCubeObj = new RubikCube( this.gl, this.program, 0.39, 3, 0.0, this.verticies, this.colors, this.normals, this.textures);
	    this.CameraObj = new Camera( this.gl, this.program, this.aspect );
	    this.CameraObj.handler(this);
	    this.setButtons();
	    this.setTexts();
	    this.setImages();
	    this.setAudio();
	    this.velocities = [5, 10, 15, 90];
	    this.currentVelocity=1;
	    this.difficulties = [5,7,12];
	    this.currentDifficulty = 0;
	    this.waitToCheck = [400, 350, 300, 250];
	    this.moves = 0;
	    this.mute = false;
	    this.HandlerObj = new Handler(this);
	    this.HandlerObj.buttons();

	   	this.startGameFlag = false;
	    this.initialPhaseFlag = true;
	    this.time = 0;
	    this.counterForShuffle = 0;
	    this.intervalForShuffle;
	    this.timerHours = 0;
	    this.timerMinutes = 0;
	    this.timerSeconds = 0;
	    this.intervalForTimer;
	    this.initialAngle;
	    this.initialPhase();
	    this.render();
	    this.setLighting();
	}
}

RubikGame.prototype.setButtons = function(){
	this.buttons = [];
	var buttonHeight = this.canvas.height/6;
	var buttonWidth = this.canvas.width/8;
	var ids = ["rotateBackFaceButton","rotateFrontFaceButton","rotateBottomFaceButton","rotateTopFaceButton","rotateLeftFaceButton","rotateRightFaceButton", "rotateClockwiseButton", "rotateCounterclockwiseButton", "startButton", "resetButton", "easyButton", "mediumButton", "hardButton","slowSpeedButton", "moderateSpeedButton", "fastSpeedButton", "veryFastSpeedButton"];
	var heights = [buttonHeight,buttonHeight,buttonHeight,buttonHeight,buttonHeight,buttonHeight,buttonHeight/2,buttonHeight/2,buttonHeight/2, buttonHeight/2, buttonHeight, buttonHeight, buttonHeight, buttonHeight/2, buttonHeight/2, buttonHeight/2, buttonHeight/2];
	var widths = [buttonWidth,buttonWidth,buttonWidth,buttonWidth,buttonWidth,buttonWidth,buttonWidth*2,buttonWidth*2,buttonWidth*2,buttonWidth*2, buttonHeight, buttonHeight, buttonHeight, buttonHeight, buttonHeight, buttonHeight, buttonHeight];
	var texts = ["BACK","FRONT","BOTTOM","TOP","LEFT","RIGHT","CLOCKWISE","COUNTERCLOCKWISE","START", "RESET", "EASY", "MEDIUM", "HARD", "SLOW", "MODERATE", "FAST", "VERY FAST"];
	var opacities = [', 0.0)',', 0.0)',', 0.0)',', 0.0)',', 0.0)',', 0.0)',', 1.0)',', 0.0)',', 0.0)',', 0.0)',', 1.0)',', 0.0)',', 0.0)', ', 0.0)', ', 1.0)',', 0.0)' ,', 0.0)'];
	var backgrounds = ['rgba(0, 0, 255','rgba(255, 0, 0','rgba(0, 255, 0','rgba(0, 255, 255','rgba(255, 0, 255','rgba(255, 255, 0', 'rgba(255, 255, 255', 'rgba(255, 255, 255', 'rgba(128, 0, 255', 'rgba(255, 0, 128', 'rgba(0, 225, 0','rgba(225, 225, 0','rgba(225, 0, 0', 'rgba(225, 255, 0', 'rgba(225, 127, 0', 'rgba(225, 64, 0', 'rgba(225, 32, 0'];
	var borders = ['5px solid rgba(0, 0, 255, 1)','5px solid rgba(255, 0, 0, 1)','5px solid rgba(0, 255, 0, 1)','5px solid rgba(0, 255, 255, 1)','5px solid rgba(255, 0, 255, 1)','5px solid rgba(255, 255, 0, 1)', '5px solid rgba(255, 255, 255, 1)', '5px solid rgba(255, 255, 255, 1)', '5px solid rgba(128, 0, 255, 1)', '1px solid rgba(128, 128, 128, 1)', '5px solid rgba(0, 125, 0, 1)','5px solid rgba(125, 125, 0, 1)','5px solid rgba(125, 0, 0, 1)', '5px solid rgba(255, 255, 0, 1)', '5px solid rgba(255, 127, 0, 1)', '5px solid rgba(255, 64, 0, 1)', '5px solid rgba(255, 32, 0, 1)'];
	var topMargins = [this.canvas.height-heights[0]-this.canvas.height/20,this.canvas.height-heights[0]-this.canvas.height/20,this.canvas.height-heights[0]-this.canvas.height/20,this.canvas.height-heights[0]-this.canvas.height/20,this.canvas.height-heights[0]-this.canvas.height/20,this.canvas.height-heights[0]-this.canvas.height/20,this.canvas.height/5-heights[6]/2,this.canvas.height/5-heights[7]/2, this.canvas.height-heights[0]-this.canvas.height/20, this.canvas.height/2-heights[9]/2, this.canvas.height/4-heights[10]/2, this.canvas.height/4-heights[11]/2, this.canvas.height/4-heights[12]/2, this.canvas.height/2-heights[13], this.canvas.height/2-heights[13], this.canvas.height/2, this.canvas.height/2];
	var leftMargins = [this.canvas.width/2-3*widths[0],this.canvas.width/2-2*widths[0],this.canvas.width/2-widths[0],this.canvas.width/2,this.canvas.width/2+widths[0],this.canvas.width/2+2*widths[0], this.canvas.width/2-widths[7], this.canvas.width/2, this.canvas.width/2-widths[8]/2, this.canvas.width-widths[8] - this.canvas.width/20, this.canvas.width/2-widths[11]/2-widths[11]*2, this.canvas.width/2-widths[11]/2, this.canvas.width/2-widths[11]/2+widths[11]*2,this.canvas.width/40,this.canvas.width/40+widths[14],this.canvas.width/40, this.canvas.width/40+widths[16]];

	for(var i = 0; i < ids.length; i++){
		this.buttons[i] = document.getElementById(ids[i]);
		this.buttons[i].value = texts[i];
		this.buttons[i].style.height = heights[i] + 'px';
		this.buttons[i].style.width = widths[i] + 'px';
		this.buttons[i].style.background = backgrounds[i] + opacities[i];
		this.buttons[i].style.border = borders[i];
		this.buttons[i].style.top = topMargins[i] + 'px';
		this.buttons[i].style.left = leftMargins[i] + 'px';
		this.buttons[i].parameters = {text: texts[i], face: i, height:heights[i], width:widths[i], background:backgrounds[i], border:borders[i], top:topMargins[i], left:leftMargins[i], opacity: opacities[i]};
	}
}

RubikGame.prototype.setTexts = function(){
	this.texts = [];
	var textHeight = this.canvas.height/10;
	var textWidth = this.canvas.width/3;
	var ids = ["timerText", "numberOfMovesText", "speedText"];
	var heights = [textHeight, textHeight, textHeight/3];
	var widths = [textWidth, textWidth, textWidth/2.5];
	var opacities = [', 0.0)', ', 0.0)',', 0.0)'];
	var backgrounds = ['rgba(255, 255, 255', 'rgba(255, 255, 255', 'rgba(255, 255, 255'];
	var borders = ['3px solid rgba(255, 0, 0, 1)', '3px solid rgba(255, 0, 0, 1)', '3px solid rgba(255, 0, 0, 1)'];
	var topMargins = [this.canvas.height/100, this.canvas.height/100, this.canvas.height/2 - heights[2]/2 - this.canvas.height/8];
	var leftMargins = [this.canvas.width/2 - widths[0] - 5, 5 + this.canvas.width/2, this.canvas.height/6+this.canvas.width/40-widths[2]/2];
	for(var i = 0; i < ids.length; i++){
		this.texts[i] = document.getElementById(ids[i]);
		this.texts[i].style.height = heights[i] + 'px';
		this.texts[i].style.width = widths[i] + 'px';
		this.texts[i].style.background = backgrounds[i] + opacities[i];
		this.buttons[i].style.border = borders[i];
		this.texts[i].style.top = topMargins[i] + 'px';
		this.texts[i].style.left = leftMargins[i] + 'px';
	}
}

RubikGame.prototype.setImages = function(){
	this.images = [];
	var imageHeight = this.canvas.height/10;
	var imageWidth = imageHeight;
	var ids = ["audioIcon", "noAudioIcon"];
	var heights = [imageHeight, imageHeight];
	var widths = [imageWidth, imageWidth];
	var topMargins = [this.canvas.height/100, this.canvas.height/100];
	var leftMargins = [this.canvas.width - widths[0]*3/2, this.canvas.width - widths[0]*3/2];
	for(var i = 0; i < ids.length; i++){
		this.images[i] = document.getElementById(ids[i]);
		this.images[i].style.height = heights[i] + 'px';
		this.images[i].style.width = widths[i] + 'px';
		this.images[i].style.top = topMargins[i] + 'px';
		this.images[i].style.left = leftMargins[i] + 'px';
	}
}

RubikGame.prototype.setAudio = function(){
	this.faceRotationAudio = document.getElementById("faceRotationAudio");
	this.faceRotationAudio.volume = 1;
    this.changeDirectionAudio = document.getElementById("changeDirectionAudio");
    this.changeDirectionAudio.volume = 0.5;
    this.soundtrack = document.getElementById("soundtrack");
    this.soundtrack.volume = 0.1;
    this.soundtrack.loop = true;
    this.winAudio = document.getElementById("winAudio");
    this.winAudio.volume = 1;
}

RubikGame.prototype.setLighting = function(){
	var openingAngleLoc;
	var openingAngle = 90; 
	var lightDirectionLoc;
	var lightDirection = vec4(0.0, -1.0, 0.0, 0.0);
	var lightAttenuationLoc;
	var lightAttenuation = 10.00;
	this.lightPosition = vec4(0.0, -2.0, 0.0, 1.0);
	var lightAmbient = vec4(1.0, 1.0, 1.0, 1.0);
	var lightDiffuse = vec4(.9, .9, .9, 1.0);
	var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);
    this.lightPositionLoc = this.gl.getUniformLocation(this.program, "uLightPosition");
    var lightAttenuationLoc = this.gl.getUniformLocation(this.program, "uLightAttenuation");
    var lightDirectionLoc = this.gl.getUniformLocation(this.program, "uLightDirection");
    var openingAngleLoc = this.gl.getUniformLocation(this.program, "uCosOfOpeningAngle");
    var materialAmbient = vec4(.9, .9, .9, 1.0);
	var materialDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
	var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
	var materialShininess = 80;
    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);
    this.gl.uniform4fv(this.gl.getUniformLocation(this.program, "uAmbientProduct"), ambientProduct);
    this.gl.uniform4fv(this.gl.getUniformLocation(this.program, "uDiffuseProduct"), diffuseProduct);
    this.gl.uniform4fv(this.gl.getUniformLocation(this.program, "uSpecularProduct"), specularProduct);
    this.gl.uniform1f(this.gl.getUniformLocation(this.program, "uShininess"), materialShininess);
    this.gl.uniform4fv(this.lightPositionLoc, this.lightPosition);
    this.gl.uniform4fv(lightDirectionLoc, lightDirection);
    this.gl.uniform1f(lightAttenuationLoc, lightAttenuation);
    this.gl.uniform1f(openingAngleLoc, Math.cos(openingAngle));
}

RubikGame.prototype.render = function () {
	this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	this.CameraObj.setModelViewAndProjection();
	this.lightPosition = this.CameraObj.eye4;
	this.gl.uniform4fv(this.lightPositionLoc, this.lightPosition);
	this.gl.uniformMatrix4fv(this.CameraObj.projectionMatrixLoc, false, flatten(this.CameraObj.projectionMatrix));
	this.RubikCubeObj.render(this.CameraObj.modelViewMatrix, this.CameraObj.modelViewMatrixLoc);
	requestAnimationFrame(this.render.bind(this));
}

RubikGame.prototype.initialPhase = function(){
	if(!this.startGameFlag){
		this.CameraObj.anglePlaneXZ = (90 + this.time)*(Math.PI/180);
	}else{
		this.CameraObj.radius -= 0.1;
		this.CameraObj.anglePlaneXZ = (90 + this.time)*(Math.PI/180);
		if(this.CameraObj.radius <= this.CameraObj.finalRadius){
			this.intervalForShuffle = setInterval(this.shuffle.bind(this), 200);
			this.initialPhaseFlag = false;
		}
	}
	this.time = (this.time + 1) % 360;
	if(this.initialPhaseFlag)
		requestAnimationFrame(this.initialPhase.bind(this));
	else
		return;
}

RubikGame.prototype.shuffle = function(){
	var randomFace = Math.floor(Math.random()*6);
	this.RubikCubeObj.rotateFace(randomFace, 15);
	if(!this.mute){
		document.getElementById("faceRotationAudio").load();
		document.getElementById("faceRotationAudio").play();
	}
	this.counterForShuffle += 1;
	if(this.counterForShuffle == this.difficulties[this.currentDifficulty]){
		clearInterval(this.intervalForShuffle);
		for(var i = 0; i < 17; i++)
			this.buttons[i].style.border = this.buttons[i].parameters.border;
		for(var i = 0; i < 10; i++)
			this.buttons[i].disabled = false;
		this.buttons[9].style.border = '5px solid rgba(255, 0, 128, 1)';
		this.carryOnTimer();
		this.intervalForTimer = setInterval(this.carryOnTimer.bind(this), 1000);
	}
}

RubikGame.prototype.carryOnTimer = function(){
	this.timerSeconds = (this.timerSeconds + 1) % 60;
	if(this.timerSeconds == 0){
		this.timerMinutes = (this.timerMinutes + 1) % 60;
		if(this.timerMinutes == 0)
			this.timerHours = (this.timerHours +1) % 24;
	}
	var seconds;
	if(this.timerSeconds < 10)
		seconds = "0 " + this.timerSeconds;
	else{
		var tens = Math.floor(this.timerSeconds/10);
		var units = this.timerSeconds - 10*tens;
		seconds = "" + tens + " " + units
	}
	var minutes;
	if(this.timerMinutes < 10)
		minutes = "0 " + this.timerMinutes;
	else{
		var tens = Math.floor(this.timerMinutes/10);
		var units = this.timerMinutes - 10*tens;
		minutes = "" + tens + " " + units
	}
	var hours;
	if(this.timerHours < 10)
		hours = "0 " + this.timerHours;
	else{
		var tens = Math.floor(this.timerHours/10);
		var units = this.timerHours - 10*tens;
		hours = "" + tens + " " + units
	}
	this.texts[0].value = "T I M E R   " + hours + " : " + minutes + " : " + seconds;
}

RubikGame.prototype.addMove = function(){
	var units, tens, hundreds, thousands;
	this.moves += 1;
	units     = this.moves % 10;
	tens      = Math.floor((this.moves % 100 - units)/10);
	hundreds  = Math.floor((this.moves % 1000 - tens - units)/100);
	thousands = Math.floor((this.moves % 10000 - hundreds - tens - units)/1000);
	this.texts[1].value = "# M O V E S   " + thousands +  " " + hundreds + " " + tens + " " + units;
}

RubikGame.prototype.win = function(){
	var x, y, z, trueX, trueY, trueZ;
	var winFlag = true;
	for(var i = 0; i < this.RubikCubeObj.subcubes.length; i++){
		x = this.RubikCubeObj.subcubes[i].transform[0][3];
		y = this.RubikCubeObj.subcubes[i].transform[1][3];
		z = this.RubikCubeObj.subcubes[i].transform[2][3];
		trueX = this.RubikCubeObj.groundTruth[i][0];
		trueY = this.RubikCubeObj.groundTruth[i][1];
		trueZ = this.RubikCubeObj.groundTruth[i][2];
		if(x >= trueX - 0.01 && x <= trueX + 0.01 && y >= trueY - 0.01 && y <= trueY + 0.01 && z >= trueZ - 0.01 && z <= trueZ + 0.01)
			continue;
		else{
			winFlag = false;
			break;
		}
	}
	if(winFlag){
		this.winAudio.play();
		clearInterval(this.intervalForTimer);
		for(var i = 0; i < 17; i++)
			this.buttons[i].hidden = true;
		this.texts[2].hidden = true;
		this.time = 0;
		this.buttons[9].hidden = false;
	}
}