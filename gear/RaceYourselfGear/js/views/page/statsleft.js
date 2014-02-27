/*global define, $, console, window, history, document*/

/**
 * Main page module
 */

define({
    name: 'views/page/statsleft',
    requires: [
        'core/event',
        'models/game',
        'models/race',
        'models/timer',
        'helpers/timer'
    ],
    def: function viewsPageStatsLeft(req) {
        'use strict';

        var e = req.core.event,
            race = req.models.race,
            game = req.models.game,
            Timer = req.models.timer.Timer,
            Time = req.helpers.timer.Time,
            page = null,
            timer = null,
            ongoing = null,
            distanceEl,
            durationEl;

        function show() {
            gear.ui.changePage('#stats-left');
        }

        function onPageShow() {
            e.listen('race.new', reloadRace);
            e.listen('pedometer.step', tick);
            e.listen('fling.left', flingLeft);
            
            ongoing = race.getOngoingRace();
            tick();
            timer.run();
        }
        
        function onPageHide() {
            e.die('race.new', reloadRace);
            e.die('pedometer.step', tick);
            e.die('fling.left', flingLeft);
            timer.reset();
        }
        
        function reloadRace() {
            ongoing = race.getOngoingRace();            
        }
        
        function flingLeft() {
            e.fire(game.getCurrentGame()+'.show');
        }
        
        function tick() {
            distanceEl.innerHTML = ~~ongoing.getDistance();
            durationEl.innerHTML = new Time(ongoing.getDuration());
        }
        
        function bindEvents() {
            page.addEventListener('pageshow', onPageShow);
            page.addEventListener('pagehide', onPageHide);
        }

        function init() {
            page = document.getElementById('stats-left');
            distanceEl = document.getElementById('distance-stat');
            durationEl = document.getElementById('duration-stat');
            timer = new Timer(1000, 'views.page.statsleft.tick');
            bindEvents();
        }

        e.listeners({
            'statsleft.show': show,
            'views.page.statsleft.tick': tick
        });

        return {
            init: init
        };
    }

});
