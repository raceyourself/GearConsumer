/*global define, $, console, window, history, document*/

/**
 * Main page module
 */

define({
    name: 'views/page/lockedgame',
    requires: [
        'core/event',
        'models/game'
    ],
    def: function viewsPageLockedGame(req) {
        'use strict';

        var e = req.core.event,
            page = null,
            game = req.models.game;

        function show() {
            gear.ui.changePage('#lockedgame');
        }

        function onPageShow() {
            var headerEl = document.getElementById('lockedgame-title'),
                contentEl = document.getElementById('lockedgame-content');
            
            headerEl.innerHTML = game.getTitle();
            contentEl.innerHTML = game.getDescription();
        }
        
        function bindEvents() {
            page.addEventListener('pageshow', onPageShow);
        }

        function init() {
            page = document.getElementById('lockedgame');
            bindEvents();
        }

        e.listeners({
            'lockedgame.show': show
        });

        return {
            init: init
        };
    }

});
