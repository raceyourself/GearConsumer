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
        'models/racedata',
        'models/settings',
        'models/achievements',
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
         	racedata = req.models.racedata,
         	achievements = req.models.achievements,
         	settings = req.models.settings,
         	units = req.helpers.units,
            changer,
            sectionChanger,
            r = null,
            
            raf,
            lastRenderTime = 0,
            summaryCanvas,
            summaryContext,
            achievementSprites = [],
            isHistory = false;

        function show(event) {
            gear.ui.changePage('#racesummary');
            
            var r;

            if(event.detail !== undefined) {
            	r = event.detail;
            	isHistory = true;
            } else {
            	r = racedata.getLatestData();
                isHistory = false;
            }  
              
            if (!!r) {
               	// Build sections
               	var as = r.achievements;
               	buildAchievements(as);
            } 
                
            renderPrevious(r);
            
        }
        
        function buildAchievements(as) {
        	achievementSprites = []
        	for (var key in as) {
            	if (!!achievements.getAchievements()[as[key]].sprite) {
            		var unlocksEl = document.getElementById('summary-unlocks');
                	unlocksEl.classList.toggle('hidden', false);
                	//unlocksEl.style.backgroundImage = "url('images/" + as[key].image + "')";
                	var achievImage = achievements.getAchievements()[as[key]].sprite;
                	console.log(achievImage);
                	achievementSprites.push(achievImage);
                	break;
            	}
            }
        }

        function onPageShow() {
            //r = race.getOngoingRace();
        	sectionChanger = new SectionChanger(changer, {
            	items: 'section:not(.hidden)',
                circular: true,
                orientation: "horizontal",
                scrollbar: "bar"
            });

        	sectionChanger.setActiveSection(0, 0);
        	
            e.listen('tizen.back', onBack);
        }
        
        function renderPrevious(r) {
            if (!r) {
                onBack();
                return;
            }
            document.getElementById('duration-final').innerHTML = hmm(r.duration/1000);
            distance(r.distance, r.distanceunits);
            document.getElementById('kcal-final').innerHTML = ~~(r.calories);
            document.getElementById('current-sweat-final').innerHTML = ~~(r.pointsgained);
            document.getElementById('sweat-lost-final').innerHTML = ~~(r.pointslost);
            document.getElementById('total-sweat-final').innerHTML = ~~(r.totalpoints);
            var steps = r.steps;
            if(steps === undefined) {
            	steps = 0;
            }
            document.getElementById('steps-final').innerHTML = steps;
            var ideal = 'N/A';
            if (isFinite(r.hrtime)) ideal = ~~(r.hrtime_in_zone*100/r.duration) + '%';
            document.getElementById('ideal-hr-final').innerHTML = ideal;
           
            generateAwards(r.achievements);
            
            lastRenderTime = Date.now();
            animate();
        }
        
        function animate(time) {
        	raf = requestAnimationFrame(animate);
        	render();
        }
        
        function render() {
        	var dt = Date.now() - lastRenderTime;
        	lastRenderTime = Date.now();
        	//console.log(dt);
        	for(var i=0; i<achievementSprites.length; i++) {
            	achievementSprites[i].draw(summaryContext, summaryCanvas.width / 2 - achievementSprites[i].width / 2, summaryCanvas.height / 2 - achievementSprites[i].height / 2, dt);
            }
            
        }
        
        function generateAwards(as) {
//            var as = r.getAchievements();
            var items = [];
            var clazz = '';
            //achievementList = achievements.getAchievements();
            for (var key in as) {
                var a = achievements.getAchievements()[as[key]];
                items.push(t.get('achievementRow', {
                            key: a.key,
                            title: a.title,
                            subtitle: a.points + ' sweat points',
                            classes: clazz
                }));
                clazz = '';
            }
        	list.innerHTML = items.join('');
            if (items.length > 0) {
            	document.getElementById('rs_awards_title').innerHTML = 'Awards';
            } else {
            	document.getElementById('rs_awards_title').innerHTML = 'No awards';
            }
        }
        
        function onBack() {
        	if(isHistory) {
        		e.fire('historypage.show');
        	} else {
        		e.fire('newmain.show');
        	}
        }
        
        function onPageHide() {
            sectionChanger.destroy();
        	document.getElementById('summary-unlocks').classList.toggle('hidden', true);
        	cancelAnimationFrame(raf);
            e.die('tizen.back', onBack);
        }        
        
        function bindEvents() {
        	 page.addEventListener('pageshow', onPageShow);
             page.addEventListener('pagehide', onPageHide);
             
             page.addEventListener('click', onSummaryEndClick);
             
             list.addEventListener('click', onItemTap);
             document.getElementById('end-game-btn').addEventListener('click', onBack);
        }

        function onSummaryEndClick() {
            if (isScrolling()) return;
            sectionChanger.nextSection(500);
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
            summaryCanvas = document.getElementById('summary-canvas');
            summaryContext = summaryCanvas.getContext('2d');
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
        
        function distance(value, u) {
            var decimals = 0;
            //var u = settings.getDistanceUnits();
            
            if(!isFinite(value)) {
            	value = 0;
            }
            
            if(u === undefined) {
            	if(settings.getDistanceUnits() == 'Km') {
            		u = 'meters';
            	} else if(settings.getDistanceUnits() == 'Miles') {
            		u = 'miles';
            	}
            }
             
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
