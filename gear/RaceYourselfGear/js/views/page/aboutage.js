/*global define, $, console, window, history, document*/

/**
 * Main page module
 */

define({
    name: 'views/page/aboutage',
    requires: [
        'core/event',
        'models/sapRaceYourself'
    ],
    def: function viewsPageAboutAge(req) {
        'use strict';

        var e = req.core.event,
            provider = req.models.sapRaceYourself,
            page = null;

        function show() {
            gear.ui.changePage('#aboutage');            
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
            page = document.getElementById('aboutage');
            bindEvents();
        }
        
        e.listeners({
            'aboutage.show': show
        });
        
        return {
            init: init
        };
    }

});
