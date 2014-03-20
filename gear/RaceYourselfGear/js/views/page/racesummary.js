/*global define, $, console, window, history, document*/

/**
 * Main page module
 */

define({
    name: 'views/page/racesummary',
    requires: [
        'core/event',
        'models/race',
        'models/game',
        'models/settings',
        'views/page/pregame',
        'views/page/trainingtype'
    ],
    def: function viewsPageRaceSummary(req) {
        'use strict';

        var e = req.core.event,
         	app = req.models.application,
         	page = null,
         	game = req.models.game,
         	settings = req.models.settings,
            changer,
            sectionChanger;

        function show() {
            gear.ui.changePage('#racesummary');
        }

        function onPageShow() {
            sectionChanger = new SectionChanger(changer, {
                circular: false,
                orientation: "horizontal",
                scrollbar: "bar"
            });
            
            e.listen('tizen.back', onBack);
        }
        
        function onBack() {
            history.back();
        }
        
        function onPageHide() {
            sectionChanger.destroy();
            e.die('tizen.back', onBack);
        }        
        
        function bindEvents() {
        	 page.addEventListener('pageshow', onPageShow);
             page.addEventListener('pagehide', onPageHide);
             
             document.getElementById('race-summary-end-btn').addEventListener('click', onSummaryEndClick);
        }

        function onSummaryEndClick() {
        	e.fire('newmain.show');
        }
        
        
        function isScrolling() {
            if (!sectionChanger) return false;
            if (Math.abs(sectionChanger.lastTouchPointX - sectionChanger.startTouchPointX) > 5) return true;
            if (Math.abs(sectionChanger.lastTouchPointY - sectionChanger.startTouchPointY) > 5) return true;
            return false;
        }
        
        
        
        function init() {
            page = document.getElementById('racesummary');
            changer = document.getElementById("race-summary-sectionchanger");
            bindEvents();
        }

        e.listeners({
            'racesummary.show': show,
        });

        return {
            init: init
        };
    }

});
