/*global define, $, console, tizen, webapis */
/*jslint regexp: true*/

/**
 * Heart rate monitor mock module
 */

define({
    name: 'models/mocks/hrm',
    requires: [
        'core/event',
        'models/hrm'
    ],
    def: function heartRateMock(req) {
        'use strict';

        var e = req.core.event,
        	hrm = req.models.hrm,
        	hrChangePeriod = 5000,
            interval;
        
        function start() {
        	if (interval) clearInterval(interval);
            interval = setInterval(randomHR, hrChangePeriod);        	
        }
        
        //test function to provide random heart rate
        function randomHR() {
        	var hr = Math.floor( 50 + 150 * (Math.random()) );			//random
//        	hr = Math.floor(minHeartRate + 2);   					//warning
//			hr = Math.floor( (minHeartRate + maxHeartRate)/2);   	//always good
			
//			hr = hr + 10 * Math.floor( Math.random() ) - 5;			//random walk
//			hr = Math.floor(Math.min(hr, maxPossibleHeartRate));
//			hr = Math.floor(Math.max(hr, minPossibleHeartRate));
			
			var rToRTime = (60/hr) * 1e-3;
			
        	hrm._handleHrmInfo({heartRate: hr, rRInterval: rToRTime});
        }

        return {
            start: start
        };
    }

});
