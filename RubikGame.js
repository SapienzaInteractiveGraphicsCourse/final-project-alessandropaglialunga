"use strict";

window.onload = function init(){
	var canvas = document.getElementById("gl-canvas");
	var gl = canvas.getContext("webgl2");
	if(!gl){alert("WebGL context is not available!");}
	var width = document.documentElement.scrollWidth;
	var height = document.documentElement.scrollHeight;
	document.body.style.height = height + 'px';
    var rubikGameObject = new RubikGame(canvas, gl, width, height);
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
	    this.RubikCubeObj = new RubikCube( this.gl, this.program, 0.39, 3, 0.0, this.verticies, this.colors);
	    this.CameraObj = new Camera( this.gl, this.program, this.aspect );
	    this.CameraObj.handler(this);
	    /*this.setButtons();
	    this.setTexts();
	    this.setImages();
	    this.setAudio();*/
	    this.moves = 0;
	    this.mute = false;
	    /*this.HandlerObj = new Handler(this);
	    this.HandlerObj.buttons();*/
	    //this.BackgroundObj = new Background(this.gl, this.program, this.canvas.width, this.canvas.height, this.verticies, this.colors);

	   	this.startGameFlag = false;
	    this.initialPhaseFlag = true;
	    this.time = 0;
	    this.counterForShuffle = 0;
	    this.intervalForShuffle;
	    this.timerHours = 0;
	    this.timerMinutes = 0;
	    this.timerSeconds = 0;
	    this.intervalForTimer;
	    this.FireworkObj = [];
	    this.intervalForFireworks = 0;
	    this.initialAngle;
	    this.initialPhase();
	    this.render();
	}
}

RubikGame.prototype.setButtons = function(){
	this.buttons = [];
	var buttonHeight = this.canvas.height/6;
	var buttonWidth = this.canvas.width/8;
	var ids = ["rotateBackFaceButton","rotateFrontFaceButton","rotateBottomFaceButton","rotateTopFaceButton","rotateLeftFaceButton","rotateRightFaceButton", "rotateClockwiseButton", "rotateCounterclockwiseButton", "startButton", "resetButton"];
	var heights = [buttonHeight,buttonHeight,buttonHeight,buttonHeight,buttonHeight,buttonHeight,buttonHeight/2,buttonHeight/2,buttonHeight/2, buttonHeight/2];
	var widths = [buttonWidth,buttonWidth,buttonWidth,buttonWidth,buttonWidth,buttonWidth,buttonWidth*2,buttonWidth*2,buttonWidth*2,buttonWidth*2];
	var texts = ["BACK","FRONT","BOTTOM","TOP","LEFT","RIGHT","CLOCKWISE","COUNTERCLOCKWISE","START", "RESET"];
	var opacities = [', 0.0)',', 0.0)',', 0.0)',', 0.0)',', 0.0)',', 0.0)',', 1.0)',', 0.0)',', 0.0)',', 0.0)'];
	var backgrounds = ['rgba(0, 0, 255','rgba(255, 0, 0','rgba(0, 255, 0','rgba(0, 255, 255','rgba(255, 0, 255','rgba(255, 255, 0', 'rgba(255, 255, 255', 'rgba(255, 255, 255', 'rgba(128, 0, 255', 'rgba(255, 0, 128'];
	var borders = ['10px solid rgba(0, 0, 255, 1)','10px solid rgba(255, 0, 0, 1)','10px solid rgba(0, 255, 0, 1)','10px solid rgba(0, 255, 255, 1)','10px solid rgba(255, 0, 255, 1)','10px solid rgba(255, 255, 0, 1)', '5px solid rgba(255, 255, 255, 1)', '5px solid rgba(255, 255, 255, 1)', '5px solid rgba(128, 0, 255, 1)', '5px solid rgba(255, 0, 128, 1)'];
	var topMargins = [this.canvas.height-heights[0]-this.canvas.height/10,this.canvas.height-heights[0]-this.canvas.height/10,this.canvas.height-heights[0]-this.canvas.height/10,this.canvas.height-heights[0]-this.canvas.height/10,this.canvas.height-heights[0]-this.canvas.height/10,this.canvas.height-heights[0]-this.canvas.height/10,this.canvas.height/5-heights[6]/2,this.canvas.height/5-heights[7]/2, this.canvas.height/4-heights[8]/2, this.canvas.height-heights[9]*2 ];
	var leftMargins = [this.canvas.width/2-3*widths[0],this.canvas.width/2-2*widths[0],this.canvas.width/2-widths[0],this.canvas.width/2,this.canvas.width/2+widths[0],this.canvas.width/2+2*widths[0], this.canvas.width/2-widths[7], this.canvas.width/2, /*this.canvas.width/2-widths[8]/2*/ 0.0, this.canvas.width/2-widths[8]/2];

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
	var ids = ["timerText", "numberOfMovesText"];
	var heights = [textHeight, textHeight];
	var widths = [textWidth, textWidth];
	var opacities = [', 0.0)', ', 0.0)'];
	var backgrounds = ['rgba(255, 255, 255', 'rgba(255, 255, 255'];
	var borders = ['3px solid rgba(255, 0, 0, 1)', '3px solid rgba(255, 0, 0, 1)'];
	var topMargins = [this.canvas.height/100, this.canvas.height/100];
	var leftMargins = [this.canvas.width/2 - widths[0] - 5, 5 + this.canvas.width/2];
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
    this.soundtrack.volume = 0.0; //0.1;
    this.soundtrack.loop = true;
    this.winAudio = document.getElementById("winAudio");
    this.winAudio.volume = 1;
}

RubikGame.prototype.render = function () {
	this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	this.CameraObj.setModelViewAndProjection();
	//this.BackgroundObj.render();
	this.gl.uniformMatrix4fv(this.CameraObj.projectionMatrixLoc, false, flatten(this.CameraObj.projectionMatrix));
	this.RubikCubeObj.render(this.CameraObj.modelViewMatrix, this.CameraObj.modelViewMatrixLoc);
	requestAnimationFrame(this.render.bind(this));
}

RubikGame.prototype.initialPhase = function(){
	if(!this.startGameFlag){
		//this.CameraObj.anglePlaneXZ = (90 + this.time)*(Math.PI/180);
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
	if(this.counterForShuffle == 1){
		clearInterval(this.intervalForShuffle);
		for(var i = 0; i < 8; i++)
			this.buttons[i].style.border = this.buttons[i].parameters.border;
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
		for(var i = 0; i < 8; i++)
			this.buttons[i].hidden = true;
		this.time = 0;
		this.buttons[9].hidden = false;
		//this.initialAngle = this.CameraObj.anglePlaneXZ*180/Math.PI;
		//this.intervalForFireworks = setInterval(this.fireworks.bind(this), 10);
	}
}

/*RubikGame.prototype.fireworks = function(){
	this.CameraObj.anglePlaneXZ = (this.initialAngle + this.time)*(Math.PI/180);
	this.time += 1;
	this.FireworkObj.push(new Firework());
	for(var i = 0; i < this.FireworkObj; i++)
		this.FireworkObj[i].move(this.time);
}*/