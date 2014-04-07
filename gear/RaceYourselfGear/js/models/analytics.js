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
        'models/sapRaceYourself',
        'models/settings'
    ],
    def: function modelsAnalytics(req) {
        'use strict';

        var e = req.core.event,
            provider = req.models.sapRaceYourself,
            settings = req.models.settings,
            battery = navigator.battery || navigator.webkitBattery || navigator.mozBattery,
            queue = [],
            launchTime = Date.now(),
            pageShowTime = Date.now(), // initial view
            pageName = 'main',
            sectionChangeTime = Date.now(),
            activeSection = false,
            sectionVisible = {},
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
            	if (!!battery) transition['battery_level'] = battery.level;
            	log(transition);
//            	console.log(JSON.stringify(transition));
            	transition = false;
            }
        }

        function onAnyPageHide(event) {
            transition = {
                    'old_flow_state': event.target.id,
                    'time_since_launch': Date.now() - launchTime,
                    'state_live': Date.now() - pageShowTime,
                    'event_type': 'Flow state changed'
                    
            };
        	if (activeSection !== false) {
            	sectionVisible[activeSection] = sectionVisible[activeSection] || 0;
            	sectionVisible[activeSection] = sectionVisible[activeSection] + (Date.now() - sectionChangeTime);
        	}
        	if (Object.keys(sectionVisible).length > 0) transition['sections_visible'] = sectionVisible;
            sectionChangeTime = Date.now();
            sectionVisible = {};
            activeSection = false;
        }
        
        function onAnySectionChange(event) {
        	if (activeSection != false && activeSection != event.detail.previous) console.error('Stored section ' + activeSection + ' does not match event section ' + event.detail.previous);
            sectionVisible[event.detail.previous] = sectionVisible[event.detail.previous] || 0;
            sectionVisible[event.detail.previous] = sectionVisible[activeSection] + (Date.now() - sectionChangeTime);
            sectionChangeTime = Date.now();
            activeSection = event.detail.active;
        }
        
        function onSectionHide() {
        	if (!!activeSection) {
            	sectionVisible[activeSection] = sectionVisible[activeSection] || 0;
            	sectionVisible[activeSection] += Date.now() - sectionChangeTime;
        	}
        }
        
        function onAward(event) {
            var achievement = event.detail.achievement;
            var data = {
            		'award': achievement.key,
                    'time_since_launch': Date.now()-launchTime,
                    'tvent_type': 'Achievement awarded'
                    
            };
            log(data);
        }
        
        function onRaceEnd(event) {
        	var race = event.detail;
            var data = {
            		'gps_active_percentage' : race.getGpsPercentage(),
            		'total_points' : settings.getPoints(),
            		'distance': race.getDistance(),
            		'distance_units': race.getDistanceUnits(),
            		'time': race.getDuration(),
                    'time_since_launch': Date.now()-launchTime,
                    'event_type': 'Completed a race'
                    
            };
            log(data);
        }
        
        function onInit(event) {
        	log({
        		'language': navigator.language,
        		'age_range': settings.getAgeRange(),
                'event_type': 'Gear Settings'
        	});
        }
        
        /**
         * Initializes the module
         */
        function init() {
            window.addEventListener('pageshow', onAnyPageShow);
            window.addEventListener('pagehide', onAnyPageHide);
            window.addEventListener('sectionchange', onAnySectionChange);
            e.listen('achievement.awarded', onAward)
            e.listen('race.end', onRaceEnd)
            setTimeout(onInit, 1);
        }

        return {
            init:init,
            log: log
        };
    }

});
