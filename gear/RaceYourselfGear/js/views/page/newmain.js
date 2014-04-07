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
    name: 'views/page/newmain',
    requires: [
        'core/event',
        'models/application',
        'models/race',
        'models/sprite',
        'models/settings',
        'views/page/runselect',
        'views/page/achievements',
        'views/page/settingspage',
        'views/page/racesummary',
        'views/page/nohistory',
        'views/page/historypage'
    ],
    def: function viewsPageNewMain(req) {
        'use strict';

        var e = req.core.event,
            app = req.models.application,
            race = req.models.race,
            settings = req.models.settings,
            Sprite = req.models.sprite.Sprite,
            gameCanvas,
            gameContext,
            greenRunner = null,
            whiteRunner = null,
            lastRenderTime = 0,
            raf = null,
            page = null;

        function show() {
            gear.ui.changePage('#newmain');            
        }
        
        function onPageShow() {
            e.listen('tizen.back', onBack);
            
            lastRenderTime = Date.now();
            
            animate();
        }

        function onPageHide() {
            e.die('tizen.back', onBack);
            cancelAnimationFrame(raf);
        }
        
        function onBack() {
            app.closeApplication();
        }
        
        function animate() {
        	raf = requestAnimationFrame(animate);
            render();
        }
        
        function render() {
        	var dt = Date.now() - lastRenderTime;
        	
        	lastRenderTime = Date.now();
        	
        	gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
        	
        	if(whiteRunner != null) {
        		whiteRunner.drawscaled(gameContext, 10, 10, dt+2, 0.7);
        	}
        	
        	if(greenRunner != null)
        		greenRunner.drawscaled(gameContext, 40, 10, dt, 0.7);
                	
        }

        function bindEvents() {
            var gameBtnEl = document.getElementById('games-btn'),
            	achievementsBtnEl = document.getElementById('achievements-btn'),
            	historyBtnEl = document.getElementById('history-btn'),
            	settingsBtnEl = document.getElementById('settings-btn');
        	
        	page.addEventListener('pageshow', onPageShow);
            page.addEventListener('pagehide', onPageHide);
            
            gameCanvas = document.getElementById('games-select-canvas');
            gameContext = gameCanvas.getContext('2d');
            
            loadImage('images/animation_runner_green.png', function() {
            	greenRunner = new Sprite(this, this.width/6, 500);
            });
            
            loadImage('images/animation_runner_white.png', function() {
            	whiteRunner = new Sprite(this, this.width/6, 500);
            });
            
            gameBtnEl.addEventListener('click', onGameBtnClick);
            achievementsBtnEl.addEventListener('click', onAchievementsBtnClick);
            historyBtnEl.addEventListener('click', onHistoryBtnClick);
            settingsBtnEl.addEventListener('click', onSettingsBtnClick);
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
        
        function onGameBtnClick() {
        	e.fire('runselect.show');
        }
        
        function onAchievementsBtnClick() {
            e.fire('achievements.show');
        }
        
        function onSettingsBtnClick() {
        	e.fire('settingspage.show');
        }
        
        function onHistoryBtnClick() {
            if (settings.getCurrentHistoryCount() < 1) {
            	e.fire('nohistory.show');
        	} else {
            	e.fire('historypage.show');
            }
        	
        }

        function init() {
            page = document.getElementById('newmain');
            bindEvents();
        }
        
        e.listeners({
            'newmain.show': show
        });
        
        return {
            init: init
        };
    }

});
