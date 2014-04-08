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
    name: 'views/page/gameselect',
    requires: [
        'core/event',
        'models/race',
        'models/game',
        'models/settings',
        'models/sapRaceYourself',
        'views/page/pregame',
        'views/page/trainingtype',
        'views/page/zombietutorial',
        'views/page/eliminatortutorial'
    ],
    def: function viewsPageGameSelect(req) {
        'use strict';

        var e = req.core.event,
         	app = req.models.application,
         	page = null,
         	game = req.models.game,
         	settings = req.models.settings,
         	provider = req.models.sapRaceYourself,
            changer,
            sectionChanger;

        function show() {
            gear.ui.changePage('#newgames');
        }
        
        

        function onPageShow() {
            sectionChanger = new SectionChanger(changer, {
                circular: true,
                orientation: "horizontal",
                scrollbar: "bar"
            });
            
            document.getElementById('dino-mode-btn').classList.toggle('locked-game', game.isLocked('dino'));
            
            document.getElementById('eliminator-mode-btn').classList.toggle('locked-game', game.isLocked('eliminator'));
            
            e.listen('tizen.back', onBack);
            sectionChanger.setActiveSection(3, 0);

            if(settings.getFirstTimeSelect()) {
            	setTimeout(function() {
            		sectionChanger.setActiveSection(0, 1000);
            	}, 1);
            	settings.setFirstTimeSelect(false);
            } else {
            	sectionChanger.setActiveSection(0, 0);
            }
        }
        
        function onPageHide() {
            e.die('tizen.back', onBack);
            sectionChanger.destroy();
        }   
        
        function onBack() {
            e.fire('newmain.show');
        }
        
        function bindEvents() {
        	var zombieBtnEl = document.getElementById('zombie-mode-btn'),
        		dinoBtnEl = document.getElementById('dino-mode-btn'),
        		moreGamesEl = document.getElementById('more-games-btn2'),
        		elimBtnEl = document.getElementById('eliminator-mode-btn');
        	
        	 page.addEventListener('pageshow', onPageShow);
             page.addEventListener('pagehide', onPageHide);
             
             zombieBtnEl.addEventListener('click', onZombieBtnClick);
             dinoBtnEl.addEventListener('click', onDinoBtnClick);
             moreGamesEl.addEventListener('click', onMoreGames);
             elimBtnEl.addEventListener('click', onElimBtnClick);
        }

        function isScrolling() {
            if (!sectionChanger) return false;
            if (Math.abs(sectionChanger.lastTouchPointX - sectionChanger.startTouchPointX) > 5) return true;
            if (Math.abs(sectionChanger.lastTouchPointY - sectionChanger.startTouchPointY) > 5) return true;
            return false;
        }
        
        function onZombieBtnClick(event) {
            if (isScrolling()) return;
        	game.setCurrentGame('hrzgame');
        	game.setCurrentOpponentType('zombie');
        	if(settings.getZombieTutorial()) {
        		e.fire('trainingtype.show');
        	}
        	else {
        		e.fire('zombietutorial.show');
        	}
        	
        	
        }
        
        function onDinoBtnClick(event) {
            if (isScrolling()) return;
            if (game.isLocked('dino')) return;
            game.setCurrentGame('hrzgame');
            game.setCurrentOpponentType('dinosaur');
            e.fire('trainingtype.show');
        }
        
        function onElimBtnClick(event) {
        	if(isScrolling()) return;
        	if(game.isLocked('eliminator')) return;
        	game.setCurrentGame('racegame');
        	if(settings.getEliminatorTutorial()) {
        		e.fire('trainingtype.show');
        	} else {
        		e.fire('eliminatortutorial.show');
        	}
        	
        }
         
        function onMoreGames(event) {
            if (isScrolling()) return;
            provider.sendWebLinkReq('http://www.raceyourself.com/gear/#moregames');
        }
        
        function init() {
            page = document.getElementById('newgames');
            changer = document.getElementById("game-select-sectionchanger");
            bindEvents();
        }

        e.listeners({
            'gameselect.show': show,
        });

        return {
            init: init
        };
    }

});
