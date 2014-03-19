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
            
            e.listen('gps.status', onGpsStatus);
            provider.sendGpsStatusReq();
        }
        
        function onPageHide() {
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
        }
        
        function onRace(ev) {
            e.fire(game.getCurrentGame()+'.show');
            ev.preventDefault();
        }
        
        function bindEvents() {
            var raceBtnEl = document.getElementById('pregame-race-btn'),
                raceAnywayBtnEl = document.getElementById('pregame-race-anyway-btn');
            
            page.addEventListener('pageshow', onPageShow);
            page.addEventListener('pagehide', onPageHide);
            raceBtnEl.addEventListener('click', onRace);
            raceAnywayBtnEl.addEventListener('click', onRace);
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
