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
    name: 'views/page/no-bluetooth',
    requires: [
        'core/event',
        'models/sapRaceYourself',
        'models/game',
        'models/sap',
        'views/page/pregame',
        'views/page/hrzgame'
    ],
    def: function viewsPageNoBluetooth(req) {
        'use strict';

        var e = req.core.event,
            provider = req.models.sapRaceYourself,
            game = req.models.game,
            sap = req.models.sap,
            pregameCheckInterval = false,
            sapConnectInterval = false,
            buttonToggleTimeout = false,
            page = null;

        function show() {
            gear.ui.changePage('#no-bluetooth');            
        }
        
        function onPageShow() {
            e.listen('tizen.back', onBack);
            
            var skipButtonEl = document.getElementById('no-bluetooth-skip-btn');
            
            skipButtonEl.classList.toggle('hidden', true);
            skipButtonEl.addEventListener('click', onSkipClick);
            
            if(buttonToggleTimeout) {
            	clearTimeout(buttonToggleTimeout);
            }
            buttonToggleTimeout = setTimeout(function() {
            	skipButtonEl.classList.toggle('hidden', false);
            }, 3000);
            
            sap.connect();
            
            if(pregameCheckInterval) {
            	clearInterval(pregameCheckInterval);
            }
            pregameCheckInterval = setInterval(function() {
            	if(sap.isConnected() || !sap.isAvailable()) {
                	e.fire('pregame.show');
                }
            }, 1000);
                        
            e.fire(game.getCurrentGame()+'.preload');
        }

        function onSkipClick(ev) {
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
            history.back();
        }

        function bindEvents() {
            page.addEventListener('pageshow', onPageShow);
            page.addEventListener('pagehide', onPageHide);
        }

        function init() {
            page = document.getElementById('no-bluetooth');
            bindEvents();
        }
        
        e.listeners({
            'no-bluetooth.show': show
        });
        
        return {
            init: init
        };
    }

});
