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
            ongoingRace = null;
        
        function newRace() {
            ongoingRace = new Race();
            e.fire('race.new');
            return ongoingRace;
        }
        
        function getOngoingRace() {
            return ongoingRace;
        }        
        
        /**
         * Constructor
         */
        function Race() {
            this.startDate = null;
            this.duration = null;
            this.initialDistance = null;
            this.distance = 0; // meters
            this.speed = 0; // km/h
            this.initialSteps = null;
            this.steps = 0;
            this.track = [];
            this.running = false;
            this.stopped = false;
        }
        Race.prototype = {
            start: function start() {
            	console.log('listener added');
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
            },
            
            stop: function stop() {
            	console.log('listener removed');
            	if(this.running && !this.stopped) {
            		e.die('pedometer.change', onPedometerInfoChange);
            	}
                
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
            }
            
        };
        
        function onPedometerInfoChange(param) {
            if (ongoingRace == null || !ongoingRace.isRunning()) return;
            var pedometerInfo = param.detail;

            if (ongoingRace.initialSteps === null) ongoingRace.initialSteps = pedometerInfo.totalStep;
            if (ongoingRace.initialDistance === null) ongoingRace.initialDistance = pedometerInfo.distance;
            
            var step = false;
            if (pedometerInfo.totalStep !== ongoingRace.steps) step = true;
            
            ongoingRace.steps = pedometerInfo.totalStep - ongoingRace.initialSteps;
            ongoingRace.speed = pedometerInfo.speed;
            ongoingRace.distance = pedometerInfo.distance - ongoingRace.initialDistance;            
            
            if (step) {
                ongoingRace.track.push({distance: ongoingRace.getDistance(), time: ongoingRace.getDuration()});
                e.fire('pedometer.step');
            }
        }
        
        function onGpsLocation(e) {
            console.log('gps');
            var message = e.detail;
            console.log(message);
            var distance = message.GPS_DISTANCE;  // cumulative distance covered whilst tracking
            console.log(distance);
            var time = message.GPS_TIME;    // cumulative time spent tracking in milliseconds
            console.log(time);
            var speed = message.GPS_SPEED;  // current speed in metres per second
            console.log(speed);
            var state = message.GPS_STATE;  // string describing stopped / accelerating / steady speed etc
            console.log(state);
        }
        
        return {
            newRace: newRace,
            getOngoingRace: getOngoingRace
        };
    }

});
