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

/*global define, $, console, tizen, webapis*/
/*jslint regexp: true*/

/**
 * Application module
 */

define({
    name: 'models/racedata',
    requires: [
        'core/storage',
        'core/event',
        'models/settings',
        'models/game',
        
        'helpers/units'
    ],
    def: function modelsRaceData(req) {
        'use strict';

        var s = req.core.storage,
            e = req.core.event,
            game = req.models.game,
            settings = req.models.settings,
            units = req.helpers.units,
            unit = units.UNIT_METER,
                
            racedata = [],
            
            STORAGE_KEY = 'history';

        
        function getStorageKey() {
        	return STORAGE_KEY;
        }
        
        /**
         * Initializes module.
         */
        function setData(r) {
            var distance = r.getDistance();
            var duration = r.getDuration();
            var calories = r.getCalories();
            
            var pointsgained = r.getPointsEarned();
            var pointslost = r.getPointsLost();
            var totalpoints = r.getPoints();
            
            var overallpoints = settings.getPoints();
            
            var steps = r.getSteps();
            
            var ideal = 'N/A';
            if (isFinite(r.data.time_in_zone)) ideal = ~~(r.data.time_in_zone*100/r.getDuration()) + '%';
            var hrtime = ideal;
            
            var achiev = r.getAchievements();
            
            var achievements = [];
            
            for(var i in achiev) {
            	achievements.push(achiev[i].key);
            }
            
           // achievements = Object.keys(achiv);
            var type;
            
            if(game.getCurrentGame() == 'racegame') {
            	type = 'Eliminator';
            } else {
            	switch(r.getGoal()) {
            	case 'Endurance':
            		type = 'Race Yourself Fitter';
            		break;
            		
            	case 'WeightLoss':
            		type = 'Race Yourself Slimmer';
            		break;
            		
            	case 'Strength':
            		type = 'Race Yourself Faster';
            		break;
            	
            	default:
            		console.log('Goal not found!');
            		type = 'N/A';
            		break;	
            	}
            	
            }
            
            var start_date = new Date(r.getStartDate());
            
            var months_list = new Array("Jan", "Feb", "Mar", 
            		"Apr", "May", "Jun", "Jul", "Aug", "Sep", 
            		"Oct", "Nov", "Dec");
            
            var day = start_date.getDate();
            var month = start_date.getMonth();
            var year = start_date.getFullYear();
            
            var hour = start_date.getHours();
            var mins = start_date.getMinutes();
            var suffix;
            
            if(hour < 12) {
            	suffix = 'am';
            } else {
            	suffix = 'pm';
            }
            
            if(hour == 0) {
            	hour = 12;
            }
            if(hour > 12) {
            	hour = hour - 12;
            }
            
            if(mins < 10) {
            	mins = '0' + mins;
            }
            
            console.log(achievements);
            
            var distanceunits = r.getDistanceUnits();
            
            var date = months_list[month] + ' ' + day + ' ' + year;
            
            var timeofrace = hour + ':' +  mins + suffix;
            
            racedata = {distance: distance, distanceunits: distanceunits, duration: duration, calories: calories, pointsgained: pointsgained, overallpoints: overallpoints, pointslost: pointslost, totalpoints: totalpoints, steps: steps, hrtime: hrtime, achievements: achievements, type: type, date: date, timeofrace: timeofrace};
            
            saveHistory();
        }
        
        function saveHistory() {
            if (s.add(STORAGE_KEY + settings.getCurrentHistoryCount(), racedata)) {
            	settings.increaseCurrentHistoryCount();
                return true;
            }
            return false;
        }
        
        function getLatestData() {
        	return racedata;
        }
        
        function getData(key) {
        	return s.get(STORAGE_KEY + key);
        }
        
        return {
            setData: setData,
            getStorageKey: getStorageKey,
            getLatestData: getLatestData,
            getData: getData
        };
    }

});
