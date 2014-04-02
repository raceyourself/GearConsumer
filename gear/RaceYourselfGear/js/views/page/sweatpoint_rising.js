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
    name: 'views/page/sweatpoint_rising',
    requires: [
        'core/event',
        'core/storage'
    ],
    def: function ViewsPageSweatPoint_Rising(req) {
        'use strict';

        var e = req.core.event,
            s = req.core.storage;
        
        /**
         * Constructor
         */
        function SweatPoint(amount, colour, startPos, destPos) {
            this.amount = Math.round(amount);
			this.colour = colour;

            this.position = startPos;
            this.destPosition = destPos;
			this.moveTotalTime = 2;
			this.alphaTime = 1;
			this.vel = { x: (destPos.x - startPos.x)/this.moveTotalTime, y: (destPos.y - startPos.y)/this.moveTotalTime };

			this.moveTimer = 0;
			this.finished = false;
			
			this.speed = 10;

			this.signString = amount > 0 ? ('+') : ('-');
			this.amountString = Math.abs(this.amount);
            
        }


        
        SweatPoint.prototype = {
			tick: function tick() {
				var dt = Date.now() - this.lastTickTime;
				this.lastTickTime = Date.now();
			
				if( isNaN(dt) ) { return; }
			
				//update position / velocity
				this.moveTimer += dt /1000;
			
				if(this.moveTimer >= this.moveTotalTime)
				{
					//kill tick
					clearInterval(tick);
				
					//delete self
					this.finished = true;
				}
				else
				{
					this.position.x += this.vel.x * dt/1000;
					this.position.y += this.vel.y * dt/1000;
				}			
			},

			render: function render(context, sprite) {
				context.font = 'bold 18px Samsung Sans';
				context.fillStyle = this.colour;
				context.textBaseline = 'middle';

				var scale = 0.5;

				//alpha eased
				var timeForAlpha = Math.min(this.alphaTime, this.moveTimer);
				context.globalAlpha = Math.cos((timeForAlpha/this.alphaTime) * Math.PI/2);
				
				context.textAlign = 'right';
				context.fillText(this.signString, this.position.x - sprite.width*scale - 3, this.position.y -1);
				
				context.textAlign = 'left';
				context.fillText(this.amountString, this.position.x, this.position.y -1);
				
				if(sprite != null)
				{
					sprite.drawscaled(context, this.position.x - sprite.width*scale - 2, this.position.y - scale * sprite.height/2, 0, scale);
				}
				
				context.globalAlpha = 1;
				
			},
                
			getFinished: function getFinished() {
				return this.finished;
			}
			
        };
        
        return {
            SweatPoint: SweatPoint
        };
    }

});
