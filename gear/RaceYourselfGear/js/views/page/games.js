/*global define, $, console, window, history, document*/

/**
 * Main page module
 */

define({
    name: 'views/page/games',
    requires: [
        'core/event',
        'models/application',
        'views/page/pregame',
        'views/page/lockedgame',
        'models/settings'
    ],
    def: function viewsPageGames(req) {
        'use strict';

        var e = req.core.event,
            app = req.models.application,
            page = null;

        function show() {
            gear.ui.changePage('#games');
        }

        function onPageShow() {
            e.listen('tizen.back', onBack);
            // Mark (un)locked games
            var ryBtnEl = document.getElementById('ry-game-btn'),
                zombieBtnEl = document.getElementById('hrz-game-btn');
            
            zombieBtnEl.classList.toggle('locked-game', true);
        }
        
        function onPageHide() {
            console.log('games hide');
            e.die('tizen.back', onBack);            
        }
        
        function onBack() {
            console.log("Closing application..");
            app.closeApplication();
        }

        
        function onRaceYourselfGameBtnClick() {
            e.fire('pregame.show');
        }

        function onHeartRateZombiesGameBtnClick() {
            e.fire('lockedgame.show');
        }

        function bindEvents() {
            var ryBtnEl = document.getElementById('ry-game-btn'),
                zombieBtnEl = document.getElementById('hrz-game-btn');

            page.addEventListener('pageshow', onPageShow);
            page.addEventListener('pagehide', onPageHide);
            ryBtnEl.addEventListener('click', onRaceYourselfGameBtnClick);
            zombieBtnEl.addEventListener('click', onHeartRateZombiesGameBtnClick);
        }

        function init() {
            page = document.getElementById('games');
            bindEvents();
        }

        e.listeners({
            'games.show': show
        });

        return {
            init: init
        };
    }

});
