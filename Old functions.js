RubikCube.prototype.initilizeMatrices = function(){
	this.virtualRubikCube = new Array();
	for(var zId = 0; zId < this.numSubcubesPerLine; zId++)
		this.virtualRubikCube[zId] = new Array();
	for(var zId = 0; zId < this.numSubcubesPerLine; zId++)
		for(var yId = 0; yId < this.numSubcubesPerLine; yId++)
			this.virtualRubikCube[zId][yId] = new Array();
	for(var zId = 0; zId < this.numSubcubesPerLine; zId++)
		for(var yId = 0; yId < this.numSubcubesPerLine; yId++)
			for(var xId = 0; xId < this.numSubcubesPerLine; xId++)
				this.virtualRubikCube[zId][yId][xId] = null;

	var counter = 0;
	this.cubeLength = (this.subcubeLength + this.offsetBtwSubcubes) * (this.numSubcubesPerLine-1) + this.subcubeLength;
	var distanceBtw2SubcubesCenter = this.subcubeLength + this.offsetBtwSubcubes;
	for(var zId = 0; zId < this.numSubcubesPerLine; zId++)
		for(var yId = 0; yId < this.numSubcubesPerLine; yId++)
			for(var xId = 0; xId < this.numSubcubesPerLine; xId++){
				var xPos = xId*distanceBtw2SubcubesCenter - (this.cubeLength - this.subcubeLength)/2;
				var yPos = yId*distanceBtw2SubcubesCenter - (this.cubeLength - this.subcubeLength)/2;
				var zPos = zId*distanceBtw2SubcubesCenter - (this.cubeLength - this.subcubeLength)/2;
				if (xId == 0 || xId == this.numSubcubesPerLine-1 || yId == 0 || yId == this.numSubcubesPerLine-1
				|| zId == 0 || zId == this.numSubcubesPerLine-1){
					var indicesOfVisibleFaces = this.visibleFace(xPos, yPos, zPos);
					this.subcubes.push(new Subcube( this.gl, this.program, xPos, yPos, zPos, this.subcubeLength, indicesOfVisibleFaces));
					this.virtualRubikCube[zId][yId][xId] = {subcubeId: counter, position: [xPos, yPos, zPos]};
					counter += 1;
				}
			}
}

Subcube.prototype.rotate = function(face, rotationAxis){
    var currentX = this.transform[0][3];
    var currentY = this.transform[1][3];
    var currentZ = this.transform[2][3];
    var finalX = 0, finalY = 0, finalZ = 0;
    switch(face){
        case 0: var radius = Math.sqrt(currentY*currentY + currentX*currentX);
                var currentAngle = Math.atan2(currentY, currentX);
                    var rotationDirection = (this.rotationOrientationFlag) ? 1 : -1;
                if (currentZ > 0)
                    rotationDirection *= -1;
                finalZ = currentZ;
                break;
        case 1: var radius = Math.sqrt(currentY*currentY + currentX*currentX);
                var currentAngle = Math.atan2(currentY, currentX);
                    var rotationDirection = (this.rotationOrientationFlag) ? 1 : -1;
                if (currentZ > 0)
                    rotationDirection *= -1;
                finalZ = currentZ;
                break;
        case 2: var radius = Math.sqrt(currentZ*currentZ + currentX*currentX);
                var currentAngle = Math.atan2(currentZ, currentX);
                    var rotationDirection = (this.rotationOrientationFlag) ? 1 : -1;
                if (currentY > 0)
                    rotationDirection *= -1;
                finalY = currentY;
                break;
        case 3: var radius = Math.sqrt(currentZ*currentZ + currentX*currentX);
                var currentAngle = Math.atan2(currentZ, currentX);
                    var rotationDirection = (this.rotationOrientationFlag) ? 1 : -1;
                if (currentY > 0)
                    rotationDirection *= -1;
                finalY = currentY;
                break;
        case 4: var radius = Math.sqrt(currentY*currentY + currentZ*currentZ);
                var currentAngle = Math.atan2(currentY, currentZ);
                    var rotationDirection = (this.rotationOrientationFlag) ? 1 : -1;
                if (currentX > 0)
                    rotationDirection *= -1;
                finalX = currentX;
                break;
        case 5: var radius = Math.sqrt(currentY*currentY + currentZ*currentZ);
                var currentAngle = Math.atan2(currentY, currentZ);
                    var rotationDirection = (this.rotationOrientationFlag) ? 1 : -1;
                if (currentX > 0)
                    rotationDirection *= -1;
                finalX = currentX;
                break;
    }
    var finalAngle = currentAngle + (90*Math.PI/180) * rotationDirection;
    if(finalX != 0){
        var finalY = radius*Math.sin(finalAngle);
        var finalZ = radius*Math.cos(finalAngle);
    }
    if(finalY != 0){
        var finalZ = radius*Math.sin(finalAngle);
        var finalX = radius*Math.cos(finalAngle);
    }
    if(finalZ != 0){
        var finalY = radius*Math.sin(finalAngle);
        var finalX = radius*Math.cos(finalAngle);
    }
    this.transform[0][3] = finalX;
    this.transform[1][3] = finalY;
    this.transform[2][3] = finalZ;
    this.transform = mult(this.transform, rotate(90*rotationDirection, rotationAxis));
}

