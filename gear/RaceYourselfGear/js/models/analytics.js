/*global define, $, console, window, tizen, webapis*/
/*jslint regexp: true, plusplus: true*/

/**
 * Analytics module
 */

define({
    name: 'models/analytics',
    requires: [
        'core/event',
        'models/sapRaceYourself'
    ],
    def: function modelsAnalytics(req) {
        'use strict';

        var e = req.core.event,
            provider = req.models.sapRaceYourself,
            queue = [],
            launchTime = Date.now(),
            pageShowTime = Date.now(), // initial view
            VERSION = 1;
        
        
        function log(event) {
        	event.version = event.version || VERSION;
            queue.push(event);
            if (queue.length > 1) console.warn('Analytics queue has ' + queue.length + ' events');
            var queued;
            while (queued = queue.shift()) {
                if (!provider.sendAnalytics(queued)) {
                    queue.unshift(queued);
                    return;
                }
            }
        }        
        
        function onAnyPageShow(event) {
            pageShowTime = Date.now();
        }

        function onAnyPageHide(event) {
            var data = {
                    'Flow state': event.target.id,
                    'Time since launch': Date.now()-launchTime,
                    'State live': Date.now() - pageShowTime,
                    'Event type': 'Flow state changed'
                    
            };
            log(data);
        }
        
        function onAward(event) {
            var achievement = event.detail.achievement;
            var data = {
            		'Award': achievement.key,
                    'Time since launch': Date.now()-launchTime,
                    'Event type': 'Achievement awarded'
                    
            };
            log(data);
        }
        
        function onRaceEnd(event) {
        	var race = event.detail;
            var data = {
            		'Distance': race.getDistance(),
            		'Distance units': race.getDistanceUnits(),
            		'Time': race.getDuration(),
                    'Time since launch': Date.now()-launchTime,
                    'Event type': 'Completed a race'
                    
            };
            log(data);
        }
        
        /**
         * Initializes the module
         */
        function init() {
            window.addEventListener('pageshow', onAnyPageShow);
            window.addEventListener('pagehide', onAnyPageHide);
            e.listen('achievement.awarded', onAward)
            e.listen('race.end', onRaceEnd)
        }

        return {
            init:init,
            log: log
        };
    }

});
