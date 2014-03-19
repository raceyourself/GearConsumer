/*global define, $, console, window, history, document*/

/**
 * Main page module
 */

define({
    name: 'views/page/newmain',
    requires: [
        'core/event',
        'models/application',
        'views/page/gameselect'
    ],
    def: function viewsPageNewMain(req) {
        'use strict';

        var e = req.core.event,
            app = req.models.application,
            page = null;

        function show() {
            gear.ui.changePage('#newmain');            
        }
        
        function onPageShow() {
            e.listen('fling.right', flingRight);
            e.listen('tizen.back', onBack);
        }

        function onPageHide() {
            e.die('fling.right', flingRight);
            e.die('tizen.back', onBack);
        }
        
        function flingRight() {
            e.fire('main.show');
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
        	
        }
        
        function onSettingsBtnClick() {
        	
        }
        
        function onHistoryBtnClick() {
        	
        }

        function init() {
            page = document.getElementById('newmain');
            bindEvents();
            // Assume we always start in this view
            onPageShow();
        }
        
        e.listeners({
            'newmain.show': show
        });
        
        return {
            init: init
        };
    }

});
