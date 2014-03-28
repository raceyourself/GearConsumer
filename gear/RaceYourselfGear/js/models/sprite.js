/**
 * Copyright (c) 2014 RaceYourself Inc
 * All Rights Reserved
 *
 * No part of this application or any of its contents may be reproduced, copied, modified or 
 * adapted, without the prior written consent of the author, unless otherwise indicated.
 * 
 * Commercial use and distribution of the application or any part is not allowed without express 
 * and prior written consent of the author.
 * 
 * The application makes use of some publicly available libraries, some of which have their own 
 * copyright notices and licences. These notices are reproduced in the Open Source License 
 * Acknowledgement file included with this software.
 */

/*global define, $, console, tizen, webapis*/
/*jslint regexp: true*/

/**
 * Application module
 */

define({
    name: 'models/sprite',
    requires: [
        'core/event',
        'core/storage'
    ],
    def: function modelsSprite(req) {
        'use strict';

        var e = req.core.event,
            s = req.core.storage;
        
        /**
         * Constructor
         */
        function Sprite(spritesheet, frameWidth, animationPeriod) {
            this.spritesheet = spritesheet;
            this.width = frameWidth;
            this.height = spritesheet.height;
            this.frames = spritesheet.width/this.width;
            if (this.frames !== ~~this.frames) console.error("Sprite " + spritesheet.src + " has a non-integer frame count!");
            this.setPeriod(animationPeriod);
            this.reset();
            this.position = { x : 0, y: 0 };
            this.targetPosition = { x : 0, y : 0};
            this.lastUpdateTime = Date.now();
            this.moveTimer = 0;
            this.speed = { x: 0, y : 0 };
            this.moveInterval = null;
//            console.log("Sprite " + spritesheet.src + " has " + this.frames + " " + this.width + "x" + this.height + " frames");
        }
        Sprite.prototype = {
                drawscaled: function drawscaled(context, x, y, dt, scale) {
                    this.time += dt;
                    if (this.time >= this.animationPeriod) {
                        while (this.time > this.animationPeriod) this.time -= this.animationPeriod;
                        if (!!this.endCallback) this.endCallback(this.time);
                    }
                    var frame = ~~(this.time/this.frameDelay);
                    context.drawImage(this.spritesheet, frame*this.width, 0, this.width, this.spritesheet.height, x, y, this.width * scale, this.spritesheet.height * scale);
                },
                
                draw: function draw(context, x, y, dt) {
                    this.time += dt;
                    if (this.time >= this.animationPeriod) {
                        while (this.time > this.animationPeriod) this.time -= this.animationPeriod;
                        if (!!this.endCallback) this.endCallback(this.time);
                    }
                    var frame = ~~(this.time/this.frameDelay);
                    
                    context.save();
                    context.translate(this.position.x, this.position.y);
                    context.scale(this.scale, this.scale);
                    context.drawImage(this.spritesheet, frame*this.width, 0, this.width, this.spritesheet.height, x, y, this.width, this.spritesheet.height);
                    context.restore();
                },
                
                reset: function reset() {
                    this.time = 0;
                    this.endCallback = undefined;
                    this.targetScale = 1;
                	this.scale = 1;
                	this.lastUpdateTime = Date.now();
                	this.scaleTimer = 0;
                	this.position = { x: 0, y: 0 };
                	this.targetPosition = { x: 0, y: 0 };
                	this.moveTimer = 0;
                },
                setPeriod: function setPeriod(milliseconds) {
                    this.animationPeriod = milliseconds;
                    this.frameDelay = this.animationPeriod/this.frames;
                },
                getPeriod: function getPeriod() {
                    return this.animationPeriod;
                },
                onEnd: function onEnd(callback) {
                    this.endCallback = callback;
                },
                clone: function clone() {
                    var sprite = new Sprite(this.spritesheet, 0 + this.width, 0 + this.animationPeriod);
                    return sprite;
                },

                updateAnim: function updateAnim() {
					var dt = Date.now() - this.lastUpdateTime;
                	if(this.moveTimer > 0)
                	{
						//move
						this.position.x += this.speed.x * dt;
						this.position.y += this.speed.y * dt;
						this.moveTimer -= dt;
					}
					if(this.scaleTimer > 0)
					{
						this.scale += this.scaleSpeed * dt;
						this.scaleTimer -= dt;
					}						
					this.lastUpdateTime = Date.now();
                },
                
                moveTo: function moveTo(positionX, positionY, duration) {
                	this.targetPosition.x = positionX;
                	this.targetPosition.y = positionY;
                	this.moveTimer = duration;
                	this.lastUpdateTime = Date.now();
                	this.speed.x = (this.targetPosition.x - this.position.x) / duration;
                	this.speed.y = (this.targetPosition.y - this.position.y) / duration;
//                	this.moveInterval = setInterval(this.updateAnim, 100);
                },
				
                moveby: function moveBy(positionX, positionY, duration)
                {
                	var newPos = new Object();
                	newPos.x = this.position.x + positionX;
                	newPos.y = this.position.y + positionY;
					moveTo(newPos);
                },
                
                scaleTo: function scaleTo(scale, duration) {
                	this.targetScale = scale;
                	this.scaleTimer = duration;
                	this.lastUpdateTime = Date.now();
                	this.scaleSpeed = (this.targetScale - this.scale) / duration;
                }

                
        };
        
        return {
            Sprite: Sprite
        };
    }

});