Subcube.prototype.rotate = function(){
    var currentX = this.transform[0][3];
    var currentY = this.transform[1][3];
    var currentZ = this.transform[2][3];
    var radius = Math.sqrt(currentY*currentY + currentZ*currentZ);
    var currentAngle = Math.atan2(currentY, currentZ);
    var finalAngle = currentAngle + (90*Math.PI/180) * rotationDirection;
    var finalX = currentX;
    var finalY = radius*Math.sin(finalAngle);
    var finalZ = radius*Math.cos(finalAngle);
    this.transform[0][3] = finalX;
    this.transform[1][3] = finalY;
    this.transform[2][3] = finalZ;
    this.transform = mult(this.transform, rotate(90*rotationDirection, rotationAxis));
}

RubikCube.prototype.rotateFace = function(face){
    var targetVirtualFace = new Array();
    var futureFace = new Array();
    for(var i = 0; i < this.numSubcubesPerLine; i++){
        targetVirtualFace[i] = new Array();
        futureFace[i] = new Array();
    }
    var idZ, idY, idX, rotationAxis;
    var rotationDirection = (this.rotationOrientationFlag) ? 1 : -1;
    switch(face){
        case 0: //(BACK) move idX and idY. idZ = 0;
                rotationAxis = vec3(0,0,1);
                break;
        case 1: //(FRONT) move idX and idY. idZ = this.numSubcubesPerLine - 1;
                rotationAxis = vec3(0,0,1);
                rotationDirection *= -1;
                break;
        case 2: //(BOTTOM) move idX and idZ. idY = 0
                rotationAxis = vec3(0,1,0);
                break;
        case 3: //(TOP) move idX and idZ. idY = this.numSubcubesPerLine - 1;
                rotationAxis = vec3(0,1,0);
                rotationDirection *= -1;
                break;
        case 4: //(LEFT) move idZ and idY. idX = 0;
                rotationAxis = vec3(1,0,0);
                break;
        case 5: //(RIGHT) move idZ and idY. idX = this.numSubcubesPerLine - 1;
                rotationAxis = vec3(1,0,0);
                rotationDirection *= -1;
                break;
    }
    for(var id_1 = 0; id_1 < this.numSubcubesPerLine; id_1++)
        for(var id_2 = 0; id_2 < this.numSubcubesPerLine; id_2++){
            switch(face){
                case 0: idZ = 0; idY = id_1; idX = id_2;
                        break;
                case 1: idZ = this.numSubcubesPerLine - 1; idY = id_1; idX = id_2;
                        break;
                case 2: idZ = id_1; idY = 0; idX = id_2;
                        break;
                case 3: idZ = id_1; idY = this.numSubcubesPerLine - 1; idX = id_2;
                        break;
                case 4: idZ = id_1; idY = id_2; idX = 0;
                        break;
                case 5: idZ = id_1; idY = id_2; idX = this.numSubcubesPerLine - 1;
                        break;
            }
            targetVirtualFace[id_1][id_2] = this.virtualRubikCube[idZ][idY][idX];
            var subcubeId = this.virtualRubikCube[idZ][idY][idX].subcubeId;
            this.subcubes[subcubeId].rotate(face, rotationAxis, rotationDirection);
        }
    const arrayColumn = (arr, n) => arr.map(x => x[n]);
    var bottomLine = targetVirtualFace[0];
    var rightLine = arrayColumn(targetVirtualFace, this.numSubcubesPerLine-1);
    var topLine = targetVirtualFace[this.numSubcubesPerLine-1];
    var leftLine = arrayColumn(targetVirtualFace, 0);
    for(var i = 0; i < this.numSubcubesPerLine; i++){
        if (rotationDirection == -1){ //counterclockwise
            futureFace[i][this.numSubcubesPerLine-1] = bottomLine[i];
            futureFace[this.numSubcubesPerLine-1][i] = rightLine[this.numSubcubesPerLine-1-i];
            futureFace[i][0] = topLine[i];
            futureFace[0][i] = leftLine[this.numSubcubesPerLine-1-i];
        }else{ //clockwise
            //futureFace[i][this.numSubcubesPerLine-1] = bottomLine[i];
            futureFace[i][0] = bottomLine[this.numSubcubesPerLine-1-i];
            //futureFace[this.numSubcubesPerLine-1][i] = rightLine[this.numSubcubesPerLine-1-i];
            futureFace[0][i] = rightLine[i];
            //futureFace[i][0] = topLine[i];
            futureFace[i][this.numSubcubesPerLine-1] = topLine[this.numSubcubesPerLine-1-i];
            //futureFace[0][i] = leftLine[this.numSubcubesPerLine-1-i];
            futureFace[this.numSubcubesPerLine-1][i] = leftLine[i];
        }
    }
    futureFace[1][1] = targetVirtualFace[1][1];
    //Update virtualRubikCube
    for(var id_1 = 0; id_1 < this.numSubcubesPerLine; id_1++)
        for(var id_2 = 0; id_2 < this.numSubcubesPerLine; id_2++){
            switch(face){
                case 0: idZ = 0; idY = id_1; idX = id_2;
                        break;
                case 1: idZ = this.numSubcubesPerLine - 1; idY = id_1; idX = id_2;
                        break;
                case 2: idZ = id_1; idY = 0; idX = id_2;
                        break;
                case 3: idZ = id_1; idY = this.numSubcubesPerLine - 1; idX = id_2;
                        break;
                case 4: idZ = id_1; idY = id_2; idX = 0;
                        break;
                case 5: idZ = id_1; idY = id_2; idX = this.numSubcubesPerLine - 1;
                        break;
            }
            this.virtualRubikCube[idZ][idY][idX] = futureFace[id_1][id_2];
        }
}

