/*global define, $, console, window, history, document*/

/**
 * Main page module
 */

define({
    name: 'views/page/choosegoal',
    requires: [
        'core/event',
        'models/application',
        'views/page/gameselect'
    ],
    def: function viewsPageChooseGoal(req) {
        'use strict';

        var e = req.core.event,
            app = req.models.application,
            page = null;

        function show() {
            gear.ui.changePage('#racetype');            
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
            page = document.getElementById('racetype');
            bindEvents();
            // Assume we always start in this view
            onPageShow();
        }
        
        e.listeners({
            'choosegoal.show': show
        });
        
        return {
            init: init
        };
    }

});
