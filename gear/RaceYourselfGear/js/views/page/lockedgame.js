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
    name: 'views/page/lockedgame',
    requires: [
        'core/event',
        'models/game',
        'models/achievements'
    ],
    def: function viewsPageLockedGame(req) {
        'use strict';

        var e = req.core.event,
            page = null,
            achievements = req.models.achievements,
            game = req.models.game;

        function show(event) {
            gear.ui.changePage('#lockedgame');
            
            var gameName = event.detail;
            
            var achievement = achievements.getAchievements()[gameName];
          
            document.getElementById('locked-desc').innerHTML = achievement.description;
        }

        function onPageShow() {
            e.listen('tizen.back', onBack);
            
        }
        
        function onPageHide() {
            e.die('tizen.back', onBack);
        }
        
        function onBack() {
            history.back();
        }
        
        function bindEvents() {
            page.addEventListener('pageshow', onPageShow);
            page.addEventListener('pagehide', onPageHide);
            
            page.addEventListener('click', onBack);
        }

        function init() {
            page = document.getElementById('lockedgame');
            bindEvents();
        }

        e.listeners({
            'lockedgame.show': show
        });

        return {
            init: init
        };
    }

});
