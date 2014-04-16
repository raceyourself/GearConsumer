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

/*global define, $, console, window, history, document*/

/**
 * Main page module
 */

define({
    name: 'views/page/no-hrm',
    requires: [
        'core/event',
        'models/hrm',
        'models/mocks/hrm',
        'models/game',
        'models/config',
        'models/application'
    ],
    def: function viewsPageNoHeartRateMonitor(req) {
        'use strict';

        var e = req.core.event,
            hrm = req.models.hrm,
            hrmMock = req.models.mocks.hrm,
            config = req.models.config,
            game = req.models.game,
            app = req.models.application,
            pregameCheckInterval = false,
            buttonToggleTimeout = false,
            hrmStatusImg,
            MIN_MEASURE_TIME = 5000,
            page = null;

        function show() {
            gear.ui.changePage('#no-hrm');            
        }
        
        function onPageShow() {
            e.listen('tizen.back', onBack);
            
            hrmStatusImg.src = 'images/hrm_measuring.png';
            
            var skipButtonEl = document.getElementById('no-hrm-skip-btn');
            
            skipButtonEl.classList.toggle('hidden', true);
            skipButtonEl.addEventListener('click', onSkipClick);
            
            if(buttonToggleTimeout) {
            	clearTimeout(buttonToggleTimeout);
            }
            buttonToggleTimeout = setTimeout(function() {
            	skipButtonEl.classList.toggle('hidden', false);
            }, MIN_MEASURE_TIME + 2000);
            
            var measureStart = Date.now();
            if(pregameCheckInterval) {
            	clearInterval(pregameCheckInterval);
            }
            pregameCheckInterval = setInterval(function() {
            	if(hrm.isFunctioning()) {
                    e.fire(game.getCurrentGame()+'.show');
                }
            	if (hrm.isStarted() && !hrm.isFunctioning() && Date.now() > measureStart + MIN_MEASURE_TIME) {
                    hrmStatusImg.src = 'images/hrm_none.png';
            	}
            	if (!hrm.isStarted() || hrm.getError()) {
                    hrmStatusImg.src = 'images/hrm_error.png';
            	}
            }, 1000);
                        
            e.fire(game.getCurrentGame()+'.preload');
            
            if (hrm.isStarted() && !hrm.isFunctioning()) {
            	console.warn("No-HRM: Restarting HRM!");
            	hrm.stop();
            }
            
            if(!config.getIsDemoMode())
            {
				if (hrm.isAvailable()) {
					hrm.start();
					// Availability will change if start fails
					console.log('No-HRM: Starting HRM in Normal Mode');
				} 
            } else {
                e.fire(game.getCurrentGame()+'.show');
            }
        }

        function onSkipClick(ev) {
            if (hrm.isStarted() && !hrm.isFunctioning()) {
            	hrm.stop();
            }
            
            if(!config.getIsDemoMode())
            {
				if (hrm.isAvailable()) {
					hrm.start();
					// Availability will change if start fails
					console.log('No-HRM: Starting HRM in Normal Mode');
				} 
				// Allow mock fallback when on device
				if (!hrm.isAvailable() && !app.onDevice()) {
	            	hrmMock.start();
					console.log('No-HRM: HRM not available. Starting mock HRM in Random Mode');
				}
            }                       
        	
            e.fire(game.getCurrentGame()+'.show');
            ev.preventDefault();
        }
        
        function onPageHide() {
            e.die('tizen.back', onBack);
            
            if(pregameCheckInterval) {
            	clearInterval(pregameCheckInterval);
            }            
            
            if(buttonToggleTimeout) {
            	clearTimeout(buttonToggleTimeout);
            }
        }
        
        function onBack() {
            e.fire('newmain.show');
        }

        function bindEvents() {
            page.addEventListener('pageshow', onPageShow);
            page.addEventListener('pagehide', onPageHide);
        }

        function init() {
            page = document.getElementById('no-hrm');
            hrmStatusImg = document.getElementById('hrm-status-img');            
            bindEvents();
        }
        
        e.listeners({
            'no-hrm.show': show
        });
        
        return {
            init: init
        };
    }

});
