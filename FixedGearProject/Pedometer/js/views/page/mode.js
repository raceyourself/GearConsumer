/*global define, $, console, window, history, document*/

/**
 * Main page module
 */

define({
    name: 'views/page/mode',
    requires: [
        'core/event',
        'views/page/games',
        'models/settings'
    ],
    def: function viewsPageMode(req) {
        'use strict';

        var e = req.core.event,
            page = null;

        function show() {
            gear.ui.changePage('#mode');
        }

        function onPageShow() {}
        
        function onRunnerBtnClick() {
            e.fire('games.show');
        }

        function onCyclistBtnClick() {
            e.fire('games.show');
        }

        function bindEvents() {
            var runnerBtnEl = document.getElementById('runner-mode-btn'),
                cyclistBtnEl = document.getElementById('cyclist-mode-btn');

            page.addEventListener('pageshow', onPageShow);
            runnerBtnEl.addEventListener('click', onRunnerBtnClick);
            cyclistBtnEl.addEventListener('click', onCyclistBtnClick);
        }

        function init() {
            page = document.getElementById('mode');
            bindEvents();
        }

        e.listeners({
            'mode.show': show
        });

        return {
            init: init
        };
    }

});
