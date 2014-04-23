/*global define, $, console, window, tizen, webapis*/
/*jslint regexp: true, plusplus: true*/

/**
 * Pedometer module
 */

define({
    name: 'models/pedometer',
    requires: [
        'core/event'
    ],
    def: function modelsPedometer(req) {
        'use strict';

        var e = req,
            pedometer = null,
            available = true,
            lastData = {},

            CONTEXT_TYPE = 'PEDOMETER';

        /**
         * @param {PedometerInfo} pedometerInfo
         * @return {object} pedometerData
         */
        function getPedometerData(pedometerInfo) {
            var pedometerData = {
                stepStatus: pedometerInfo.stepStatus,
                speed: pedometerInfo.speed,
                walkingFrequency: pedometerInfo.walkingFrequency,
                distance: pedometerInfo.cumulativeDistance,
                calorie: pedometerInfo.cumulativeCalorie,
                totalStep: pedometerInfo.cumulativeTotalStepCount,
                walkStep: pedometerInfo.cumulativeWalkStepCount,
                walkUpStep: pedometerInfo.cumulativeWalkUpStepCount,
                walkDownStep: pedometerInfo.cumulativeWalkDownStepCount,
                runStep: pedometerInfo.cumulativeRunStepCount,
                runUpStep: pedometerInfo.cumulativeRunUpStepCount,
                runDownStep: pedometerInfo.cumulativeRunDownStepCount
            };
            lastData = pedometerData;
            return pedometerData;
        }

        /**
         * Return last received motion data
         * @return {object}
         */
        function getLastData() {
            return lastData;
        }

        /**
         * @param {PedometerInfo} pedometerInfo
         * @param {string} eventName
         */
        function handlePedometerInfo(pedometerInfo, eventName) {
            eventName = eventName || 'pedometer.change';
            e.fire(eventName, getPedometerData(pedometerInfo));
        }

        /**
         * Registers a change listener
         * @public
         */
        function start() {
        	try {
	            pedometer.start(
	                CONTEXT_TYPE,
	                function onSuccess(pedometerInfo) {
	                    handlePedometerInfo(pedometerInfo, 'pedometer.change');
	                }
	            );
	    	} catch(e) {
	    		available = false;
        		console.error('Exception starting pedometer:');
	    		console.error(e);
	    	}
        }

        /**
         * Unregisters a change listener
         * @public
         */
        function stop() {
        	try {
        		pedometer.stop(CONTEXT_TYPE);
	    	} catch(e) {
	    		console.error(e);
	    	}
        }

        function isAvailable() {
            return !!pedometer && available;
        }
        
        /**
         * Initializes the module
         */
        function init() {
            if (window.webapis && window.webapis.motion !== undefined) {
                pedometer = window.webapis.motion;
            }
        }

        e.listeners({
            'application.exit': stop
        });
        
        return {
            init: init,
            start: start,
            stop: stop,
            getLastData: getLastData,
            isAvailable: isAvailable,
            _handlePedometerInfo: handlePedometerInfo // private, used by mock
        };
    }

});
