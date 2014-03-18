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
//            console.log("Sprite " + spritesheet.src + " has " + this.frames + " " + this.width + "x" + this.height + " frames");
        }
        Sprite.prototype = {
                draw: function draw(context, x, y, dt) {
                    this.time += dt;
                    if (this.time >= this.animationPeriod) {
                        while (this.time > this.animationPeriod) this.time -= this.animationPeriod;
                        if (!!this.endCallback) this.endCallback(this.time);
                    }
                    var frame = ~~(this.time/this.frameDelay);
                    context.drawImage(this.spritesheet, frame*this.width, 0, this.width, this.spritesheet.height, x, y, this.width, this.spritesheet.height);
                },
                reset: function reset() {
                    this.time = 0;
                    this.endCallback = undefined;
                },
                setPeriod: function setPeriod(milliseconds) {
                    this.animationPeriod = milliseconds;
                    this.frameDelay = this.animationPeriod/this.frames;
                },
                onEnd: function onEnd(callback) {
                    this.endCallback = callback;
                },
                clone: function clone() {
                    var sprite = new Sprite(this.spritesheet, 0 + this.width, 0 + this.animationPeriod);
                    return sprite;
                }
        };
        
        return {
            Sprite: Sprite
        };
    }

});
