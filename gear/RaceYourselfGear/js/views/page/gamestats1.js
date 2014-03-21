/*global define, $, console, window, history, document*/

/**
 * Main page module
 */

define({
    name: 'views/page/gamestats1',
    requires: [
        'core/event',
        'models/game',
        'models/race',
        'models/timer',
        'models/settings',
        'helpers/timer',
        'helpers/units'
    ],
    def: function viewsPageGameStats1(req) {
        'use strict';

        var e = req.core.event,
            race = req.models.race,
            game = req.models.game,
            settings = req.models.settings,
            Timer = req.models.timer.Timer,
            Time = req.helpers.timer.Time,
            units = req.helpers.units,
            page = null,
            timer = null,
            ongoing = null,
            timeEl,
            paceEl,
            paceUnitsEl,
            distanceEl,
            distanceUnitsEl;

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
            
            timeEl.innerHTML = hmm(ongoing.getDuration()/1000);
            if(settings.getPaceUnits() == 'km/h') {
                speed(ongoing.getSpeed());            
            } else {
                pace(ongoing.getPace());
            }
            distance(ongoing.getDistance());
        }
        
        function mss(seconds) {
            if (!isFinite(seconds)) return '--:--';
            
            var mins = ~~(seconds/60);
            var secs = ~~(seconds - mins*60);
            
            if (secs < 10) secs = '0' + secs;
            
            return mins + ':' + secs;
        }
        
        function hmm(seconds) {
            var hours = ~~(seconds/60/60)
            var mins = ~~((seconds - (hours*60*60))/60)
            
            if (mins < 10) mins = '0' + mins;
            
            return hours + ' ' + mins;
        }
        
        function pace(mpk) {
            var pace = mpk;
            var u = 'km';
            if(settings.getDistanceUnits() == 'Miles') {
                u = 'mile';
                pace = pace * 1.609344;
            }
                
            paceEl.innerHTML = mss(pace*60);
            paceUnitsEl.innerHTML = 'min/'+u;
        }        
        
        function speed(kmh) {
            var speed = kmh;
            var u = 'km/h';
            if(settings.getDistanceUnits() == 'Miles') {
                u = 'mph';
                speed = units.getMiles(speed);
            }
                
            paceEl.innerHTML = ~~speed;
            paceUnitsEl.innerHTML = u;
        }
        
        function distance(meters) {
            var decimals = 0;
            var value = meters;
            var u = 'meters';
            
            if(settings.getDistanceUnits() == 'Miles') {
                u = 'miles';
                value = units.getMiles(meters/1000);
                decimals = Math.max(0, 4 - (~~value).toString().length);
            }
            
            if (value > 1000) {
                value = value / 1000;
                decimals = Math.max(0, 4 - (~~value).toString().length);
            }
            
            distanceEl.innerHTML = Number(value).toFixed(decimals);
            distanceUnitsEl.innerHTML = u;
        }
        
        function bindEvents() {
            page.addEventListener('pageshow', onPageShow);
            page.addEventListener('pagehide', onPageHide);
        }

        function init() {
            page = document.getElementById('race-game');
            timeEl = document.getElementById('duration-stat');
            paceEl = document.getElementById('pace-stat');
            distanceEl = document.getElementById('distance-stat');
            paceUnitsEl = document.getElementById('pace-units');
            distanceUnitsEl = document.getElementById('distance-units');
            timer = new Timer(1000, 'views.page.gamestats1.tick');
            bindEvents();
        }

        e.listeners({
            'statsleft.show': show,
            'views.page.gamestats1.tick': tick
        });

        return {
            init: init
        };
    }

});
