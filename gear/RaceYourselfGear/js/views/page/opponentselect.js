/*global define, $, console, window, history, document*/

/**
 * Main page module
 */

define({
    name: 'views/page/opponentselect',
    requires: [
        'core/event',
        'models/race',
        'models/game',
        'models/settings',
        'models/sapRaceYourself',
        'views/page/ageselect',
        'views/page/trainingtype',
        'views/page/zombietutorial',
        'views/page/choosegoal'
    ],
    def: function viewsPageOpponentSelect(req) {
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
            gear.ui.changePage('#opponentselect');
        }
        
        function onPageShow() {
            sectionChanger = new SectionChanger(changer, {
                circular: false,
                orientation: "horizontal",
                scrollbar: "bar"
            });
            
            document.getElementById('dino-mode-btn').classList.toggle('locked-game', game.isLocked('dino'));
            
            e.listen('tizen.back', onBack);
            
        }
        
        function onPageHide() {
            e.die('tizen.back', onBack);
            sectionChanger.destroy();
        }   
        
        function onBack() {
            e.fire('newmain.show');
        }
        
        function bindEvents() {
        	console.log('binding events for opponent');
        	
        	var zombieBtnEl = document.getElementById('zombie-mode-btn'),
        		dinoBtnEl = document.getElementById('dino-mode-btn');
        
        	page.addEventListener('pageshow', onPageShow);
            page.addEventListener('pagehide', onPageHide);
             
            zombieBtnEl.addEventListener('click', onZombieBtnClick);
            dinoBtnEl.addEventListener('click', onDinoBtnClick);
        }

        function isScrolling() {
            if (!sectionChanger) return false;
            if (Math.abs(sectionChanger.lastTouchPointX - sectionChanger.startTouchPointX) > 5) return true;
            if (Math.abs(sectionChanger.lastTouchPointY - sectionChanger.startTouchPointY) > 5) return true;
            return false;
        }
        
        function onZombieBtnClick(event) {
        	console.log('zombie click detected');
            if (isScrolling()) return;
        	game.setCurrentGame('hrzgame');
        	game.setCurrentOpponentType('zombie');
        	if(settings.getZombieTutorial()) {
        		if(settings.getFirstTimeAge()) {
        			console.log('showing age');
            		e.fire('ageselect.show', 'choosegoal');
            	} else {
            		console.log('choosing goal');
            		e.fire('choosegoal.show');
            	}
        	}
        	else {
        		console.log('showing zombie tutorial');
        		e.fire('zombietutorial.show');
        	}
        	
        }
        
        function onDinoBtnClick(event) {
            if (isScrolling()) return;
            if (game.isLocked('dino')) return;
            game.setCurrentGame('hrzgame');
            game.setCurrentOpponentType('dinosaur');
            if(settings.getFirstTimeAge()) {
        		e.fire('ageselect.show', 'choosegoal');
        	} else {
        		e.fire('choosegoal.show');
        	}
        }
         
        function init() {
            page = document.getElementById('opponentselect');
            changer = document.getElementById("opponent-select-sectionchanger");
            bindEvents();
        }

        e.listeners({
            'opponentselect.show': show,
        });

        return {
            init: init
        };
    }

});
