/*global define, $, console, window, history, document*/

/**
 * Main page module
 */

define({
    name: 'views/page/gamestats3',
    requires: [
        'core/event',
        'models/game',
        'models/race',
        'models/timer'
    ],
    def: function viewsPageGameStats3(req) {
        'use strict';

        var e = req.core.event,
            race = req.models.race,
            game = req.models.game,
            Timer = req.models.timer.Timer,
            page = null,
            timer = null,
            ongoing = null,
            caughtEl,
            sspeedEl,
            idealEl;

        function show() {
        }

        function onPageShow() {
            e.listen('race.new', reloadRace);
            e.listen('pedometer.step', tick);
            
            ongoing = race.getOngoingRace();
            tick();
            timer.run();
        }
        
        function onPageHide() {
            e.die('race.new', reloadRace);
            e.die('pedometer.step', tick);
            timer.reset();
        }
        
        function reloadRace() {
            ongoing = race.getOngoingRace();            
        }
        
        function tick() {
            if (!ongoing) return;
            caughtEl.innerHTML = ongoing.data.times_caught || 0;
            sspeedEl.innerHTML = ongoing.data.times_sped || 0;
            var mins = 'N/A';
            if (isFinite(ongoing.data.time_in_zone)) mins = ~~(ongoing.data.time_in_zone/1000/60);
            idealEl.innerHTML = mins
        }
        
        function bindEvents() {
            page.addEventListener('pageshow', onPageShow);
            page.addEventListener('pagehide', onPageHide);
        }

        function init() {
            page = document.getElementById('race-game');
            caughtEl = document.getElementById('caught-stat');
            sspeedEl = document.getElementById('sspeed-stat');
            idealEl = document.getElementById('ideal-hr-stat');
            timer = new Timer(1000, 'views.page.gamestats3.tick');
            bindEvents();
        }

        e.listeners({
            'statsright.show': show,
            'views.page.gamestats3.tick' : tick,
        });

        return {
            init: init
        };
    }

});
