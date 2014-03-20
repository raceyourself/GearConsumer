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
        'views/page/pregame',
        'views/page/trainingtype',
        'views/page/zombietutorial'
    ],
    def: function viewsPageGameSelect(req) {
        'use strict';

        var e = req.core.event,
         	app = req.models.application,
         	page = null,
         	game = req.models.game,
         	settings = req.models.settings,
            changer,
            sectionChanger;

        function show() {
            gear.ui.changePage('#newgames');
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
            sectionChanger.destroy();
            e.die('tizen.back', onBack);
        }   
        
        function onBack() {
            e.fire('newmain.show');
        }
        
        function bindEvents() {
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
            e.fire('choosegoal.show');
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
