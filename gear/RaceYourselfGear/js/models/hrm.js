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
    name: 'models/hrm',
    requires: [
        'core/event',
        'models/config'
    ],
    def: function modelsHeartRateMonitor(req) {
        'use strict';

        var e = req.core.event,
        	config = req.models.config,
            hrm = null,
            started = false,
            functioning = false,
            available = true,
            error,
            lastData = {
        		heartRate: 60,
        		rRInterval: 0
        	},

            CONTEXT_TYPE = 'HRM';

        /**
         * Return last received (un-smoothed) motion data
         * @return {object}
         */
        function getLastData() {
            return lastData;
        }

        /**
         * @param {MotionHRMInfo} hrmInfo
         */
        function handleHrmInfo(hrmInfo) {
            var eventName = 'hrm.change';
            var smoothing = config.getHrSmoothing();            
            var info = {
            		heartRate: ~~(smoothing*lastData.heartRate + (1-smoothing)*hrmInfo.heartRate),
            		rRInterval: hrmInfo.rRInterval
            };
            lastData = hrmInfo;
            e.fire(eventName, info);
        	if (hrmInfo.heartRate > 50 && hrmInfo.heartRate < 180 && !hrmInfo.mock) functioning = true;
        }

        /**
         * Registers a change listener
         * @public
         */
        function start() {
        	if (started === true) return;
        	try {
	            hrm.start(
	                CONTEXT_TYPE,
	                handleHrmInfo
	            );
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
            hrm.stop(CONTEXT_TYPE);
            started = false;
        }

        function isAvailable() {
            return !!hrm && available;
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
            if (window.webapis && window.webapis.motion !== undefined) {
                hrm = window.webapis.motion;
            }
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
            _handleHrmInfo: handleHrmInfo // private, used by mock
        };
    }

});
