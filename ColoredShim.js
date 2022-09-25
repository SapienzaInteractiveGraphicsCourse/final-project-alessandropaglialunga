"use strict";

class ColoredShim{
	constructor(gl, program, x, y, z, length, height, colorIdx, axis){
		this.gl;
		this.program;
		this.length = length;
		this.height = height;
		this.transform = translate(x,y,z);
		this.axis = axis;
		this.colorIdx = colorIdx;
		switch(axis){
			case "X": this.transform = mult(this.transform, scale(height, length, length)); break;
			case "Y": this.transform = mult(this.transform, scale(length, height, length)); break;
			case "Z": this.transform = mult(this.transform, scale(length, length, height)); break;
		}
	}
}