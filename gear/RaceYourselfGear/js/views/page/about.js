/*global define, $, console, window, history, document*/

/**
 * Main page module
 */

define({
    name: 'views/page/about',
    requires: [
        'core/event',
        'models/sapRaceYourself'
    ],
    def: function viewsPageMain(req) {
        'use strict';

        var e = req.core.event,
            provider = req.models.sapRaceYourself,
            page = null;

        function show() {
            gear.ui.changePage('#about');            
        }
        
        function onPageShow() {
            e.listen('tizen.back', onBack);
        }

        function onPageHide() {
            e.die('tizen.back', onBack);
        }
        
        function onBack() {
            history.back();
        }

        function bindEvents() {
            page.addEventListener('pageshow', onPageShow);
            page.addEventListener('pagehide', onPageHide);
        }

        function init() {
            page = document.getElementById('about');
            bindEvents();
        }
        
        e.listeners({
            'about.show': show
        });
        
        return {
            init: init
        };
    }

});
