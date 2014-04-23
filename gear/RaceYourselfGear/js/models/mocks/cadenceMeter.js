/*global define, $, console, tizen, webapis */
/*jslint regexp: true*/

/**
 * Heart rate monitor mock module
 */

define({
    name: 'models/mocks/cadenceMeter',
    requires: [
        'core/event',
        'models/cadenceMeter'
    ],
    def: function modelsCadenceMeterMock(req) {
        'use strict';

        var e = req.core.event,
        	cm = req.models.cadenceMeter,
        	cadenceChangePeriod = 5000,
            cannedRates = [ { rate: 10, duration: 5 },		//warmup
            				{ rate: 20, duration: 10 },		//good
            				{ rate: 25, duration: 10 },		//too high
            				{ rate: 50, duration: 5 },		//good
            				{ rate: 25, duration: 0 } ],		//too low - 0 means indefinite
        	cadenceUpdatePeriod = 5,
            randomInterval = null,
            interval = null,
        	currentCannedIndex = 0,
        	cadence = 50,
        	cannedTimeout = false;
        
        function start() {
        	if (interval) clearInterval(interval);
            randomInterval = setInterval(randomCadence, cadenceChangePeriod);
            interval = setInterval(sendCadenceUpdate, cadenceUpdatePeriod);
        }
        
        function startCanned() {
        	currentCannedIndex = 0;
			if(cannedTimeout != false)
			{
				clearTimeout(cannedTimeout);
			}
			nextCanned();

        	interval = setInterval(sendCadenceupdate, hrUpdatePeriod);
        }
        
        function nextCanned() {
        	var newRate = cannedRates[currentCannedIndex];
        	cadence = newRate.rate;
        	if(newRate.duration > 0)
        	{
				cannedTimeout = setTimeout( nextCanned, newRate.duration * 1000 );
			}
        	console.log('setting canned cadence to ' + cadence);
			currentCannedIndex++;
        }
        
        function sendCadenceUpdate() {
        	cm._handleCadenceInfo({cadence: cadence, mock: true});
        }
        
        //test function to provide random heart rate
        function randomCadence() {
        	cadence = Math.floor( 0 + 100 * (Math.random()) );			//random
        }

        return {
            start: start,
            startCanned : startCanned
        };
    }

});
