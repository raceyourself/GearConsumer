/*global define, $, console, tizen, webapis*/
/*jslint regexp: true*/

/**
 * Application module
 */

define({
    name: 'models/settings',
    requires: [
        'core/storage',
        'helpers/units'
    ],
    def: function modelsSettings(req) {
        'use strict';

        var s = req.core.storage,
            units = req.helpers.units,
            defaults = {
                unit: units.UNIT_METER,
                distance: 5000,
                time: 30,
                points: 0,
                age: 0,
                zombieTutorial: false,
                firstTimeAge: true
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
        
        function getFirstTimeAge() {
        	if(!isFinite(settings.firstTimeAge)) return defaults.firstTimeAge;
        	return settings.firstTimeAge;
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
        
        function setPoints(points) {
        	settings.points = points;
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
        
        function setFirstTimeAge(firstTimeAge) {
        	settings.firstTimeAge = firstTimeAge;
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
            setPoints: setPoints,
            getAgeRange: getAgeRange,
            setAgeRange: setAgeRange,
            getZombieTutorial: getZombieTutorial,
            setZombieTutorial: setZombieTutorial,
            getFirstTimeAge: getFirstTimeAge,
            setFirstTimeAge: setFirstTimeAge
        };
    }

});
