"use strict";

class Camera {
	constructor(gl, program, aspect){
		this.gl = gl;
		this.program = program;
		this.modelViewMatrixLoc = this.gl.getUniformLocation( this.program, "uModelViewMatrix" );
    	this.projectionMatrixLoc = this.gl.getUniformLocation( this.program, "uProjectionMatrix" );
		this.radius = 8;
        this.finalRadius = 5;
        this.initialRadius = 10;
		this.at = vec3(0.0, 0.0, 0.0);
		this.up = vec3(0.0, 1.0, 0.0);
		this.anglePlaneYZ = 30*(Math.PI/180);
		this.anglePlaneXZ = 0*(Math.PI/180);
		this.changePerseptionYZ = 1;
		this.fovy = 45.0;
		this.near = 1;
		this.far = -30.0;
		this.aspect = aspect;
        this.modelViewMatrix = mat4();
        this.projectionMatrix = mat4();
	}
}

Camera.prototype.setModelViewAndProjection = function (){
    var z_eye = this.radius*Math.cos(this.anglePlaneYZ)*Math.sin(this.anglePlaneXZ);
    var y_eye = this.radius*Math.sin(this.anglePlaneYZ);
    var x_eye = this.radius*Math.cos(this.anglePlaneYZ)*Math.cos(this.anglePlaneXZ);
    this.eye = vec3(x_eye, y_eye, z_eye);
    this.eye4 = vec4(x_eye, y_eye, z_eye, 1.0);
    this.modelViewMatrix = lookAt(this.eye, this.at , this.up);
    this.gl.uniformMatrix4fv(this.modelViewMatrixLoc, false, flatten(this.modelViewMatrix));
    this.projectionMatrix = perspective( this.fovy, this.aspect, this.near, this.far );
    this.gl.uniformMatrix4fv(this.projectionMatrixLoc, false, flatten(this.projectionMatrix));
}

Camera.prototype.handler = function(game){
    var curx;
    var cury;
    var trackingMouse = false;
    game.canvas.addEventListener("mousedown", function(event){
    	game.canvas = document.getElementById( "gl-canvas" );
        var x = 2*event.clientX/game.canvas.width - 1;
        var y = 2*(game.canvas.height-event.clientY)/game.canvas.height - 0.5;
        curx = x;
        cury = y;
        trackingMouse = true;
    });
    
    game.CameraObj.changePerseptionYZ = 1;

    game.canvas.addEventListener("mouseup", function(event){
        trackingMouse = false;
        /*if(game.CameraObj.anglePlaneYZ > Math.PI/2 && game.CameraObj.changePerseptionYZ == 1 || game.CameraObj.anglePlaneYZ < Math.PI/2 && game.CameraObj.changePerseptionYZ == -1)
            game.CameraObj.changePerseptionYZ *= -1;*/
    });
    
    game.canvas.addEventListener("mousemove", function(event){
    	game.CameraObj = game.CameraObj;
        if(trackingMouse)
            game.CameraObj.move(curx, cury, game.canvas, event);
    } );
}

Camera.prototype.move = function(curx, cury, canvas, event){
	var x = 2*event.clientX/canvas.width-1;
    var y = 2*(canvas.height-event.clientY)/canvas.height-0.5;
    var dx = x - curx;
    var dy = y - cury;
    if(dy < 0)
        this.anglePlaneYZ += 0.15 * this.changePerseptionYZ * Math.abs(dy);
    else
        this.anglePlaneYZ -= 0.15 * this.changePerseptionYZ * Math.abs(dy);

    if(dx < 0)
        this.anglePlaneXZ -= 0.15  * Math.abs(dx);
    else
        this.anglePlaneXZ += 0.15 * Math.abs(dx);
}