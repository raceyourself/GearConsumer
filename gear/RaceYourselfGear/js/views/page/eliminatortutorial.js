/*global define, $, console, window, history, document*/

/**
 * Main page module
 */

define({
    name: 'views/page/eliminatortutorial',
    requires: [
        'core/event',
        'models/race',
        'models/game',
        'models/settings',
        'views/page/pregame',
        'views/page/no-bluetooth'
    ],
    def: function viewsPageEliminatorTutorial(req) {
        'use strict';

        var e = req.core.event,
         	app = req.models.application,
         	page = null,
         	game = req.models.game,
         	settings = req.models.settings,
            changer,
            sectionChanger;

        function show() {
            gear.ui.changePage('#eliminatortutorial');
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
             
             document.getElementById('start-elim-race-btn').addEventListener('click', onEliminatorEndClick);
        }

        function onEliminatorEndClick() {
            if (isScrolling()) return;
        	settings.setEliminatorTutorial(true);
        	 if(sap.isConnected() || !sap.isAvailable()) {
             	e.fire('pregame.show');
             } else {
             	e.fire('no-bluetooth.show');
             }
        }
        
        
        function isScrolling() {
            if (!sectionChanger) return false;
            if (Math.abs(sectionChanger.lastTouchPointX - sectionChanger.startTouchPointX) > 5) return true;
            if (Math.abs(sectionChanger.lastTouchPointY - sectionChanger.startTouchPointY) > 5) return true;
            return false;
        }
        
        
        
        function init() {
            page = document.getElementById('eliminatortutorial');
            changer = document.getElementById("eliminator-tutorial-sectionchanger");
            bindEvents();
        }

        e.listeners({
            'eliminatortutorial.show': show,
        });

        return {
            init: init
        };
    }

});
