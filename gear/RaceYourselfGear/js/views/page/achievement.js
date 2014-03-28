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
    name: 'views/page/achievement',
    requires: [
        'core/event',
        'models/achievements',
        'core/template'
    ],
    def: function viewsPageAchievement(req) {
        'use strict';

        var e = req.core.event,
            achievements = req.models.achievements,
            page = null;

        function show(event) {
            var key = event.detail;
            gear.ui.changePage('#achievement');
            render(key);
        }

        function render(key) {
            var achievement = achievements.getAchievements()[key];
            document.getElementById('achievement-title').innerHTML = achievement.title;
            document.getElementById('achievement-description').innerHTML = achievement.description;

            var text = 'Awarded ';
            if (!isFinite(achievement.uses)) text = text + achievement.achieved.length
            else text = text + achievement.achieved.length + ' out of a maximum of ' + achievement.uses
            text = text + ' times';
            
            document.getElementById('achievement-awarded').innerHTML = text;
            document.getElementById('achievement-progress').innerHTML = achievement.progress();
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
        }
        
        function init() {
            page = document.getElementById('achievement');
            bindEvents();
        }
        
        e.listeners({
            'achievement.show': show
        });
        
        return {
            init: init
        };
    }

});
