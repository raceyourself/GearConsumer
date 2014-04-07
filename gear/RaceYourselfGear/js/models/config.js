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
        		version: 0,
                hrSmoothing: 0,				// 0 = no smoothing, 1 = extreme smoothing
                sprintDuration: 30, 		//seconds
                recoverDuration: 30,		//seconds
                warningPeriod: 10,			//seconds outside of HR zone before zombies start closing
                adaptPeriod: 10,			//seconds after change of zone before zombies can close
                warmupPeriod: 5*60,			//seconds
                dinoUnlockDist: 20,			//km
                catchupTime: 500,			//num ticks for zombies to catch up                
                lapLength: 100,  
                elimUnlockDist: 50,
                weightUnlockDist: 5,
                strengthUnlockDist: 10,
                demoMode: 0,
                ppmGood: 5,
                ppmBad: -1,
                pointsPenaltyDeath: -100,
                pointsBonusFinish: 50,
            	thresholdOneStar: 0.1,
            	thresholdTwoStar: 0.3,
            	thresholdThreeStar: 0.6

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
		
		function getElimUnlockDist() {
			if(!isFinite(config.elimUnlockDist)) return defaults.elimUnlockDist;
			return config.elimUnlockDist;
		}
		
		function getWeightUnlockDist() {
			if(!isFinite(config.weightUnlockDist)) return defaults.weightUnlockDist;
			return config.weightUnlockDist;
		}
		
		function getStrengthUnlockDist() {
			if(!isFinite(config.strengthUnlockDist)) return defaults.strengthUnlockDist;
			return config.strengthUnlockDist;
		}
		
		function getCatchupTime() {
			if(!isFinite(config.catchupTime)) return defaults.catchupTime;
			return config.catchupTime;
		}
		
		function getLapLength() {
			if(!isFinite(config.lapLength)) return defaults.lapLength;
			return config.lapLength;
		}
        
        function getIsDemoMode() {
        	if(!isFinite(config.demoMode)) return defaults.demoMode>0;
        	return config.demoMode>0;
		}
		
		function getPpmGood() {
			if(!isFinite(config.ppmGood)) return defaults.ppmGood;
			return config.ppmGood;
		}

		function getPpmBad() {
			if(!isFinite(config.ppmBad)) return defaults.ppmBad;
			return config.ppmBad;
		}

		function getPointsPenaltyDeath() {
			if(!isFinite(config.pointsPenaltyDeath)) return defaults.pointsPenaltyDeath;
			return config.pointsPenaltyDeath;
		}
		
		function getPointsBonusFinish() {
			if(!isFinite(config.pointsBonusFinish)) return defaults.pointsBonusFinish;
			return config.pointsBonusFinish;
		}
        
        function saveConfig(configuration) {
            if (s.add(STORAGE_KEY, configuration)) {
                return true;
            }
            return false;
        }		
		
        function onConfigurationUpdate(event) {
        	var configuration = event.detail;
        	saveConfig(configuration);
        }
        
        
        /**
         * Initializes module.
         */
        function init() {
            config = s.get(STORAGE_KEY);
            if (config === null) {
                config = defaults;
            }
            e.listen('configuration.update', onConfigurationUpdate);
        }

        return {
            init: init,
            getHrSmoothing : getHrSmoothing,
            getSprintDuration : getSprintDuration,
            getRecoverDuration : getRecoverDuration,
            getWarningPeriod : getWarningPeriod,
            getAdaptPeriod : getAdaptPeriod,
            getWarmupPeriod : getWarmupPeriod,
            getDinoUnlockDist : getDinoUnlockDist,
            getCatchupTime : getCatchupTime,
            getElimUnlockDist: getElimUnlockDist,
            getWeightUnlockDist: getWeightUnlockDist,
            getStrengthUnlockDist: getStrengthUnlockDist,
            getLapLength : getLapLength, 
            getIsDemoMode : getIsDemoMode,
            getPpmGood : getPpmGood,
            getPpmBad : getPpmBad,
            getPointsPenaltyDeath : getPointsPenaltyDeath,
            getPointsBonusFinish : getPointsBonusFinish
        };
    }

});
