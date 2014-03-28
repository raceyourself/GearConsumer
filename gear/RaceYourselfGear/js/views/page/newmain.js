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
        'views/page/runselect',
        'views/page/achievements',
        'views/page/settingspage',
        'views/page/racesummary',
        'views/page/nohistory'
    ],
    def: function viewsPageNewMain(req) {
        'use strict';

        var e = req.core.event,
            app = req.models.application,
            race = req.models.race,
            page = null;

        function show() {
            gear.ui.changePage('#newmain');            
        }
        
        function onPageShow() {
            e.listen('tizen.back', onBack);
        }

        function onPageHide() {
            e.die('tizen.back', onBack);
        }
        
        function onBack() {
            app.closeApplication();
        }

        function bindEvents() {
            var gameBtnEl = document.getElementById('games-btn'),
            	achievementsBtnEl = document.getElementById('achievements-btn'),
            	historyBtnEl = document.getElementById('history-btn'),
            	settingsBtnEl = document.getElementById('settings-btn');
        	
        	page.addEventListener('pageshow', onPageShow);
            page.addEventListener('pagehide', onPageHide);
            
            gameBtnEl.addEventListener('click', onGameBtnClick);
            achievementsBtnEl.addEventListener('click', onAchievementsBtnClick);
            historyBtnEl.addEventListener('click', onHistoryBtnClick);
            settingsBtnEl.addEventListener('click', onSettingsBtnClick);
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
            if (!race.getOngoingRace() && race.getRaceHistory().length == 0) {
            	e.fire('nohistory.show');
        	} else {
            	e.fire('racesummary.show');
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
