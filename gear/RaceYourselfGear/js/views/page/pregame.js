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
    name: 'views/page/pregame',
    requires: [
        'core/event',
        'views/page/racegame',
        'views/page/hrzgame',
        'models/settings',
        'models/game',
        'models/sapRaceYourself'
    ],
    def: function viewsPagePregame(req) {
        'use strict';

        var e = req.core.event,
            page = null,
            game = req.models.game,
            interval = false,
            timeout = false,
            resultTimeout = false,
            provider = req.models.sapRaceYourself;

        function show() {
            gear.ui.changePage('#pregame');
        }

        function onPageShow() {
            var waitingEl = document.getElementById('pregame-waiting-gps'),
            gpsButtonEl = document.getElementById('pregame-skip-gps-btn'),
            lockedEl = document.getElementById('pregame-locked-gps'),
            disabledEl = document.getElementById('pregame-disabled-gps');
                        
            gpsButtonEl.classList.toggle('hidden', true);
        
            setTimeout(function() {
            	gpsButtonEl.classList.toggle('hidden', false);
            }, 3000);
            
            e.listen('tizen.back', onBack);
            
            lockedEl.classList.toggle('hidden', true);
            waitingEl.classList.toggle('hidden', false);
            disabledEl.classList.toggle('hidden', true);
            interval = setInterval(function() {
                document.getElementById('waiting-gps-div').classList.toggle('toggle-on');
            }, 1000);
            
            e.listen('gps.status', onGpsStatus);
            provider.sendGpsStatusReq();
            
            e.fire(game.getCurrentGame()+'.preload');
        }
        
        function onPageHide() {
            clearInterval(interval);
            clearTimeout(timeout);
            clearTimeout(resultTimeout);
            e.die('tizen.back', onBack);
            e.die('gps.status', onGpsStatus);
        }
        
        function onBack() {
        	e.fire('runselect.show');
           // history.back();
        }
        
        function onGpsStatus(ev) {
            var status = ev.detail;
            var waitingEl = document.getElementById('pregame-waiting-gps'),
                lockedEl = document.getElementById('pregame-locked-gps'),
                disabledEl = document.getElementById('pregame-disabled-gps');
        
            waitingEl.classList.toggle('hidden', status != 'enabled');
            lockedEl.classList.toggle('hidden', status != 'ready');
            disabledEl.classList.toggle('hidden', status != 'disabled');
            
            if(resultTimeout)
            	clearTimeout(resultTimeout);
            
            if (status === 'enabled') {
                // Enabled, but not ready yet. Request again after 5s
            	
                resultTimeout = setTimeout(function() {
                    provider.sendGpsStatusReq(); 
                }, 5000);
            }
            
            if(timeout) {
            	clearTimeout(timeout);
            }
            
            if (status === 'ready' || status === 'disabled') {
                timeout = setTimeout(function() {
                    e.fire(game.getCurrentGame()+'.show');                    
                }, 1500);
            }
        }
        
        function onRace(ev) {
            clearTimeout(timeout);
            e.fire(game.getCurrentGame()+'.show');
            ev.preventDefault();
        }
        
        function bindEvents() {
            page.addEventListener('pageshow', onPageShow);
            page.addEventListener('pagehide', onPageHide);
            document.getElementById('pregame-disabled-gps').addEventListener('click', onRace);
            document.getElementById('pregame-locked-gps').addEventListener('click', onRace);
            document.getElementById('pregame-skip-gps-btn').addEventListener('click', onRace);
        }

        function init() {
            page = document.getElementById('pregame');
            bindEvents();
        }

        e.listeners({
            'pregame.show': show
        });

        return {
            init: init
        };
    }

});
