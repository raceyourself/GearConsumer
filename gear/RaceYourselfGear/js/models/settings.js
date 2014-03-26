/*global define, $, console, tizen, webapis*/
/*jslint regexp: true*/

/**
 * Application module
 */

define({
    name: 'models/settings',
    requires: [
        'core/storage',
        'core/event',
        'helpers/units'
    ],
    def: function modelsSettings(req) {
        'use strict';

        var s = req.core.storage,
            e = req.core.event,
            units = req.helpers.units,
            defaults = {
                unit: units.UNIT_METER,
                distance: 5000,
                time: 30,
                points: 0,
                age: 0,
                zombieTutorial: false,
                eliminatorTutorial: false,
                firstTimeAge: true,
                distanceunits: 'Km',
                paceunits: 'Min/km',
                currentTarget: "",
                audioActive: true,
                vibrateActive: true
            },
            settings = {},
            STORAGE_KEY = 'settings';

        /**
         * Returns unit.
         * @return {string} unit
         */
        function getUnit() {
            return settings.unit;
        }
        
        function getDistance() {
            if (!isFinite(settings.distance)) return defaults.distance;
            return settings.distance;
        }

        function getTime() {
            if (!isFinite(settings.time)) return defaults.time;
            return settings.time;
        }
        
        function getPoints() {
        	if(!isFinite(settings.points)) return defaults.points;
        	return settings.points;
        }
        
        function getAgeRange() {
        	if(!isFinite(settings.age)) return defaults.age;
        	return settings.age;
        }
        
        function getZombieTutorial() {
        	if(!isFinite(settings.zombieTutorial)) return defaults.zombieTutorial;
        	return settings.zombieTutorial;
        }
        
        function getEliminatorTutorial() {
        	if(!isFinite(settings.eliminatorTutorial)) return defaults.eliminatorTutorial;
        	return settings.eliminatorTutorial;
        }
        
        function getFirstTimeAge() {
        	if(!isFinite(settings.firstTimeAge)) return defaults.firstTimeAge;
        	return settings.firstTimeAge;
        }
        
        function getDistanceUnits() {
        	return settings.distanceunits;
        }
        
        function getPaceUnits() {
        	return settings.paceunits;
        }
        
        function getCurrentTarget() {
        	return settings.currentTarget;
        }
        
        function getAudioActive() {
        	if(!isFinite(settings.audioActive)) return defaults.audioActive;
        	return settings.audioActive;
        }
        
        function getVibrateActive() {
        	if(!isFinite(settings.vibrateActive)) return defaults.vibrateActive;
        	return settings.vibrateActive;
        }
        
        function saveSettings() {
            if (s.add(STORAGE_KEY, settings)) {
                return true;
            }
            return false;
        }

        /**
         * Sets unit.
         * @param {string} value
         */
        function setUnit(value) {
            settings.unit = value;
            return saveSettings();
        }

        function setDistance(distance) {
            settings.distance = distance;
            return saveSettings();
        }
        
        function setTime(time) {
            settings.time = time;
            return saveSettings();
        }
        
        function setAgeRange(age) {
        	settings.age = age;
        	return saveSettings();
        }
        
        function setZombieTutorial(zombieTutorial) {
        	settings.zombieTutorial = zombieTutorial;
        	return saveSettings();
        }
        
        function setEliminatorTutorial(eliminatorTutorial) {
        	settings.eliminatorTutorial = eliminatorTutorial;
        	return saveSettings();
        }
        
        function setFirstTimeAge(firstTimeAge) {
        	settings.firstTimeAge = firstTimeAge;
        	return saveSettings();
        }
        
        function setDistanceUnits(distanceunits) {
        	settings.distanceunits = distanceunits;
        	return saveSettings();
        }
        
        function setPaceUnits(paceunits) {
        	settings.paceunits = paceunits;
        	return saveSettings();
        }
        
        function setCurrentTarget(target) {
        	settings.currentTarget = target;
        }
        
        function setAudioActive(audio) {
        	settings.audioActive = audio;
        	return saveSettings();
        }
        
        function setVibrateActive(vibrate) {
        	settings.vibrateActive = vibrate;
        	return saveSettings();
        }
        
        function addPoints(points) {
            // TODO: Move points to a separate model?
            var currentPoints = settings.points += points;
            if (currentPoints < 0) currentPoints = 0; // Clamped
            e.fire('points.change', {previous: settings.points, current: currentPoints, delta: points});
            settings.points = currentPoints;            
            return saveSettings();
        }
        
        /**
         * Initializes module.
         */
        function init() {
            settings = s.get(STORAGE_KEY);
            if (settings === null) {
                settings = defaults;
                saveSettings();
            }
        }

        return {
            init: init,
            getUnit: getUnit,
            setUnit: setUnit,
            getDistance: getDistance,
            setDistance: setDistance,
            getTime: getTime,
            setTime: setTime,
            getPoints: getPoints,
            addPoints: addPoints,
            getAgeRange: getAgeRange,
            setAgeRange: setAgeRange,
            getZombieTutorial: getZombieTutorial,
            setZombieTutorial: setZombieTutorial,
            getEliminatorTutorial: getEliminatorTutorial,
            setEliminatorTutorial: setEliminatorTutorial,
            getFirstTimeAge: getFirstTimeAge,
            setFirstTimeAge: setFirstTimeAge,
            getDistanceUnits: getDistanceUnits,
            setDistanceUnits: setDistanceUnits,
            getPaceUnits: getPaceUnits,
            setPaceUnits: setPaceUnits,
            getCurrentTarget: getCurrentTarget,
            setCurrentTarget: setCurrentTarget,
            getAudioActive: getAudioActive,
            setAudioActive: setAudioActive,
            getVibrateActive: getVibrateActive,
            setVibrateActive: setVibrateActive
        };
    }

});
