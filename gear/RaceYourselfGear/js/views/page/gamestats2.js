/*global define, $, console, window, history, document*/

/**
 * Main page module
 */

define({
    name: 'views/page/gamestats2',
    requires: [
        'core/event',
        'models/game',
        'models/race',
        'models/timer'
    ],
    def: function viewsPageGameStats2(req) {
        'use strict';

        var e = req.core.event,
            race = req.models.race,
            game = req.models.game,
            Timer = req.models.timer.Timer,
            page = null,
            timer = null,
            ongoing = null,
            bpm = 'N/A',
            bpmEl,
            kcalEl,
            stepsEl;

        function show() {
        }

        function onPageShow() {
            e.listen('race.new', reloadRace);
            e.listen('pedometer.step', tick);
            e.listen('hrm.change', hrmChange);
            
            ongoing = race.getOngoingRace();
            tick();
            timer.run();
        }
        
        function onPageHide() {
            e.die('race.new', reloadRace);
            e.die('pedometer.step', tick);
            e.die('hrm.change', hrmChange);
            timer.reset();
        }
        
        function reloadRace() {
            ongoing = race.getOngoingRace();            
        }
        
        function hrmChange(hrmInfo) {
            bpm = hrmInfo.detail.heartRate;
            tick();
        }
        
        function tick() {
            if (!ongoing) return;
            bpmEl.innerHTML = bpm;
            kcalEl.innerHTML = ~~(ongoing.getCalories());
            stepsEl.innerHTML = ongoing.getSteps();
        }
        
        function bindEvents() {
            page.addEventListener('pageshow', onPageShow);
            page.addEventListener('pagehide', onPageHide);
        }

        function init() {
            page = document.getElementById('race-game');
            bpmEl = document.getElementById('bpm-stat');
            kcalEl = document.getElementById('kcal-stat');
            stepsEl = document.getElementById('steps-stat');
            timer = new Timer(1000, 'views.page.gamestats2.tick');
            bindEvents();
        }

        e.listeners({
            'statsright.show': show,
            'views.page.gamestats2.tick' : tick,
        });

        return {
            init: init
        };
    }

});
