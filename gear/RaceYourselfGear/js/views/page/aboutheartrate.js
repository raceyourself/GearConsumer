/*global define, $, console, window, history, document*/

/**
 * Main page module
 */

define({
    name: 'views/page/aboutheartrate',
    requires: [
        'core/event',
        'models/sapRaceYourself'
    ],
    def: function viewsPageAboutHeartRate(req) {
        'use strict';

        var e = req.core.event,
            provider = req.models.sapRaceYourself,
            page = null;

        function show() {
            gear.ui.changePage('#aboutheartrate');            
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
            
            page.addEventListener('click', onBack);
        }

        function init() {
            page = document.getElementById('aboutheartrate');
            bindEvents();
        }
        
        e.listeners({
            'aboutheartrate.show': show
        });
        
        return {
            init: init
        };
    }

});
