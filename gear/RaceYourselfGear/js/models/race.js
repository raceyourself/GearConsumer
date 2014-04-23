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
    name: 'models/race',
    requires: [
        'core/event',
        'core/storage',
        'models/game',
        'models/settings',
        'models/racedata',
        'models/mocks/pedometer',
        'models/pedometer',
        'models/sapRaceYourself',
        'helpers/units'
    ],
    def: function modelsRace(req) {
        'use strict';

        var e = req.core.event,
            s = req.core.storage,
            pedometer = req.models.pedometer,
            mock = req.models.mocks.pedometer,
            game = req.models.game,
            racedata = req.models.racedata,
            provider = req.models.sapRaceYourself,
            settings = req.models.settings,
            units = req.helpers.units,
            _goal = "",
            lastThousand = 0,
            ongoingRace = null,
            history = [],
            STORAGE_KEY = 'history';
        
       
        
        function newRace() {
            if (!!ongoingRace) history.unshift(ongoingRace);
            //saveHistory();
            ongoingRace = new Race();
            e.fire('race.new');
            return ongoingRace;
        }
        
        function getOngoingRace() {
            return ongoingRace;
        }        
        
//        function getRaceHistory() {
//            return s;
//        }
        
        /**
         * Constructor
         */
        function Race() {
            this.startDate = null;
            this.duration = null;
            this.lastPedometerDistance = null;
            this.lastGpsDistance = null;
            this.lastGpsTimestamp = null;
            this.distance = 0; // meters
            this.speed = 0; // km/h
            this.goal = _goal;
            this.initialSteps = null;
            this.steps = 0;
            this.initialCalories = null;
            this.calories = 0;
            this.score = null;
            this.ishighscore = false;
            this.track = [];
            this.raceType = game.getCurrentGame();
            this.opponentType = game.getCurrentOpponentType();
            this.running = false;
            this.stopped = false;
            this.pointsEarned = 0;
            this.pointsLost = 0;            
            this.achievements = [];
            this.gps_updates = 0;
            this.pedometer_updates = 0;
            this.data = {}; // Game-specific race data
            this.triggerProgress();
        }
        Race.prototype = {
            start: function start() {
                e.listen('pedometer.change', onPedometerInfoChange);
                e.listen('gps.location', onGpsLocation);
                if (pedometer.isAvailable()) {
                    pedometer.start();
                } else {
                    // Mock
                    console.log('Using mock pedometer');
                    window.webapis.pedometer.setChangeListener(pedometer._handlePedometerInfo);
                }
                if (provider.isAvailable()) provider.sendStartTrackingReq();
                var ld = pedometer.getLastData();
                if (ld != null && ld.length > 0) {
                    this.initiaDistance = ld.distance;
                    this.initialStesp = ld.totalStep();
                }
                this.startDate = Date.now();
                this.running = true;
                e.fire('race.start');
            },
            
            stop: function stop() {
                if (!this.running) return;
                e.die('pedometer.change', onPedometerInfoChange);
                e.die('gps.location', onGpsLocation);
                if (provider.isAvailable()) provider.sendStopTrackingReq();
                if (pedometer.isAvailable()) {
                    pedometer.stop();
                } else {
                    window.webapis.pedometer.unsetChangeListener(pedometer._handlePedometerInfo);
                }
                this.duration = this.getDuration();
                this.running = false;
                
                racedata.setData(this);
                //saveHistory();
                this.stopped = true;
            },
            
            isRunning: function isRunning() {
                return this.running;
            },
            
            hasStopped: function hasStopped() {
                return this.stopped;
            },
            
            getDistance: function getDistance() {
                if(settings.getDistanceUnits() == 'Miles') {
                    return this.getImperialDistance();
                } else {
                    return this.getMetricDistance();
                }                
            },

            getDistanceUnits: function getDistanceUnits() {
                if(settings.getDistanceUnits() == 'Miles') {
                    return "miles";
                } else {
                    return "meters";
                }
            },
            
            getIsHighscore: function getIsHighscore() {
            	return this.ishighscore;
            },
            
            getScore: function getScore() {
            	return this.score;
            },
            
            setScore: function setScore(s) {
            	this.score = s;
            },
            
            setIsHighscore: function setIsHighscore(s) {
            	this.ishighscore = s;
            },

            getShortDistanceUnits: function getShortDistanceUnits() {
                if(settings.getDistanceUnits() == 'Miles') {
                    return "mi";
                } else {
                    return "m";
                }
            },

            getMetricDistance: function getMetricDistance() {
                return Math.max(0, this.distance); // meters
            },
            
            getImperialDistance: function getImperialDistance() {
                return Math.max(0, units.getMiles(this.distance)/1000); // miles
            },
                        
            getDuration: function getDuration() {
                if (this.running === false) return this.duration;
                return Date.now() - this.startDate;
            },
            
            getStartDate: function getStartDate() {
            	return this.startDate;
            },
            
            getSpeed: function getSpeed() {            
                if(settings.getDistanceUnits() == 'Miles') {
                    return this.getImperialSpeed();
                } else {
                    return this.getMetricSpeed();
                }
            },
            
            getSpeedUnits: function getSpeedUnits() {
                if(settings.getDistanceUnits() == 'Miles') {
                    return "mph";
                } else {
                    return "km/h";
                }                
            },
            
            getMetricSpeed: function getMetricSpeed() {            
                return this.speed;
            },
            
            getImperialSpeed: function getImperialSpeed() {
                return units.getMiles(this.speed);
            },
            
            getPace: function getPace() {
                if(settings.getDistanceUnits() == 'Miles') {
                    return this.getImperialPace();
                } else {
                    return this.getMetricPace();
                }
            },
            
            getPaceUnits: function getPaceUnits() {
                if(settings.getDistanceUnits() == 'Miles') {
                    return "min/mile";
                } else {
                    return "min/km";
                }                
            },
            
            getMetricPace: function getMetricPace() {
                return 1/(this.getMetricSpeed()/60); // km/h -> min/km
            },
            
            getImperialPace: function getImperialPace() {
                return 1/(this.getImperialSpeed()/60); // mph -> min/mile
            },
            
            getSteps: function getSteps() {
                return this.steps;
            },
            
            getCalories: function getCalories() {
                return this.calories;
            },
            
            getGoal: function getGoal() {
            	return this.goal;
            },
            
            setGoal: function setGoal(goal) {
            	console.log(goal);
            	this.goal = goal;
            },
            
            getPointsEarned: function getPointsEarned() {
                return this.pointsEarned;
            },
            
            getPointsLost: function getPointsLost() {
                return this.pointsLost;
            },
            
            getPoints: function getPoints() {
                return this.pointsEarned - this.pointsLost;
            },
            
            addPoints: function addPoints(delta) {
                if (delta > 0) this.pointsEarned += delta;
                if (delta < 0) this.pointsLost -= delta;
                
                // TODO: Clamp delta so you don't get below your pre-race points?
                settings.addPoints(delta); 
                if(settings.getPoints() > lastThousand) {
                	lastThousand += 1000;
                	var points = {points: settings.getPoints()};
                	e.fire('race.progress', points);
                }
            },
            
            getAchievements: function getAchievements() {
                return this.achievements.slice(0);
            },
            
            getCurrentOpponentType: function getCurrentOpponentType() {
            	return this.opponentType;
            },
            
            setCurrentOpponentType: function setCurrentOpponentType(opponent) {
            	this.opponentType = opponent;
            },
            
            getRaceType: function getRaceType() {
            	return this.raceType;
            },
            
            setRaceType: function setRaceType(type) {
            	this.raceType = type;
            },
            
            getGpsPercentage: function getGpsPercentag() {
            	if (this.gps_updates == 0 && this.pedometer_updates == 0) return 100;
            	return (this.gps_update*100/(this.gps_updates+this.pedometer_updates));
            },
            
            triggerProgress: function triggerProgress() {
                var lastSnapshot = this.progressSnapshot || {
                    distance: 0,
                    steps: 0,
                    calories: 0
                };
                this.progressSnapshot = {
                        distance: this.distance,
                        steps: this.steps,
                        calories: this.calories
                }
                if (lastSnapshot.distance != this.progressSnapshot.distance
                    || lastSnapshot.steps != this.progressSnapshot.steps
                    || lastSnapshot.calories != this.progressSnapshot.calories) {
                    var progress = {
                            distance: this.progressSnapshot.distance - lastSnapshot.distance,
                            steps: this.progressSnapshot.steps - lastSnapshot.steps,
                            calories: this.progressSnapshot.calories - lastSnapshot.calories
                    }
                    e.fire('race.progress', progress);
                }
                    
            }
        };
        
        function onPedometerInfoChange(param) {
            if (ongoingRace == null || !ongoingRace.isRunning()) return;
            var pedometerInfo = param.detail;

            if (ongoingRace.initialSteps === null) ongoingRace.initialSteps = pedometerInfo.totalStep;
            if (ongoingRace.lastPedometerDistance === null) ongoingRace.lastPedometerDistance = pedometerInfo.distance;
            if (ongoingRace.initialCalories === null) ongoingRace.initialCalories = pedometerInfo.calorie;
            
            var step = false;
            if (pedometerInfo.totalStep !== ongoingRace.steps) step = true;
            
            
            ongoingRace.steps = Math.max(0, pedometerInfo.totalStep - ongoingRace.initialSteps);
            ongoingRace.calories = Math.max(0, pedometerInfo.calorie - ongoingRace.initialCalories);
            
            // only update speed and distance if we've not had a GPS fix for at least 2000ms
            if (ongoingRace.lastGpsTimestamp == null || (new Date().getTime() - ongoingRace.lastGpsTimestamp) > 2000) {
                ongoingRace.speed = pedometerInfo.speed;
                var positionDelta = (pedometerInfo.distance - ongoingRace.lastPedometerDistance);
                if (positionDelta < 0) positionDelta = 0;
                ongoingRace.distance += positionDelta;
                
                if (ongoingRace.distance - ongoingRace.progressSnapshot.distance > 100) ongoingRace.triggerProgress();
                
                if (step) {
                ongoingRace.track.push({distance: ongoingRace.getMetricDistance(), time: ongoingRace.getDuration()});
                    e.fire('pedometer.step');
                    e.fire('gpsUpdateOff');
                    ongoingRace.pedometer_updates++;
               }
            }
            ongoingRace.lastPedometerDistance = pedometerInfo.distance; // update for next loop
        }
        
        function onGpsLocation(event) {
            var message = event.detail;
            var distance = message.GPS_DISTANCE;  // cumulative distance covered whilst tracking
            var time = message.GPS_TIME;    // cumulative time spent tracking in milliseconds
            var speed = message.GPS_SPEED;  // current speed in metres per second
            var state = message.GPS_STATE;  // string describing stopped / accelerating / steady speed etc
            
            if (ongoingRace == null || !ongoingRace.isRunning()) return;

            // init on first loop
            var currentTimestamp = new Date().getTime();
            if (ongoingRace.lastGpsDistance === null) ongoingRace.lastGpsDistance = distance;
            if (ongoingRace.lastGpsTimestamp == null) ongoingRace.lastGpsTimestamp = currentTimestamp;
            
            if (currentTimestamp - ongoingRace.lastGpsTimestamp <= 2000) {
            	// if we're getting regular GPS updates, use them for speed and distance:
                ongoingRace.speed = speed*3.6;  // convert m/s (GPS) into km/hr (rest of this app)
                var positionDelta = (distance - ongoingRace.lastGpsDistance);
                ongoingRace.distance += positionDelta;
                
                if (ongoingRace.distance - ongoingRace.progressSnapshot.distance > 100) ongoingRace.triggerProgress(); 
                
                // fire pedometer.step to update UI
                ongoingRace.track.push({distance: ongoingRace.getMetricDistance(), time: ongoingRace.getDuration()});
                e.fire('pedometer.step');
                e.fire('gpsUpdateOn');  
                ongoingRace.gps_updates++;                
            }
            
            ongoingRace.lastGpsTimestamp = currentTimestamp;
            ongoingRace.lastGpsDistance = distance;
        }
        
        function onAchievement(event) {
            if (ongoingRace == null) return;
            
            var achievement = event.detail.achievement;
            ongoingRace.achievements.unshift(achievement);
        }
        
        function getGoal() {
        	return _goal;
        }
        
        function setGoal(goal) {
        	console.log(goal);
        	_goal = goal;
        }
        
        e.listeners({
            'achievement.awarded': onAchievement
        });
        
        return {
            newRace: newRace,
            getOngoingRace: getOngoingRace,
            setGoal: setGoal,
            getGoal: getGoal
        };
        
        
    }

});
