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
    name: 'models/achievements',
    requires: [
        'core/event',
        'core/storage',
        'helpers/date',
        'models/race',        
        'models/game',        
        'models/settings',
        'models/config',
    ],
    def: function modelsAchievements(req) {
        'use strict';

        var e = req.core.event,
            s = req.core.storage,
            d = req.helpers.date,
            game = req.models.game,
            race = req.models.race,
            settings = req.models.settings,
            config = req.models.config,
            achieved = {},
            progress = {},
            ACHIEVEMENTS = {
                // Progress
                'run' : {
                    title: 'First run',
                    description: 'Completed a run',
                    points: 100,
                    uses: 1,
                    init: function() {
                        e.listen('race.end', function(event) {
                            var race = event.detail;
                            achieve('run');
                        });
                    },
                    progress: function() {
                        if (!!achieved['run']) return '100%';
                        return '0%';
                    }
                },
/*                'death' : {
                    title: 'First tussle',
                    description: 'Had fisticuffs with the evil undead',
                    points: 10,
                    uses: 1,
                    init: function() {
                        e.listen('died', function(event) {
                            var cause = event.detail.cause;
                            achieve('death');
                        });
                    },
                    progress: function() {
                        if (!!achieved['death']) return '100%';
                        return '0%';
                    }
                }, */
                'run_in_zone' : {
                    title: 'Trainer',
                    description: 'Completed a run without leaving target heart rate zone',
                    points: 150,
                    uses: Infinity,
                    init: function() {
                        e.listen('race.end', function(event) {
                            var race = event.detail;
                            if (race.data.hr_zones === true && !race.data.zoned_out) achieve('run_in_zone');
                        });
                    },
                    progress: function() {
                        if (!!achieved['run_in_zone']) return 'Achievable';
                        return 'Not yet achieved';
                    }
                },
                'survived' : {
                    title: 'Survivor',
                    description: 'Survived a run without getting caught by a pursuer',
                    points: 50,
                    uses: Infinity,
                    init: function() {
                        e.listen('race.end', function(event) {
                            var race = event.detail;
                            if (race.data.hr_zones === true && !race.data.caught_by) achieve('survived');
                        });
                    },
                    progress: function() {
                        if (!!achieved['survived']) return 'Achievable';
                        return 'Not yet achieved';
                    }
                },
                // Fitness
                '1km_run' : {
                    title: '1k',
                    description: 'Completed a 1km run',
                    points: 100,
                    uses: 1,
                    init: function() {
                        e.listen('race.end', function(event) {
                            var race = event.detail;
                            if (race.getMetricDistance() > 1000) achieve('1km_run');
                        });
                    },
                    progress: function() {
                        if (!!achieved['1km_run']) return '100%';
                        return '0%';
                    }
                },
                '3km_run' : {
                    title: '3k',
                    description: 'Completed a 3km run',
                    points: 150,
                    uses: 1,
                    init: function() {
                        e.listen('race.end', function(event) {
                            var race = event.detail;
                            if (race.getMetricDistance() > 3000) achieve('3km_run');
                        });
                    },
                    progress: function() {
                        if (!!achieved['3km_run']) return '100%';
                        return '0%';
                    }
                },
                '5km_run' : {
                    title: '5k',
                    description: 'Completed a 5km run',
                    points: 250,
                    uses: 1,
                    init: function() {
                        e.listen('race.end', function(event) {
                            var race = event.detail;
                            if (race.getMetricDistance() > 5000) achieve('5km_run');
                        });
                    },
                    progress: function() {
                        if (!!achieved['5km_run']) return '100%';
                        return '0%';
                    }
                },
                'half_marathon' : {
                    title: 'Half marathon',
                    description: 'Completed a half marathon',
                    points: 500,
                    uses: 1,
                    init: function() {
                        e.listen('race.end', function(event) {
                            var race = event.detail;
                            if (race.getDistance() > 21097) achieve('half_marathon');
                        });
                    },
                    progress: function() {
                        if (!!achieved['half_marathon']) return '100%';
                        return '0%';
                    }
                },
                'marathon' : {
                    title: 'Marathon',
                    description: 'Completed a full marathon',
                    points: 1000,
                    uses: 1,
                    init: function() {
                        e.listen('race.end', function(event) {
                            var race = event.detail;
                            if (race.getDistance() > 42195) achieve('marathon');
                        });
                    },
                    progress: function() {
                        if (!!achieved['marathon']) return '100%';
                        return '0%';
                    }
                },
                // Grind
/*                'boulder' : {
                    title: 'Boulder dash',
                    description: 'Unlocked the Race Boulder game by running a total of 5km',
                    points: 0,
                    uses: 1,
                    init: function() {
                        e.listen('race.end', function(event) {
                            if (progress.total.distance >= 5000) {
                                achieve('boulder');
                                game.unlock('boulder');
                            }
                        });
                    },
                    progress: function() {
                        return Number(Math.min(5000, progress.total.distance)*100/5000).toFixed(1).replace('.0', '') + '%';
                    }
                },
                'dino' : {
                    title: 'Jurassic Trek',
                    description: 'Unlocked the Race Dino game by running a total of ' + config.getDinoUnlockDist() + 'km',
                    points: 0,
                    uses: 1,
                    init: function() {
                        e.listen('race.progress', function(event) {
                            if (progress.total.distance >= config.getDinoUnlockDist() * 1000) {
                                achieve('dino');
                                game.unlock('dino');
                            }
                        });
                    },
                    progress: function() {
                    	var unlockDist = config.getDinoUnlockDist() * 1000;
                        return Number(Math.min(unlockDist, progress.total.distance)*100/unlockDist).toFixed(1).replace('.0', '') + '%';
                    }
                }, 
                'eliminator' : {
                    title: 'Eliminator Mode',
                    description: 'Unlocked the Eliminator game by running a total of ' + config.getElimUnlockDist() + 'km',
                    points: 0,
                    uses: 1,
                    init: function() {
                        e.listen('race.progress', function(event) {
                            if (progress.total.distance >= config.getElimUnlockDist() * 1000) {
                                achieve('eliminator');
                                game.unlock('eliminator');
                            }
                        });
                    },
                    progress: function() {
                    	var unlockDist = config.getElimUnlockDist() * 1000;
                        return Number(Math.min(unlockDist, progress.total.distance)*100/unlockDist).toFixed(1).replace('.0', '') + '%';
                    }
                }, */
                'Endurance' : {
                    title: 'Race Yourself Fitter',
                    description: 'Unlocked the Race Yourself Fitter mode by playing a game of Eliminator',
                    points: 0,
                    uses: 1,
                    image: 'unlocks/ry_fitter_ingameunlock.png',
                    init: function() {
                        e.listen('race.end', function(event) {
                        	var race = event.detail;
                        	if(race.getRaceType()=='racegame')
                        		achieve('Endurance');
                        		game.unlock('Endurance');
                        });
                    },
                    progress: function() {
                    	if (!!achieved['Endurance']) return '100%';
                        return '0%';
                    }
                },
                'WeightLoss' : {
                    title: 'Race Yourself Slimmer',
                    description: 'Unlocked the Race Yourself Slimmer mode by running 5km',
                    points: 0,
                    uses: 1,
                    init: function() {
                        e.listen('race.progress', function(event) {
                        	if (progress.total.distance >= config.getWeightUnlockDist() * 1000) {
                                achieve('WeightLoss');
                                game.unlock('WeightLoss');
                            }
                        });
                    },
                    progress: function() {
                    	var unlockDist = config.getWeightUnlockDist() * 1000;
                        return Number(Math.min(unlockDist, progress.total.distance)*100/unlockDist).toFixed(1).replace('.0', '') + '%';
                    }
                },
                'Strength' : {
                    title: 'Race Yourself Faster',
                    description: 'Unlocked the Race Yourself Faster mode by running 10km',
                    points: 0,
                    uses: 1,
                    init: function() {
                        e.listen('race.progress', function(event) {
                        	if (progress.total.distance >= config.getStrengthUnlockDist() * 1000) {
                                achieve('Strength');
                                game.unlock('Strength');
                            }
                        });
                    },
                    progress: function() {
                    	var unlockDist = config.getStrengthUnlockDist() * 1000;
                        return Number(Math.min(unlockDist, progress.total.distance)*100/unlockDist).toFixed(1).replace('.0', '') + '%';
                    }
                },
                // Dedication
                'thrice_weekly' : {
                    title: 'Addict',
                    description: 'Ran three times within a week',
                    points: 1000,
                    uses: Infinity,
                    init: function() {
                        e.listen('race.end', function(event) {
                            if (progress.weekly.races == 3) achieve('thrice_weekly');
                        });
                    },
                    progress: function() {
                        return Number(Math.min(3, progress.weekly.races)*100/3).toFixed(1).replace('.0', '') + '%';
                    }
                }
            },
            STORAGE_KEY = 'achievements',
            flushTimeout = false;

        function save() {
            if (!flushTimeout) setTimeout(saveAchievements, 1000);
        }
        
        function saveAchievements() {
            clearTimeout(flushTimeout);
            flushTimeout = false;
            if (s.add(STORAGE_KEY, {achieved: achieved, progress: progress, version: 1})) {
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
            if (a.uses <= times.length) {
                return;
            }
            
            var now = new Date();
            times.push(now);
            achieved[achievement] = times;
            save();
            settings.addPoints(a.points);
            
            console.log('Achieved ' + achievement + ' on ' + now + ' for the ' + times.length + 'st/nd/th time; total points: ' + settings.getPoints());
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
            var store = s.get(STORAGE_KEY);
            if (store !== null) {
                achieved = store.achieved || {};
                progress = store.progress || {};
            }
            
            var now = new Date();
            progress.daily = progress.daily || {};
            var day = now.getFullYear() + '-' + now.getMonth() + '-' + now.getDate();
            progress.day = progress.day || day;
            
            progress.weekly = progress.weekly || {};
            var week = d.getWeekYear(now) + '-' + d.getWeek(now);
            progress.week = progress.week || week;
            
            progress.monthly = progress.monthly || {};
            var month = now.getFullYear() + '-' + now.getMonth();
            progress.month = progress.month || month;
            
            progress.total = progress.total || {};
            
            // Rotate progress
            if (progress.day != day) progress.daily = {};
            progress.day = day;
            if (progress.week != week) progress.weekly = {};
            progress.week = week;
            if (progress.month != month) progress.monthly = {};
            progress.month = month;
            
            // Counters
            progress.daily.races = progress.daily.races || 0;
            progress.weekly.races = progress.weekly.races || 0;
            progress.monthly.races = progress.monthly.races || 0;
            progress.total.races = progress.total.races || 0;
            progress.daily.distance = progress.daily.distance || 0;
            progress.weekly.distance = progress.weekly.distance || 0;
            progress.monthly.distance = progress.monthly.distance || 0;
            progress.total.distance = progress.total.distance || 0;
            e.listen('race.end', function(event) {
                var race = event.detail;
                
                progress.daily.races++;
                progress.weekly.races++;
                progress.monthly.races++;
                progress.total.races++;
                
                save();
            });
            e.listen('race.progress', function(event) {
                var data = event.detail;
                
                progress.daily.distance += data.distance;
                progress.weekly.distance += data.distance;
                progress.monthly.distance += data.distance;
                progress.total.distance += data.distance;
                
                save();
            });            
                        
            for (var key in ACHIEVEMENTS) {
                if (ACHIEVEMENTS.hasOwnProperty(key)) {
                    ACHIEVEMENTS[key].key = key;
                    ACHIEVEMENTS[key].init();
                }
            }
            
            saveAchievements();
        }

        return {
            init: init,
            getAchievements: getAchievements
        };
    }

});
