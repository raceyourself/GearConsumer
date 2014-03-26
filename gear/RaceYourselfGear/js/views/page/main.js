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
            setTimeout(onLoad, 1);
        }

        function onPageHide() {
        }
        
        function onBack() {
            app.closeApplication();
        }
        
        function onLoad() {
        	e.fire('newmain.show');
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
