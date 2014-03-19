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
                var text = 'Awarded ';
                if (!isFinite(a.uses)) text = text + a.achieved.length
                else text = text + a.achieved.length + '/' + a.uses
                text = text + ' times';
                items.push(t.get('achievementRow', {
                            key: key,
                            title: a.title,
                            subtitle: text
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
