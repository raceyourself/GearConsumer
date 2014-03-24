/*global define, $, console, window, tizen, webapis*/
/*jslint regexp: true, plusplus: true*/

/**
 * Motion module
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

        function handleMotionInfo(ev) {
            eventName = 'motion.wristup';
            e.fire(eventName, ev);
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
