/**
 * Copyright (c) 2014 RaceYourself Inc
 * All Rights Reserved
 *
 * No part of this application or any of its contents may be reproduced, copied, modified or 
 * adapted, without the prior written consent of the author, unless otherwise indicated.
 * 
 * Commercial use and distribution of the application or any part is not allowed without express 
 * and prior written consent of the author.
 * 
 * The application makes use of some publicly available libraries, some of which have their own 
 * copyright notices and licences. These notices are reproduced in the Open Source License 
 * Acknowledgement file included with this software.
 */

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
        'models/sap',
        'models/settings',
        'views/page/pregame',
        'views/page/no-bluetooth'
    ],
    def: function viewsPageEliminatorTutorial(req) {
        'use strict';

        var e = req.core.event,
         	app = req.models.application,
         	page = null,
         	sap = req.models.sap,
         	game = req.models.game,
         	settings = req.models.settings,
            changer,
            currentLap = 0,
            lapInterval = null,
            lapNumbers = [1, 2, 3, 4, 5, 10, 20, 50, 100, 200],
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
            
            currentLap = 0;
            
            var lapTextEl = document.getElementById('lap-number');
            
            lapInterval = setInterval(function() {
	           	lapTextEl.innerHTML = lapNumbers[currentLap];
	           	
	           	currentLap ++;
	           	
	            if(currentLap > lapNumbers.length -1) {
	            	currentLap = 0;
	            }	           	
	           	
            }, 750);
            
            e.listen('tizen.back', onBack);
        }
        
        function onBack() {
            history.back();
        }
        
        function onPageHide() {
            sectionChanger.destroy();
            clearInterval(lapInterval);
            e.die('tizen.back', onBack);
        }        
        
        function bindEvents() {
        	 page.addEventListener('pageshow', onPageShow);
             page.addEventListener('pagehide', onPageHide);
             
             page.addEventListener('click', onClick);
             
             
             
             document.getElementById('start-elim-race-btn').addEventListener('click', onEliminatorEndClick);
        }

        function onClick() {
        	if(isScrolling()) return;
        	if(sectionChanger.getActiveSectionIndex() < sectionChanger.getNumberOfSections() - 1)
        	sectionChanger.nextSection(500);
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
