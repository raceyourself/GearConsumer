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
            available = true,

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
        	try {
	        	motion.start(
	                CONTEXT_TYPE,
	                handleMotionInfo
	            ); 
	    	} catch(e) {
	    		available = false;
	    		console.error(e);
	    	}
        }

        /**
         * Unregisters a change listener
         * @public
         */
        function stop() {
            motion.stop(CONTEXT_TYPE);
        }

        function isAvailable() {
            return !!motion && available;
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
