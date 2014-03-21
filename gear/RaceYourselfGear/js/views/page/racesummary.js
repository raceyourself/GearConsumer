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
        'views/page/trainingtype',
        'core/template'
    ],
    def: function viewsPageRaceSummary(req) {
        'use strict';

        var e = req.core.event,
            t = req.core.template,
         	app = req.models.application,
         	page = null,
         	list = null,
         	game = req.models.game,
         	race = req.models.race,
         	settings = req.models.settings,
         	units = req.helpers.units,
            changer,
            sectionChanger,
            r = null;

        function show() {
            gear.ui.changePage('#racesummary');
        }

        function onPageShow() {
            sectionChanger = new SectionChanger(changer, {
                circular: false,
                orientation: "horizontal",
                scrollbar: "bar"
            });

            r = race.getOngoingRace();
            if (!r) {
                var history = race.getRaceHistory();
                if (history.length > 0) r = history[0];
            }
            
            e.listen('tizen.back', onBack);
            render();
        }
        
        function render() {
            if (!r) {
                onBack();
                return;
            }
            document.getElementById('duration-final').innerHTML = hmm(r.getDuration()/1000);
            distance(r.getDistance());
            document.getElementById('kcal-final').innerHTML = ~~(r.getCalories());
            document.getElementById('steps-final').innerHTML = r.getSteps();
            document.getElementById('current-sweat-final').innerHTML = ~~(r.getPointsEarned());
            document.getElementById('total-sweat-final').innerHTML = ~~(r.getPoints());
            
            generateAwards();
        }
        
        function generateAwards() {
            var as = r.getAchievements();
            var items = [];
            var clazz = '';
            for (var key in as) {
                var a = as[key];
                items.push(t.get('achievementRow', {
                            key: a.key,
                            title: a.title,
                            subtitle: a.points + ' sweat points',
                            classes: clazz
                }));
                clazz = '';
            }
            list.innerHTML = items.join('');
        }
        
        function onBack() {
            e.fire('newmain.show');
        }
        
        function onPageHide() {
            sectionChanger.destroy();
            e.die('tizen.back', onBack);
        }        
        
        function bindEvents() {
        	 page.addEventListener('pageshow', onPageShow);
             page.addEventListener('pagehide', onPageHide);
             
             page.addEventListener('click', onSummaryEndClick);
             list.addEventListener('click', onItemTap);
        }

        function onSummaryEndClick() {
            if (isScrolling()) return;
        	e.fire('newmain.show');
        }        
        
        function onItemTap(event) {
            if (isScrolling()) return;
            var a = event.target;
            while (a && a.tagName && a.tagName.toLowerCase() !== 'a') {
                a = a.parentElement;
            }
            if (!a) return;
            event.preventDefault();
            event.stopPropagation();
            e.fire('achievement.show', a.getAttribute('data-achievement'));
        }
        
        function isScrolling() {
            if (!sectionChanger) return false;
            if (Math.abs(sectionChanger.lastTouchPointX - sectionChanger.startTouchPointX) > 5) return true;
            if (Math.abs(sectionChanger.lastTouchPointY - sectionChanger.startTouchPointY) > 5) return true;
            return false;
        }        
        
        
        function init() {
            page = document.getElementById('racesummary');
            list = document.getElementById('summary-achievements-list');
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
            document.getElementById('s-distance-units').innerHTML = u;
        }

        return {
            init: init
        };
    }

});
