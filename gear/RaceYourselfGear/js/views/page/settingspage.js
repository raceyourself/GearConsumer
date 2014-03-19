/*global define, $, console, window, history, document*/

/**
 * Main page module
 */

define({
    name: 'views/page/settingspage',
    requires: [
        'core/event',
        'models/application',
        'models/race',
        'models/settings',
        'views/page/ageselect'
    ],
    def: function viewsPageSettingsPage(req) {
        'use strict';

        var e = req.core.event,
            app = req.models.application,
            race = req.models.race,
            settings = req.models.settings,
            page = null;

        function show() {
            gear.ui.changePage('#settingspage');            
        }
        
        function onPageShow() {
            e.listen('tizen.back', onBack);
        }

        function onPageHide() {
           e.die('tizen.back', onBack);
        }
        
        function onBack() {
            app.closeApplication();
        }

        function bindEvents() {
        	page.addEventListener('pageshow', onPageShow);
            page.addEventListener('pagehide', onPageHide);
        }
        
        function init() {
            page = document.getElementById('settingspage');
            bindEvents();
            // Assume we always start in this view
            onPageShow();
        }
        
        e.listeners({
            'settingspage.show': show
        });
        
        return {
            init: init
        };
    }

});
