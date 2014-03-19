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
        'views/page/pregame'
    ],
    def: function viewsPageGameSelect(req) {
        'use strict';

        var e = req.core.event,
         	app = req.models.application,
         	page = null,
         	game = req.models.game,
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
            console.log("section has changed");
        }
        
        function onPageHide() {
            sectionChanger.destroy();
        }        
        
        function bindEvents() {
        	var raceBtnEl = document.getElementById('race-mode-btn'),
        		zombieBtnEl = document.getElementById('zombie-mode-btn'),
        		boulderBtnEl = document.getElementById('boulder-mode-btn'),
        		dinoBtnEl = document.getElementById('dino-mode-btn');
        	
        	 page.addEventListener('pageshow', onPageShow);
             page.addEventListener('pagehide', onPageHide);
             
             raceBtnEl.addEventListener('click', onRaceBtnClick);
             zombieBtnEl.addEventListener('click', onZombieBtnClick);
             boulderBtnEl.addEventListener('click', onBoulderBtnClick);
             dinoBtnEl.addEventListener('click', onDinoBtnClick);
        }

        function onRaceBtnClick() {
        	game.setCurrentGame('racegame');
        	e.fire('pregame.show');
        }
        
        function onZombieBtnClick() {
        	game.setCurrentGame('hrzgame');
        	e.fire('pregame.show');
        }
        
        function onBoulderBtnClick() {
        	
        }
        
        function onDinoBtnClick() {
        	
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
