/*global define, $, console, tizen, webapis*/
/*jslint regexp: true*/

/**
 * Application module
 */

define({
    name: 'models/achievements',
    requires: [
        'core/event',
        'core/storage',
        'models/race'
    ],
    def: function modelsAchievements(req) {
        'use strict';

        var e = req.core.event,
            s = req.core.storage,
            race = req.models.race,
            achieved = {},
            ACHIEVEMENTS = {
                'run' : {
                    title: 'Completed a run',
                    points: 100,
                    uses: 1,
                    init: function() {
                        e.listen('race.end', function(event) {
                            var race = event.detail;
                            achieve('run');
                        });
                    }
                },
                'run_in_zone' : {
                    title: 'Completed a run without leaving target heart rate zone',
                    points: 150,
                    uses: Infinity,
                    init: function() {
                        e.listen('race.end', function(event) {
                            var race = event.detail;
                            if (race.in_da_zone_TODO) achieve('run_in_zone');
                        });
                    }
                }
            },
            STORAGE_KEY = 'achievements';

        function saveAchievements() {
            if (s.add(STORAGE_KEY, achieved)) {
                return true;
            }
            return false;
        }
        
        function achieve(achievement) {
            var a = ACHIEVEMENTS[achievement];
            if (!a) {
                console.error('Unknown achievement ' + achievement);
                return;
            }
            
            var times = achieved[achievement] || [];            
            if (a.uses <= times.length) return;
            
            var now = new Date();
            times.push(now);
            achieved[achievement] = times;
            saveAchievements();
            
            console.log('Achieved ' + achievement + ' on ' + now + ' for the ' + times.length + 'st/nd/th time');
            e.fire('achievement.awarded', {achievement: a, when: now});
        }
        
        function getAchievements() {
            var compound = {};
            for (var key in ACHIEVEMENTS) {
                if (ACHIEVEMENTS.hasOwnProperty(key)) {
                    compound[key] = ACHIEVEMENTS[key];
                    if (achieved.hasOwnProperty(key)) {
                        compound[key].achieved = achieved[key];
                    } else {
                        compound[key].achieved = [];                        
                    }
                }
            }
            return compound;
        }
        
        /**
         * Initializes module.
         */
        function init() {
            achieved = s.get(STORAGE_KEY);
            if (achieved === null) {
                achieved = {};
                saveAchievements();
            }
            for (var key in ACHIEVEMENTS) {
                if (ACHIEVEMENTS.hasOwnProperty(key)) {
                    ACHIEVEMENTS[key].init();
                }
            }
        }

        return {
            init: init,
            getAchievements: getAchievements
        };
    }

});
