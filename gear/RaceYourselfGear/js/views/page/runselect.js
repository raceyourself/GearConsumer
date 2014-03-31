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
    name: 'views/page/runselect',
    requires: [
        'core/event',
        'models/race',
        'models/game',
        'models/settings',
        'models/sap',
        'models/sprite',
        'models/sapRaceYourself',
        'views/page/pregame',
        'views/page/no-bluetooth',
        'views/page/trainingtype',
        'views/page/opponentselect',
        'views/page/eliminatortutorial'
    ],
    def: function viewsPageRunSelect(req) {
        'use strict';

        var e = req.core.event,
         	app = req.models.application,
         	page = null,
         	game = req.models.game,
         	race = req.models.race,
         	Sprite = req.models.sprite.Sprite,
         	sap = req.models.sap,
         	settings = req.models.settings,
         	provider = req.models.sapRaceYourself,
            changer,
            fitterContext,
            fitterCanvas,
            lastRenderTime,
            fitterLockedSprite,
            fitterUnlockedSprite,
            slimmerContext,
            slimmerCanvas,
            slimmerLockedSprite,
            slimmerUnlockedSprite,
            fasterContext,
            fasterCanvas,
            fasterLockedSprite,
            fasterUnlockedSprite,
            raf,
            sectionChanger;

        function show() {
            gear.ui.changePage('#runselect');
        }
        
        function onPageShow() {
            sectionChanger = new SectionChanger(changer, {
                circular: false,
                orientation: "horizontal",
                scrollbar: "bar"
            });
            
            e.listen('tizen.back', onBack);
            sectionChanger.setActiveSection(3, 0);

            lastRenderTime = Date.now();
            animate();
            
            if(settings.getFirstTimeSelect()) {
            	setTimeout(function() {
            		sectionChanger.setActiveSection(0, 1000);
            	}, 1);
            	settings.setFirstTimeSelect(false);
            } else {
            	sectionChanger.setActiveSection(0, 0);
            }
        }
        
        function animate(time) {
            raf = requestAnimationFrame(animate);
            render();
        }
        
        function render() {
        	
        	var dt = Date.now() - lastRenderTime;
        	lastRenderTime = Date.now();
        	
        	if(game.isLocked('Endurance')) {
        		fitterLockedSprite.draw(fitterContext, fitterCanvas.width / 2 - fitterLockedSprite.width /2, fitterCanvas.height /2 - fitterLockedSprite.height /2, 0);
        	} else {
        		//fitterContext.clearRect(0, 0, fitterCanvas.width, fitterCanvas.height);
        		fitterUnlockedSprite.draw(fitterContext, fitterCanvas.width / 2 - fitterUnlockedSprite.width /2, fitterCanvas.height /2 - fitterUnlockedSprite.height /2, dt);
        	}
        	
        	if(game.isLocked('WeightLoss')) {
        		slimmerLockedSprite.draw(slimmerContext, slimmerCanvas.width / 2 - slimmerLockedSprite.width /2, slimmerCanvas.height /2 - slimmerLockedSprite.height /2, 0);
        	} else {
        		//slimmerContext.clearRect(0, 0, slimmerCanvas.width, slimmerCanvas.height);
        		slimmerUnlockedSprite.draw(slimmerContext, slimmerCanvas.width / 2 - slimmerUnlockedSprite.width /2, slimmerCanvas.height /2 - slimmerUnlockedSprite.height /2, dt);
        	}

        	if(game.isLocked('Strength')) {
        		fasterLockedSprite.draw(fasterContext, fasterCanvas.width / 2 - fasterLockedSprite.width / 2, fasterCanvas.height / 2 - fasterLockedSprite.height / 2, 0);
        	} else {
        		//fasterContext.clearRect(0, 0, fasterCanvas.width, fasterCanvas.height);
        		fasterUnlockedSprite.draw(fasterContext, fasterCanvas.width / 2 - fasterUnlockedSprite.width / 2, fasterCanvas.height / 2 - fasterUnlockedSprite.height / 2, dt);
        	}

        }
        
        function loadImage(url, onload) {
        	var image = new Image();
        	image.onerror = function() {
        		throw 'could not load' + this.src;      	
        	}
        	image.onload = function() {
        		onload.call(this);
        	};
        	image.src = url;
        }
        
        function onPageHide() {
            e.die('tizen.back', onBack);
            cancelAnimationFrame(raf);
            sectionChanger.destroy();
        }   
        
        function onBack() {
            e.fire('newmain.show');
        }
        
        function bindEvents() {
        	var moreGamesEl = document.getElementById('more-games-btn'),
        		elimBtnEl = document.getElementById('elim-mode-btn'),
        		fitnessBtnEl = document.getElementById('fitness-mode-btn'),
        		weightBtnEl = document.getElementById('weight-mode-btn'),
        		strengthBtnEl = document.getElementById('strength-mode-btn');
        	
        	 page.addEventListener('pageshow', onPageShow);
             page.addEventListener('pagehide', onPageHide);
             
            fitterCanvas = document.getElementById('fitter-canvas');
         	fitterContext = fitterCanvas.getContext('2d');
             
         	slimmerCanvas = document.getElementById('slimmer-canvas');
         	slimmerContext = slimmerCanvas.getContext('2d');
         	
         	fasterCanvas = document.getElementById('faster-canvas');
         	fasterContext = fasterCanvas.getContext('2d');
         	
         	loadImage('images/New Games/ry_slimmer_locked.png', function() {
				slimmerLockedSprite = new Sprite(this, this.width, 1000);
			});
         	
         	loadImage('images/animation_RY_Slimmer_game_tile.png', function() {
				slimmerUnlockedSprite = new Sprite(this, this.width/6, 600);
			});
         	
         	loadImage('images/New Games/ry_fitter_locked.png', function() {
				fitterLockedSprite = new Sprite(this, this.width, 1000);
			});
         	
         	loadImage('images/animation_RY_Fitter_game_tile.png', function() {
				fitterUnlockedSprite = new Sprite(this, this.width/6, 600);
			});
         	
         	loadImage('images/New Games/ry_faster_locked.png', function() {
         		fasterLockedSprite = new Sprite(this, this.width, 1000);
         	});
         	
         	loadImage('images/animation_RY_Faster_game_tile.png', function() {
         		fasterUnlockedSprite = new Sprite(this, this.width / 6, 600);
         	});
         	 
             moreGamesEl.addEventListener('click', onMoreGames);
             elimBtnEl.addEventListener('click', onElimBtnClick);
             fitnessBtnEl.addEventListener('click', onHRRaceClick);
             weightBtnEl.addEventListener('click', onHRRaceClick);
             strengthBtnEl.addEventListener('click', onHRRaceClick);
        }
        
        function onHRRaceClick(event) {
        	if(isScrolling()) return;
        	switch(this.id) {
        	case 'fitness-mode-btn':
        		if (game.isLocked('Endurance')) return;
        		race.setGoal('Endurance');
        		break;
        		
        	case 'weight-mode-btn':
        		if (game.isLocked('WeightLoss')) return;
        		race.setGoal('WeightLoss');
        		break;
        		
        	case 'strength-mode-btn':
        		if (game.isLocked('Strength')) return;
        		race.setGoal('Strength');
        		break;
        		
        	default:
        		console.log('Button not found - ' + this.id);
        		break;
        	}
        	
        	e.fire('opponentselect.show');
        }

        function isScrolling() {
            if (!sectionChanger) return false;
            if (Math.abs(sectionChanger.lastTouchPointX - sectionChanger.startTouchPointX) > 5) return true;
            if (Math.abs(sectionChanger.lastTouchPointY - sectionChanger.startTouchPointY) > 5) return true;
            return false;
        }
       
        function onElimBtnClick(event) {
        	if(isScrolling()) return;
        	
        	game.setCurrentGame('racegame');
        	if(settings.getEliminatorTutorial()) {
        		if(sap.isConnected() || !sap.isAvailable()) {
                	e.fire('pregame.show');
                } else {
                	e.fire('no-bluetooth.show');
                }
        	} else {
        		e.fire('eliminatortutorial.show');
        	}
        	
        }
         
        function onMoreGames(event) {
            if (isScrolling()) return;
            provider.sendWebLinkReq('http://www.raceyourself.com/gear/#moregames');
        }
        
        function init() {
            page = document.getElementById('runselect');
            changer = document.getElementById("run-select-sectionchanger");
            bindEvents();
        }

        e.listeners({
            'runselect.show': show,
        });

        return {
            init: init
        };
    }

});
