/*global define, $, console, window, history, document*/

/**
 * Main page module
 */

define({
    name: 'views/page/nohistory',
    requires: [
        'core/event',
        'models/sapRaceYourself'
    ],
    def: function viewsPageNoHistory(req) {
        'use strict';

        var e = req.core.event,
            provider = req.models.sapRaceYourself,
            page = null;

        function show() {
            gear.ui.changePage('#nohistory');            
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
            page = document.getElementById('nohistory');
            bindEvents();
        }
        
        e.listeners({
            'nohistory.show': show
        });
        
        return {
            init: init
        };
    }

});
