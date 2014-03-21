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
            provider = req.models.sapRaceYourself,
            settings = req.models.settings,
            _goal = "",
            ongoingRace = null,
            history = [];
        
        function newRace() {
            if (!!ongoingRace) history.unshift(ongoingRace);
            ongoingRace = new Race();
            e.fire('race.new');
            return ongoingRace;
        }
        
        function getOngoingRace() {
            return ongoingRace;
        }        
        
        function getRaceHistory() {
            return history;
        }
        
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
            this.track = [];
            this.running = false;
            this.stopped = false;
            this.pointsEarned = 0;
            this.pointsLost = 0;
            this.achievements = [];
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
                this.stopped = true;
            },
            
            isRunning: function isRunning() {
                return this.running;
            },
            
            hasStopped: function hasStopped() {
                return this.stopped;
            },
            
            getDistance: function getDistance() {
                return this.distance;
            },
            
            getDuration: function getDuration() {
                if (this.running === false) return this.duration;
                return Date.now() - this.startDate;
            },
            
            getSpeed: function getSpeed() {            
                return this.speed;
            },
            
            getPace: function getPace() {
                return 1/(this.speed/60); // km/h -> min/km
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
            },
            
            getAchievements: function getAchievements() {
                return this.achievements;
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
            
            ongoingRace.steps = pedometerInfo.totalStep - ongoingRace.initialSteps;
            ongoingRace.calories = pedometerInfo.calorie - ongoingRace.initialCalories;
            
            // only update speed and distance if we've not had a GPS fix for at least 2000ms
            if (ongoingRace.lastGpsTimestamp == null || (new Date().getTime() - ongoingRace.lastGpsTimestamp) > 2000) {
                ongoingRace.speed = pedometerInfo.speed;
                var positionDelta = (pedometerInfo.distance - ongoingRace.lastPedometerDistance);
                if (positionDelta < 0) positionDelta = 0;
                ongoingRace.distance += positionDelta;
                
                if (ongoingRace.distance - ongoingRace.progressSnapshot.distance > 100) ongoingRace.triggerProgress(); 
            }
            ongoingRace.lastPedometerDistance = pedometerInfo.distance; // update for next loop
            
            if (step) {
                ongoingRace.track.push({distance: ongoingRace.getDistance(), time: ongoingRace.getDuration()});
                e.fire('pedometer.step');
                e.fire('gpsUpdateOff');
            }            
        }
        
        function onGpsLocation(event) {
            console.log('gps');
            var message = event.detail;
            console.log(message);
            var distance = message.GPS_DISTANCE;  // cumulative distance covered whilst tracking
            console.log(distance);
            var time = message.GPS_TIME;    // cumulative time spent tracking in milliseconds
            console.log(time);
            var speed = message.GPS_SPEED;  // current speed in metres per second
            console.log(speed);
            var state = message.GPS_STATE;  // string describing stopped / accelerating / steady speed etc
            console.log(state);
            
            if (ongoingRace == null || !ongoingRace.isRunning()) return;

            // init on first loop
            var currentTimestamp = new Date().getTime();
            if (ongoingRace.lastGpsDistance === null) ongoingRace.lastGpsDistance = distance;
            if (ongoingRace.lastGpsTimestamp == null) ongoingRace.lastGpsTimestamp = currentTimestamp;
            
            // if we're getting regular GPS updates, use them for speed and distance:
            if (currentTimestamp - ongoingRace.lastGpsTimestamp <= 2000) {
                ongoingRace.speed = speed;
                var positionDelta = (distance - ongoingRace.lastGpsDistance);
                ongoingRace.distance += positionDelta;
                
                if (ongoingRace.distance - ongoingRace.progressSnapshot.distance > 100) ongoingRace.triggerProgress(); 
                
                // fire pedometer.step to update UI
                ongoingRace.track.push({distance: ongoingRace.getDistance(), time: ongoingRace.getDuration()});
                e.fire('pedometer.step');
                e.fire('gpsUpdateOn');  
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
            getRaceHistory: getRaceHistory,
            setGoal: setGoal,
            getGoal: getGoal
        };
        
        
    }

});
