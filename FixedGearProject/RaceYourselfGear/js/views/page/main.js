/*global define, $, console, window, history, document*/

/**
 * Main page module
 */

define({
    name: 'views/page/main',
    requires: [
        'core/event',
        'models/application',
        'views/page/mode',
        'views/page/games'
    ],
    def: function viewsPageMain(req) {
        'use strict';

        var e = req.core.event,
            app = req.models.application,
            page = null;

        function show() {
            gear.ui.changePage('#main');            
        }
        
        function onPageShow() {
            e.listen('fling.right', flingRight);
            e.listen('fling.left', flingLeft);
            e.listen('tizen.back', onBack);
        }

        function onPageHide() {
            e.die('fling.right', flingRight);
            e.die('fling.left', flingLeft);
            e.die('tizen.back', onBack);
        }
        
        function flingRight() {
            e.fire('mode.show');
        }
        
        function flingLeft() {
            e.fire('games.show');
        }
        
        function onBack() {
            app.closeApplication();
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
