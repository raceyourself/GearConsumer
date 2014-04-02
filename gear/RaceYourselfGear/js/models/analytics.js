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
            pageName = 'main',
            transition = false,
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
            pageName = event.target.id;
            if (!!transition) {
            	transition['new_flow_state'] = pageName;
            	log(transition);
            	console.log(transition);
            	transition = false;
            }
        }

        function onAnyPageHide(event) {
            transition = {
                    'old_flow_state': event.target.id,
                    'time_since_launch': Date.now() - launchTime,
                    'state_live': Date.now() - pageShowTime,
                    'event_type': 'flow_state_change'
                    
            };
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
