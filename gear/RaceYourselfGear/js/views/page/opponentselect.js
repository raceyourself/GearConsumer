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
    name: 'views/page/opponentselect',
    requires: [
        'core/event',
        'models/race',
        'models/game',
        'models/sprite',
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
         	Sprite = req.models.sprite.Sprite,
         	settings = req.models.settings,
         	provider = req.models.sapRaceYourself,
            changer,
            sectionChanger,
            dinoContext,
            dinoCanvas,
            dinoSprite,
            zombieCanvas,
            zombieContext,
            zombieSprite,
            raf = null,
            lastRenderTime;

        function show() {
            gear.ui.changePage('#opponentselect');
        }
        
        function onPageShow() {
            sectionChanger = new SectionChanger(changer, {
                circular: false,
                orientation: "horizontal",
                scrollbar: "bar"
            });
            
            lastRenderTime = Date.now();
            animate();
            
            
            e.listen('tizen.back', onBack);
            
        }
        
        function animate(time) {
            raf = requestAnimationFrame(animate);
            render();
        }
        
        function render() {
        	dinoContext.clearRect(0, 0, dinoCanvas.width, dinoCanvas.height);
        	var dt = Date.now() - lastRenderTime;
        	lastRenderTime = Date.now();
        	
        	dinoSprite.drawscaled(dinoContext, dinoCanvas.width / 2 - dinoSprite.width * 1.5/2, (dinoCanvas.height /2 - 50) - dinoSprite.height * 1.5/2, dt, 1.5);
        	
        	zombieContext.clearRect(0, 0, zombieCanvas.width, zombieCanvas.height);
        	
        	zombieSprite.drawscaled(zombieContext, zombieCanvas.width/2 - zombieSprite.width * 1.5 / 2, (zombieCanvas.height / 2 - 25) - zombieSprite.height * 1.5/2, dt, 1.5);
        }
        
        function loadImage(url, onload) {
        	//pendingAssets++;
        	var image = new Image();
        	image.onerror = function() {
        		throw 'could not load' + this.src;      	
        	}
        	image.onload = function() {
        		//pendingAssets--;
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
        	console.log('binding events for opponent');
        	
        	var zombieBtnEl = document.getElementById('zombie-mode-btn'),
        		dinoBtnEl = document.getElementById('dino-mode-btn');
        
        	dinoCanvas = document.getElementById('dino-canvas');
        	
        	dinoContext = dinoCanvas.getContext('2d');
        	
        	zombieCanvas = document.getElementById('zombie-canvas');
        	zombieContext = zombieCanvas.getContext('2d');
        	
        	page.addEventListener('pageshow', onPageShow);
            page.addEventListener('pagehide', onPageHide);
            
            loadImage('images/animation_dino_small_running.png', function() {
				dinoSprite = new Sprite(this, this.width/5, 500);
			});
            
            loadImage('images/animation_zombie_stationary.png', function() {
				zombieSprite = new Sprite(this, this.width/14, 2000);
			});
             
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
            //if (game.isLocked('dino')) return;
            game.setCurrentGame('hrzgame');
            game.setCurrentOpponentType('dinosaur');
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
