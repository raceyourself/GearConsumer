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
        'models/game'
    ],
    def: function viewsPagePregame(req) {
        'use strict';

        var e = req.core.event,
            page = null,
            game = req.models.game,
            timeout,
            gps_lock = false;

        function show() {
            gear.ui.changePage('#pregame');
        }

        function onPageShow() {
            var waitingEl = document.getElementById('pregame-waiting-gps'),
                lockedEl = document.getElementById('pregame-locked-gps');
        
            e.listen('tizen.back', onBack);

            if (gps_lock) return onGpsLock(); // Short-circuit
            
            lockedEl.classList.toggle('hidden', true);
            waitingEl.classList.toggle('hidden', false);
            
            timeout = setTimeout(onGpsLock, 1000);
        }
        
        function onPageHide() {
            e.die('tizen.back', onBack);            
            clearTimeout(timeout);
        }
        
        function onBack() {
            e.fire('newmain.show');
        }
        
        function onGpsLock() {
            var waitingEl = document.getElementById('pregame-waiting-gps'),
                lockedEl = document.getElementById('pregame-locked-gps');
        
            waitingEl.classList.toggle('hidden', true);
            lockedEl.classList.toggle('hidden', false);            
        }
        
        function onRace(ev) {
            e.fire(game.getCurrentGame()+'.show');
            ev.preventDefault();
        }
        
        function bindEvents() {
            var raceBtnEl = document.getElementById('pregame-race-btn');
            
            page.addEventListener('pageshow', onPageShow);
            page.addEventListener('pagehide', onPageHide);
            raceBtnEl.addEventListener('click', onRace);
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
