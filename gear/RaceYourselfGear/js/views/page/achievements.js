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
    name: 'views/page/achievements',
    requires: [
        'core/event',
        'models/achievements',
        'views/page/achievement',
        'core/template'
    ],
    def: function viewsPageAchievements(req) {
        'use strict';

        var e = req.core.event,
            achievements = req.models.achievements,
            t = req.core.template,
            page = null,
            list = null;

        function show() {
            gear.ui.changePage('#achievements');            
        }
        
        function onPageShow() {
            e.listen('tizen.back', onBack);
            render();
        }
        
        function render() {
            var as = achievements.getAchievements();
            var items = [];
            for (var key in as) {
                var a = as[key];
                var text;
                if(a.achieved.length > 0) {
                	text = 'Awarded';
                } else {
                	text = 'Not Awarded'
                }
               
                var clazzez = [];
                if (a.achieved.length > 0) clazzez.push('awarded');
                if (isFinite(a.uses) && a.achieved.length >= a.uses) clazzez.push('completed');
                items.push(t.get('achievementRow', {
                            key: key,
                            title: a.title,
                            subtitle: text,
                            classes: clazzez.join(' ')
                }));
            }
            list.innerHTML = items.join('');
        }

        function onPageHide() {
           e.die('tizen.back', onBack);
        }
        
        function onBack() {
            history.back();
        }

        function onItemTap(event) {
            var a = event.target;
            while (a && a.tagName && a.tagName.toLowerCase() !== 'a') {
                a = a.parentElement;
            }
            if (!a) return;
            event.preventDefault();
            event.stopPropagation();
            e.fire('achievement.show', a.getAttribute('data-achievement'));
        }
        
        function bindEvents() {
            page.addEventListener('pageshow', onPageShow);
            page.addEventListener('pagehide', onPageHide);
            list.addEventListener('click', onItemTap);
        }
        
        function init() {
            page = document.getElementById('achievements');
            list = document.getElementById('achievements-list');
            bindEvents();
        }
        
        e.listeners({
            'achievements.show': show
        });
        
        return {
            init: init
        };
    }

});
