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
        'views/page/gameselect',
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
        	e.fire('gameselect.show');
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
