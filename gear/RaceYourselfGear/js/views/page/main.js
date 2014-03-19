/*global define, $, console, window, history, document*/

/**
 * Main page module
 */

define({
    name: 'views/page/main',
    requires: [
        'core/event',
        'models/application',
        'views/page/setdistance',
        'views/page/settime',
        'views/page/games',
        'views/page/newmain'
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
            e.listen('tizen.back', onBack);
        }

        function onPageHide() {
            e.die('tizen.back', onBack);
        }
        function onClick() {
            e.fire('newmain.show');
        }
        
        function onBack() {
            app.closeApplication();
        }

        function bindEvents() {
            page.addEventListener('pageshow', onPageShow);
            page.addEventListener('pagehide', onPageHide);
            page.addEventListener('click', onClick);
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