Subcube.prototype.rotate = function(face, rotationAxis, rotationDirection){
    var currentX = this.transform[0][3];
    var currentY = this.transform[1][3];
    var currentZ = this.transform[2][3];
    var finalX = 0, finalY = 0, finalZ = 0;
    switch(face){
        case 0: var radius = Math.sqrt(currentY*currentY + currentX*currentX);
                var currentAngle = Math.atan2(currentX, currentY);
                finalZ = currentZ;
                break;
        case 1: var radius = Math.sqrt(currentY*currentY + currentX*currentX);
                var currentAngle = Math.atan2(currentX, currentY);
                finalZ = currentZ;
                break;
        case 2: var radius = Math.sqrt(currentZ*currentZ + currentX*currentX);
                var currentAngle = Math.atan2(currentZ, currentX);
                finalY = currentY;
                break;
        case 3: var radius = Math.sqrt(currentZ*currentZ + currentX*currentX);
                var currentAngle = Math.atan2(currentZ, currentX);
                finalY = currentY;
                break;
        case 4: var radius = Math.sqrt(currentY*currentY + currentZ*currentZ);
                var currentAngle = Math.atan2(currentY, currentZ);
                finalX = currentX;
                break;
        case 5: var radius = Math.sqrt(currentY*currentY + currentZ*currentZ);
                var currentAngle = Math.atan2(currentY, currentZ);
                finalX = currentX;
                break;
    }
    var finalAngle = currentAngle + (90*Math.PI/180) * rotationDirection;
    var fixedVariable;
    if(finalX != 0){
        var finalY = radius*Math.sin(finalAngle);
        var finalZ = radius*Math.cos(finalAngle);
    }else if(finalY != 0){
        var finalZ = radius*Math.sin(finalAngle);
        var finalX = radius*Math.cos(finalAngle);
    }else if(finalZ != 0){
        var finalX = radius*Math.sin(finalAngle);
        var finalY = radius*Math.cos(finalAngle);
    }
    this.transform = mult(rotate(90*rotationDirection, rotationAxis), this.transform);
    this.transform[0][3] = finalX;
    this.transform[1][3] = finalY;
    this.transform[2][3] = finalZ;
    /*this.animationParameters = {flag: true, time: 0, initialX: currentX, initialY: currentY, initialZ: currentZ, constantVariable: fixedVariable, angleStep: 0.1, finalAngle: 90, rotationAxis: rotationAxis, rotationDirection: rotationDirection};
    if(this.id == 25)
        console.log(this.animationParameters);*/
}