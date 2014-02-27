/*global define, $, console, window, history, document*/

/**
 * Main page module
 */

define({
    name: 'views/page/pregame',
    requires: [
        'core/event',
        'views/page/racegame',
        'models/settings'
    ],
    def: function viewsPagePregame(req) {
        'use strict';

        var e = req.core.event,
            page = null,
            timeout,
            gps_lock = false;

        function show() {
            gear.ui.changePage('#pregame');
        }

        function onPageShow() {
            e.listen('tizen.back', onBack);
            if (gps_lock) return onGpsLock(); // Short-circuit
            
            var waitingEl = document.getElementById('pregame-waiting-gps'),
                lockedEl = document.getElementById('pregame-locked-gps');            
            
            lockedEl.classList.toggle('hidden', true);
            waitingEl.classList.toggle('hidden', false);
            
            timeout = setTimeout(onGpsLock, 1000);
        }
        
        function onPageHide() {
            e.die('tizen.back', onBack);            
            clearTimeout(timeout);
        }
        
        function onBack() {
            gear.ui.changePage('#games');
        }
        
        function onGpsLock() {
            var waitingEl = document.getElementById('pregame-waiting-gps'),
                lockedEl = document.getElementById('pregame-locked-gps');
        
            waitingEl.classList.toggle('hidden', true);
            lockedEl.classList.toggle('hidden', false);            
        }
        
        function bindEvents() {
            page.addEventListener('pageshow', onPageShow);
            page.addEventListener('pagehide', onPageHide);
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
