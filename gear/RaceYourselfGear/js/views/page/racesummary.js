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
            r = race.getOngoingRace();
            if (!r) {
                var history = race.getRaceHistory();
                if (history.length > 0) r = history[0];
            }
            
            if (!!r) {
            	// Build sections
            	var as = r.getAchievements();
                for (var key in as) {
                	if (!!as[key].image) {
                		var unlocksEl = document.getElementById('summary-unlocks');
                    	unlocksEl.classList.toggle('hidden', false);
                    	unlocksEl.style.backgroundImage = "url('images/" + as[key].image + "')";
                    	// TODO: Multiple unlocks
                    	break;
                	}
                }
            }
            
            sectionChanger = new SectionChanger(changer, {
            	items: 'section:not(.hidden)',
                circular: false,
                orientation: "horizontal",
                scrollbar: "bar"
            });

            e.listen('tizen.back', onBack);
            render();
        }
        
        function render() {
            if (!r) {
                onBack();
                return;
            }
            document.getElementById('duration-final').innerHTML = hmm(r.getDuration()/1000);
            distance();
            document.getElementById('kcal-final').innerHTML = ~~(r.getCalories());
            document.getElementById('current-sweat-final').innerHTML = ~~(r.getPointsEarned());
            document.getElementById('sweat-lost-final').innerHTML = ~~(r.getPointsLost());
            document.getElementById('total-sweat-final').innerHTML = ~~(r.getPoints());
            document.getElementById('steps-final').innerHTML = r.getSteps();
            var ideal = 'N/A';
            if (isFinite(r.data.time_in_zone)) ideal = ~~(r.data.time_in_zone*100/r.getDuration()) + '%';
            document.getElementById('ideal-hr-final').innerHTML = ideal;
            
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
        	document.getElementById('summary-unlocks').classList.toggle('hidden', true);
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
        
        function distance() {
            var decimals = 0;
            var value = r.getDistance();
            var u = r.getDistanceUnits();
            
            if (value > 1000 && u == 'meters') {
                value = value / 1000;
                u = 'kilometers';
            }
            if (u == 'kilometers' || u == 'miles') {
                if(value < 10) {
                	decimals = 2;
                } else {
                	decimals = 1;
                }
            }
            
            document.getElementById('distance-final').innerHTML = Number(value).toFixed(decimals);
            document.getElementById('s-distance-units').innerHTML = u;
        }

        return {
            init: init
        };
    }

});
