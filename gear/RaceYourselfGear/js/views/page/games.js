/*global define, $, console, window, history, document*/

/**
 * Main page module
 */

define({
    name: 'views/page/games',
    requires: [
        'core/event',
        'views/page/pregame',
        'views/page/lockedgame',
        'models/settings'
    ],
    def: function viewsPageGames(req) {
        'use strict';

        var e = req.core.event,
            page = null;

        function show() {
            gear.ui.changePage('#games');
        }

        function onPageShow() {
            // Mark (un)locked games
            var ryBtnEl = document.getElementById('ry-game-btn'),
                zombieBtnEl = document.getElementById('hrz-game-btn');
            
            zombieBtnEl.classList.toggle('locked-game', true);
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
