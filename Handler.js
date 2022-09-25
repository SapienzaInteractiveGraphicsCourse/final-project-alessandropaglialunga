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
				game.RubikCubeObj.rotateFace(face, 15);
				setTimeout(game.win.bind(game), 200);
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
		for(var i = 0; i < 8; i++){
			game.buttons[i].hidden = false;
			game.buttons[i].style.border = '1px solid rgba(128, 128, 128, 1)';
		}
		game.soundtrack.play();
	});
	game.buttons[9].addEventListener("click", function(event){ //Reset Button
		game.CameraObj.radius = game.CameraObj.initialRadius;
		game.buttons[8].hidden = false;
		game.buttons[9].hidden = true;
		game.timerHours = -1;
		game.timerMinutes = -1;
		game.timerSeconds = -1;
		game.carryOnTimer();
		game.time = 0;
	    game.counterForShuffle = 0;
		game.intervalForFireworks = 0;
		game.startGameFlag = false;
	    game.initialPhaseFlag = true;
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
}