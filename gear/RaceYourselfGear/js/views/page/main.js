/*global define, $, console, window, history, document*/

/**
 * Main page module
 */

define({
    name: 'views/page/main',
    requires: [
        'core/event',
        'views/page/mode',
        'views/page/games'
    ],
    def: function viewsPageMain(req) {
        'use strict';

        var e = req.core.event,
            page = null;

        function show() {
            gear.ui.changePage('#main');            
        }
        
        function onPageShow() {
            e.listen('fling.up', flingUp);
            e.listen('fling.left', flingLeft);
        }

        function onPageHide() {
            e.die('fling.up', flingUp);
            e.die('fling.left', flingLeft);
        }
        
        function flingUp() {
            e.fire('mode.show');
        }
        
        function flingLeft() {
            e.fire('games.show');
        }

        function bindEvents() {
            page.addEventListener('pageshow', onPageShow);
            page.addEventListener('pagehide', onPageHide);
        }

        function init() {
            page = document.getElementById('main');
            bindEvents();
            // Assume we always start in this view
            onPageShow();
        }
        
        e.listeners({
            'main.show': show
        });
        
        return {
            init: init
        };
    }

});
