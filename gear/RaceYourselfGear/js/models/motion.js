/*global define, $, console, window, tizen, webapis*/
/*jslint regexp: true, plusplus: true*/

/**
 * Heart rate monitor module
 */

define({
    name: 'models/motion',
    requires: [
        'core/event'
    ],
    def: function modelsMotion(req) {
        'use strict';

        var e = req,
            motion = null,

            CONTEXT_TYPE = 'WRIST_UP';

        /**
         * @param {MotionHRMInfo} hrmInfo
         */
        function handleMotionInfo(motionInfo) {
        	console.log('motion info');
        	console.log(motionInfo);
            eventName = 'motion.wrist_up';
            e.fire(eventName, motionInfo);
        }

        /**
         * Registers a change listener
         * @public
         */
        function start() {
        	motion.start(
                CONTEXT_TYPE,
                handleMotionInfo
            );
        }

        /**
         * Unregisters a change listener
         * @public
         */
        function stop() {
            motion.stop(CONTEXT_TYPE);
        }

        function isAvailable() {
            return !!motion;
        }
        
        /**
         * Initializes the module
         */
        function init() {
            if (window.webapis && window.webapis.motion !== undefined) {
            	motion = window.webapis.motion;
            }
        }

        return {
            init: init,
            start: start,
            stop: stop,
            isAvailable: isAvailable,
        };
    }

});
