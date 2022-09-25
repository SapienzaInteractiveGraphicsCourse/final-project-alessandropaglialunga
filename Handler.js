"use strict";

class Handler{
	constructor(game){
		this.game = game;
	}
}

Handler.prototype.buttons = function(){
	var game = this.game;
	for(var i = 0; i < this.game.buttons.length; i++){
		game.buttons[i].onmouseover = function(){this.style.background = this.parameters.background + ', 1.0)';};
		game.buttons[i].onmouseout = function(){this.style.background = this.parameters.background + this.parameters.opacity};
		if (i < 6){
			game.buttons[i].addEventListener("click", function(event){
				var face = this.parameters.face;
				if(!game.mute){
					game.faceRotationAudio.load();
					game.faceRotationAudio.play();
				}
				game.RubikCubeObj.rotateFace(face, game.velocities[game.currentVelocity]);
				setTimeout(game.win.bind(game), game.waitToCheck[game.currentVelocity]);
				game.addMove();
			});
		}
	}
	game.buttons[6].addEventListener("click", function(event){ //Clockwise button
		if(game.RubikCubeObj.rotationOrientationFlag){
			this.parameters.opacity = ', 1.0)';
			game.buttons[7].parameters.opacity = ', 0.0)';
			game.buttons[7].style.background = game.buttons[7].parameters.background + game.buttons[7].parameters.opacity;
			game.RubikCubeObj.rotationOrientationFlag = false;
			if(!game.mute){
				game.changeDirectionAudio.load();
				game.changeDirectionAudio.play();
			}
		}
	});
	game.buttons[7].addEventListener("click", function(event){ //Counterclockwise button
		if(!game.RubikCubeObj.rotationOrientationFlag){
			this.parameters.opacity = ', 1.0)';
			game.buttons[6].parameters.opacity = ', 0.0)';
			game.buttons[6].style.background = game.buttons[6].parameters.background + game.buttons[6].parameters.opacity;
			game.RubikCubeObj.rotationOrientationFlag = true;
			if(!game.mute){
				game.changeDirectionAudio.load();
				game.changeDirectionAudio.play();
			}
		}
	});
	game.buttons[8].addEventListener("click", function(event){ //Start Button
		game.startGameFlag = true;
		game.buttons[8].hidden = true;
		game.buttons[9].disabled = false;
		game.buttons[10].hidden = true;
		game.buttons[11].hidden = true;
		game.buttons[12].hidden = true;
		for(var i = 0; i < 8; i++){
			game.buttons[i].hidden = false;
			game.buttons[i].style.border = '1px solid rgba(128, 128, 128, 1)';
		}
		for(var i = 13; i < 17; i++){
			game.buttons[i].hidden = false;
			game.buttons[i].style.border = '1px solid rgba(128, 128, 128, 1)';
		}
		game.texts[2].hidden = false;
		game.soundtrack.play();
	});
	game.buttons[9].addEventListener("click", function(event){ //Reset Button
		game.buttons[8].hidden = false;
		game.CameraObj.radius = game.CameraObj.initialRadius;
		game.buttons[9].disabled = true;
		game.buttons[9].style.background = 'rgba(255, 0, 128,0)';
		game.buttons[9].style.border = '1px solid rgba(128, 128, 128, 1)';
		game.buttons[10].hidden = false;
		game.buttons[11].hidden = false;
		game.buttons[12].hidden = false;
		for(var i = 13; i < 17; i++)
			game.buttons[i].hidden = true;
		game.texts[2].hidden = true;
		for(var i = 0; i < 8; i++)
			game.buttons[i].hidden = true;
		for(var i = 0; i < 10; i++)
			game.buttons[i].disabled = false;
		game.timerHours = -1;
		game.timerMinutes = -1;
		game.timerSeconds = -1;
		game.carryOnTimer();
		game.time = 0;
	    game.counterForShuffle = 0;
		game.startGameFlag = false;
	    game.initialPhaseFlag = true;
	    game.verticies = []; game.colors = []; game.normals = [];
	    game.RubikCubeObj = new RubikCube( game.gl, game.program, 0.39, 3, 0.0, game.verticies, game.colors, game.normals, game.textures);
		game.initialPhase();
		game.moves = -1;
		game.addMove();
		game.winAudio.pause();
		game.winAudio.load();
	});
	game.images[0].addEventListener("click", function(event){ //Audio Image
		game.images[0].hidden = true;
		game.images[1].hidden = false;
		game.mute = true;
		game.soundtrack.muted = true;
		game.winAudio.muted = true;
	});
	game.images[1].addEventListener("click", function(event){ //No Audio Image
		game.images[0].hidden = false;
		game.images[1].hidden = true;
		game.mute = false;
		game.soundtrack.muted = false;
		game.winAudio.muted = false;
	});
	game.buttons[10].addEventListener("click", function(event){
		game.buttons[10].parameters.opacity = ', 1.0)';
		game.buttons[10].style.background = game.buttons[10].parameters.background + game.buttons[10].parameters.opacity;
		game.buttons[11].parameters.opacity = ', 0.0)';
		game.buttons[11].style.background = game.buttons[11].parameters.background + game.buttons[11].parameters.opacity;
		game.buttons[12].parameters.opacity = ', 0.0)';
		game.buttons[12].style.background = game.buttons[12].parameters.background + game.buttons[12].parameters.opacity;
		game.currentDifficulty = 0;
	});
	game.buttons[11].addEventListener("click", function(event){
		game.buttons[11].parameters.opacity = ', 1.0)';
		game.buttons[11].style.background = game.buttons[11].parameters.background + game.buttons[11].parameters.opacity;
		game.buttons[10].parameters.opacity = ', 0.0)';
		game.buttons[10].style.background = game.buttons[10].parameters.background + game.buttons[10].parameters.opacity;
		game.buttons[12].parameters.opacity = ', 0.0)';
		game.buttons[12].style.background = game.buttons[12].parameters.background + game.buttons[12].parameters.opacity;
		game.currentDifficulty = 1;
	});
	game.buttons[12].addEventListener("click", function(event){
		game.buttons[12].parameters.opacity = ', 1.0)';
		game.buttons[12].style.background = game.buttons[12].parameters.background + game.buttons[12].parameters.opacity;
		game.buttons[11].parameters.opacity = ', 0.0)';
		game.buttons[11].style.background = game.buttons[11].parameters.background + game.buttons[11].parameters.opacity;
		game.buttons[10].parameters.opacity = ', 0.0)';
		game.buttons[10].style.background = game.buttons[10].parameters.background + game.buttons[10].parameters.opacity;
		game.currentDifficulty = 2;
	});
	game.buttons[13].addEventListener("click", function(event){
		game.buttons[13].parameters.opacity = ', 1.0)';
		game.buttons[13].style.background = game.buttons[13].parameters.background + game.buttons[13].parameters.opacity;
		for(var i = 0; i < 3; i++){
			game.buttons[14+i].parameters.opacity = ', 0.0)';
			game.buttons[14+i].style.background = game.buttons[14+i].parameters.background + game.buttons[14+i].parameters.opacity;
		}
		game.currentVelocity = 0;
	});
	game.buttons[14].addEventListener("click", function(event){
		game.buttons[14].parameters.opacity = ', 1.0)';
		game.buttons[14].style.background = game.buttons[14].parameters.background + game.buttons[14].parameters.opacity;
		for(var i = 0; i < 4; i++){
			if(13+i == 14) continue; 
			game.buttons[13+i].parameters.opacity = ', 0.0)';
			game.buttons[13+i].style.background = game.buttons[13+i].parameters.background + game.buttons[13+i].parameters.opacity;
		}
		game.currentVelocity = 1;
	});
	game.buttons[15].addEventListener("click", function(event){
		game.buttons[15].parameters.opacity = ', 1.0)';
		game.buttons[15].style.background = game.buttons[15].parameters.background + game.buttons[15].parameters.opacity;
		for(var i = 0; i < 4; i++){
			if(13+i == 15) continue; 
			game.buttons[13+i].parameters.opacity = ', 0.0)';
			game.buttons[13+i].style.background = game.buttons[13+i].parameters.background + game.buttons[13+i].parameters.opacity;
		}
		game.currentVelocity = 2;
	});
	game.buttons[16].addEventListener("click", function(event){
		game.buttons[16].parameters.opacity = ', 1.0)';
		game.buttons[16].style.background = game.buttons[16].parameters.background + game.buttons[16].parameters.opacity;
		for(var i = 0; i < 3; i++){
			game.buttons[13+i].parameters.opacity = ', 0.0)';
			game.buttons[13+i].style.background = game.buttons[13+i].parameters.background + game.buttons[13+i].parameters.opacity;
		}
		game.currentVelocity = 3;
	});
}