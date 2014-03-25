/*global define, $, console, tizen, webapis*/
/*jslint regexp: true*/

/**
 * Application module
 */

define({
    name: 'models/config',
    requires: [
        'core/storage',
        'core/event',
        'helpers/units'
    ],
    def: function modelsConfig(req) {
        'use strict';

        var s = req.core.storage,
            e = req.core.event,
            units = req.helpers.units,
            defaults = {
                hrSmoothing: 0,				// 0 = no smoothing, 1 = extreme smoothing
                sprintDuration: 30, 		//seconds
                recoverDuration: 30,		//seconds
                warningPeriod: 10,			//seconds outside of HR zone before zombies start closing
                adaptPeriod: 10,				//seconds after change of zone before zombies can close
                warmupPeriod: 5*60,			//seconds
                dinoUnlockDist: 20,			//km
                catchupTime: 500			//num ticks for zombies to catch up
                 
                
            },
            config = {},
            STORAGE_KEY = 'config';

        /**
         * Returns unit.
         * @return {string} unit
         */
        function getHrSmoothing() {
			if (!isFinite(config.hrSmoothing)) return defaults.hrSmoothing;
            return config.hrSmoothing;
        }
        
        function getSprintDuration() {
        	if (!isFinite(config.sprintDuration)) return defaults.sprintDuration;
        	return config.sprintDuration;
		}

		function getRecoverDuration() {
			if(!isFinite(config.recoverDuration)) return defaults.recoverDuration;
			return config.recoverDuration;
		}

		function getWarningPeriod() {
			if(!isFinite(config.warningPeriod)) return defaults.warningPeriod;
			return config.warningPeriod;
		}			

		function getAdaptPeriod() {
			if(!isFinite(config.adaptPeriod)) return defaults.adaptPeriod;
			return config.adaptPeriod;
		}

		function getWarmupPeriod() {
			if(!isFinite(config.warmupPeriod)) return defaults.warmupPeriod;
			return config.warmupPeriod;
		}

		function getDinoUnlockDist() {
			if(!isFinite(config.dinoUnlockDist)) return defaults.dinoUnlockDist;
			return config.dinoUnlockDist;
		}
		
		function getCatchupTime() {
			if(!isFinite(config.catchupTime)) return defaults.catchupTime;
			return config.catchupTime;
		}
        
        function saveConfig() {
            if (s.add(STORAGE_KEY, config)) {
                return true;
            }
            return false;
        }

        /**
         * Sets unit.
         * @param {string} value
         */
        function setHrSmoothing(value) {
        	config.hrSmoothing = value;
        	return saveConfig();
        }

		function setSprintDuration(value) {
			config.sprintDuration = value;
			return saveConfig();
		}

		function setRecoverDuration(value) {
			config.recoverDuration = value;
			return saveConfig();
		}

		function setWarningPeriod(value) {
			config.warningPeriod = value;
			return saveConfig();
		}
		
		function setAdaptPeriod(value) {
			config.adaptPeriod = value;
			return saveConfig();
		}		
		
		function setWarmupPeriod(value) {
			config.warmupPeriod = value;
			return saveConfig();
		}
		
		function setDinoUnlockDist(value) {
			config.dinoUnlockDist = value;
			return saveConfig();
		}
		
		function setCatchupTime(value) {
			config.catchupTime = value;
			return saveConfig();
		}
		
		
        /**
         * Initializes module.
         */
        function init() {
            config = s.get(STORAGE_KEY);
            if (config === null) {
                config = defaults;
                saveConfig();
            }
        }

        return {
            init: init,
            getHrSmoothing : getHrSmoothing,
            setHrSmoothing : setHrSmoothing,
            getSprintDuration : getSprintDuration,
            setSprintDuration : setSprintDuration,
            getRecoverDuration : getRecoverDuration,
            setRecoverDuration : setRecoverDuration,
            getWarningPeriod : getWarningPeriod,
            setWarningPeriod : setWarningPeriod,
            getAdaptPeriod : getAdaptPeriod,
            setAdaptPeriod : setAdaptPeriod,
            getWarmupPeriod : getWarmupPeriod,
            setWarmupPeriod : setWarmupPeriod,
            getDinoUnlockDist : getDinoUnlockDist,
            setDinoUnlockDist : setDinoUnlockDist,
            getCatchupTime : getCatchupTime,
            setCatchupTime : setCatchupTime,
            
        };
    }

});
