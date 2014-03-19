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
            
            document.getElementById('boulder-mode-btn').classList.toggle('locked-game', game.isLocked('boulder'));
            document.getElementById('dino-mode-btn').classList.toggle('locked-game', game.isLocked('dino'));
            
            e.listen('tizen.back', onBack);
        }
        
        function onPageHide() {
            sectionChanger.destroy();
            e.die('tizen.back', onBack);
        }   
        
        function onBack() {
            history.back();
        }
        
        function bindEvents() {
        	var zombieBtnEl = document.getElementById('zombie-mode-btn'),
        		boulderBtnEl = document.getElementById('boulder-mode-btn'),
        		dinoBtnEl = document.getElementById('dino-mode-btn');
        	
        	 page.addEventListener('pageshow', onPageShow);
             page.addEventListener('pagehide', onPageHide);
             
             zombieBtnEl.addEventListener('click', onZombieBtnClick);
             boulderBtnEl.addEventListener('click', onBoulderBtnClick);
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
        	if(settings.getZombieTutorial) {
        		e.fire('trainingtype.show');
        	}
        	else {
        		e.fire('zombietutorial.show');
        	}
        	
        	
        }
        
        function onBoulderBtnClick(event) {
            if (isScrolling()) return;
            if (game.isLocked('boulder')) return;
            game.setCurrentGame('hrzgame');
            e.fire('choosegoal.show');
        }
        
        function onDinoBtnClick(event) {
            if (isScrolling()) return;
            if (game.isLocked('dino')) return;
            game.setCurrentGame('hrzgame');
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
