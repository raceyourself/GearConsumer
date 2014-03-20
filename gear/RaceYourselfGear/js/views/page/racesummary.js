/*global define, $, console, window, history, document*/

/**
 * Main page module
 */

define({
    name: 'views/page/racesummary',
    requires: [
        'core/event',
        'models/race',
        'models/game',
        'models/race',
        'models/settings',
        'helpers/units',
        'views/page/pregame',
        'views/page/trainingtype'
    ],
    def: function viewsPageRaceSummary(req) {
        'use strict';

        var e = req.core.event,
         	app = req.models.application,
         	page = null,
         	game = req.models.game,
         	race = req.models.race,
         	settings = req.models.settings,
         	units = req.helpers.units,
            changer,
            sectionChanger;

        function show() {
            gear.ui.changePage('#racesummary');
        }

        function onPageShow() {
            sectionChanger = new SectionChanger(changer, {
                circular: false,
                orientation: "horizontal",
                scrollbar: "bar"
            });
            
            console.log(race.getOngoingRace());
            document.getElementById('duration-final').innerHTML = hmm(race.getOngoingRace().getDuration()/1000);
            distance(race.getOngoingRace().getDistance());
            document.getElementById('kcal-final').innerHTML = ~~(race.getOngoingRace().getCalories());
            document.getElementById('steps-final').innerHTML = race.getOngoingRace().getSteps();
            document.getElementById('current-sweat-final').innerHTML = ~~(race.getOngoingRace().getPointsEarned());
            document.getElementById('total-sweat-final').innerHTML = ~~(race.getOngoingRace().getPoints());
            
            e.listen('tizen.back', onBack);
        }
        
        function onBack() {
            history.back();
        }
        
        function onPageHide() {
            sectionChanger.destroy();
            e.die('tizen.back', onBack);
        }        
        
        function bindEvents() {
        	 page.addEventListener('pageshow', onPageShow);
             page.addEventListener('pagehide', onPageHide);
             
             document.getElementById('race-summary-end-btn').addEventListener('click', onSummaryEndClick);
             
            
        }

        function onSummaryEndClick() {
        	e.fire('newmain.show');
        }
        
        
        function isScrolling() {
            if (!sectionChanger) return false;
            if (Math.abs(sectionChanger.lastTouchPointX - sectionChanger.startTouchPointX) > 5) return true;
            if (Math.abs(sectionChanger.lastTouchPointY - sectionChanger.startTouchPointY) > 5) return true;
            return false;
        }
        
        
        
        function init() {
            page = document.getElementById('racesummary');
            changer = document.getElementById("race-summary-sectionchanger");
            bindEvents();
        }

        e.listeners({
            'racesummary.show': show,
        });
        
        function hmm(seconds) {
            var hours = ~~(seconds/60/60)
            var mins = ~~((seconds - (hours*60*60))/60)
            
            if (mins < 10) mins = '0' + mins;
            
            return hours + ' ' + mins;
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
            
            document.getElementById('distance-final').innerHTML = Number(value).toFixed(decimals);
            document.getElementById('distance-units').innerHTML = u;
        }

        return {
            init: init
        };
    }

});
