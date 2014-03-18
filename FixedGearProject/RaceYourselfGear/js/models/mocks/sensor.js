/*global define, $, console, tizen, webapis */
/*jslint regexp: true*/

/**
 * Application module
 */

define({
    name: 'models/sensor',
    requires: [
        'core/event'
    ],
    def: function modelsSensor(req) {
        'use strict';

        var e = req,
            steps,
            interval;

        function getSteps() {
            return steps;
        }

        /**
         * Increases steps var and triggers step event.
         */
        function triggerStep() {
            steps += 1;
            e.fire('sensor.step', {steps: steps});
        }

        /**
         * Pauses sensor.
         */
        function pause() {
            clearInterval(interval);
        }

        /**
         * Starts sensor.
         * @param {boolean} reset
         */
        function start(reset) {
            if (reset) {
                steps = 0;
            }
            interval = setInterval(triggerStep, 1000);
        }

        return {
            getSteps: getSteps,
            start: start,
            pause: pause
        };
    }

});
