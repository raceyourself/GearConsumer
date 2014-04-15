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
 * Heart rate monitor module
 */

define({
    name: 'models/cadenceMeter',
    requires: [
        'core/event',
        'models/config'
    ],
    def: function modelsHeartRateMonitor(req) {
        'use strict';

        var e = req.core.event,
        	config = req.models.config,
            cadence = null,
            started = false,
            functioning = false,
            available = true,
            error,
            lastData = {
        		heartRate: 60,
        		rRInterval: 0
        	},

            CONTEXT_TYPE = 'CADENCE';

        /**
         * Return last received (un-smoothed) motion data
         * @return {object}
         */
        function getLastData() {
            return lastData;
        }

        function handleCadenceInfo(cadenceInfo) {
            var eventName = 'cadence.change';
            var smoothing = config.getHrSmoothing();      //just use Hr smoothing for now
            var info = {
            		cadence: ~~(smoothing*lastData.cadence + (1-smoothing)*cadenceInfo.cadence),
            };
            lastData = cadenceInfo;
            e.fire(eventName, info);
        	if (cadenceInfo.cadence > 50 && cadenceInfo.cadence < 180 && !cadenceInfo.mock) functioning = true;
        }

        /**
         * Registers a change listener
         * @public
         */
        function start() {
        	if (started === true) return;
        	try {
//	            hrm.start(
//	                CONTEXT_TYPE,
//	                handleHrmInfo
//	            );
				
				//TODO start the sensor
				
	            started = true;
        	} catch(e) {
        		available = false;
        		started = false;
        		functioning = false;
        		console.error(e);
        		error = e;
        	}
        }

        /**
         * Unregisters a change listener
         * @public
         */
        function stop() {
//            hrm.stop(CONTEXT_TYPE);
//            started = false;

			//TODO stop the sensor

        }

        function isAvailable() {
//            return !!hrm && available;
			//TODO
        }
        
        function isStarted() {
        	return started;
        }
        
        function isFunctioning() {
        	return functioning;
        }
        
        function getError() {
        	return error;
        }
        
        /**
         * Initializes the module
         */
        function init() {
//            if (window.webapis && window.webapis.motion !== undefined) {
//                hrm = window.webapis.motion;
//            }

			//TODO init

        }

        return {
            init: init,
            start: start,
            stop: stop,
            getLastData: getLastData,
            isAvailable: isAvailable,
            isStarted: isStarted,
            isFunctioning: isFunctioning,
            getError: getError,
            _handleCadenceInfo: handleCadenceInfo // private, used by mock
        };
    }

});
