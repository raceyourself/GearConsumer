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
            provider = req.models.sapRaceYourself;

        function show() {
            gear.ui.changePage('#pregame');
        }

        function onPageShow() {
            var waitingEl = document.getElementById('pregame-waiting-gps'),
            lockedEl = document.getElementById('pregame-locked-gps'),
            disabledEl = document.getElementById('pregame-disabled-gps');
        
            e.listen('tizen.back', onBack);
            
            lockedEl.classList.toggle('hidden', true);
            waitingEl.classList.toggle('hidden', false);
            disabledEl.classList.toggle('hidden', true);
            interval = setInterval(function() {
                document.getElementById('waiting-gps-div').classList.toggle('toggle-on');
                console.log(document.getElementById('waiting-gps-div').classList);
            }, 1000);
            
            e.listen('gps.status', onGpsStatus);
            provider.sendGpsStatusReq();
        }
        
        function onPageHide() {
            clearInterval(interval);
            e.die('tizen.back', onBack);
            e.die('gps.status', onGpsStatus);
        }
        
        function onBack() {
            history.back();
        }
        
        function onGpsStatus(e) {
            var status = e.detail;
            var waitingEl = document.getElementById('pregame-waiting-gps'),
                lockedEl = document.getElementById('pregame-locked-gps'),
                disabledEl = document.getElementById('pregame-disabled-gps');
        
            waitingEl.classList.toggle('hidden', status != 'enabled');
            lockedEl.classList.toggle('hidden', status != 'ready');
            disabledEl.classList.toggle('hidden', status != 'disabled');
            
            if (status === 'enabled') {
                // Enabled, but not ready yet. Request again after 5s
                setTimeout(function() {
                    provider.sendGpsStatusReq(); 
                }, 5000);
            }
        }
        
        function onRace(ev) {
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
