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
        'models/sprite',
        'models/racedata',
        'models/sapRaceYourself',
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
         	sapProvider = req.models.sapRaceYourself,
         	racedata = req.models.racedata,
         	achievements = req.models.achievements,
         	settings = req.models.settings,
         	Sprite = req.models.sprite.Sprite,
         	units = req.helpers.units,
            changer,
            sectionChanger,
            r = null,
            
            raf,
            lastRenderTime = 0,
            summaryCanvas,
            summaryContext,
            achievementSprites = [],
            isHistory = false,
            shareComplete = false,
            isHighscore = false,
            score = 0,
            highscore = 0,
            subtext = 'Pedometer',
            highscoreSprite,
            normalScoreSprite,
            sharedImage,
			facebookIcon,
			drawHighscoreText = false,
			twitterIcon;

        function show(event) {
//
//        	document.getElementById('eliminator-end').classList.toggle('hidden', true);
//            document.getElementById('eliminator-highscore').classList.toggle('hidden', true);
            
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
               	//var as = r.achievements;
               //	buildAchievements(as);
            	createScoreScreen(r);
            } 
                
            renderPrevious(r);
            
        }
        
        function createScoreScreen(r) {
        	var unlocksEl = document.getElementById('summary-unlocks');
        	unlocksEl.classList.toggle('hidden', false);
        	highscore = r.highscore || 0;
        	score = r.score || 0;
        	if (r.gpspercentage >= 20) {
        		subtext = 'GPS';
        	} else {
        		subtext = 'Pedometer';
        	}
        	isHighscore = (score > highscore);
        	if(!isHighscore) {
        		document.getElementById('eliminator-score-value').innerHTML = score;
        		document.getElementById('eliminator-best-value').innerHTML = highscore;
				document.getElementById('eliminator-end').classList.toggle('hidden');
        	} else {
        		setTimeout(function() {
					drawHighscoreText = true;
				}, 1200);
        		document.getElementById('eliminator-highscore').classList.toggle('hidden');
        	}
        	
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
        	shareComplete = false;
        	sectionChanger = new SectionChanger(changer, {
            	items: 'section:not(.hidden)',
                circular: true,
                orientation: "horizontal",
                scrollbar: "bar"
            });
        	
        	drawHighscoreText = false;
        	
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
//            document.getElementById('current-sweat-final').innerHTML = ~~(r.pointsgained);
//            document.getElementById('sweat-lost-final').innerHTML = ~~(r.pointslost);
//            document.getElementById('total-sweat-final').innerHTML = ~~(r.totalpoints);
            var steps = r.steps;
            if(steps === undefined) {
            	steps = 0;
            }
            document.getElementById('steps-final').innerHTML = steps;
            var ideal = 'N/A';
            if (isFinite(r.hrtime)) ideal = ~~(r.hrtime_in_zone*100/r.duration) + '%';
//            document.getElementById('ideal-hr-final').innerHTML = ideal;
			document.getElementById('points-final').innerHTML = ~~(r.pointsgained);
           
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
//        	for(var i=0; i<achievementSprites.length; i++) {
//            	achievementSprites[i].draw(summaryContext, summaryCanvas.width / 2 - achievementSprites[i].width / 2, summaryCanvas.height / 2 - achievementSprites[i].height / 2, dt);
//            }
        	if(!shareComplete) {
        		if(isHighscore) {
	            	highscoreSprite.draw(summaryContext, summaryCanvas.width / 2 - highscoreSprite.width / 2, summaryCanvas.height / 2 - highscoreSprite.height / 2, dt);
	            	summaryContext.font = 'bold 50px Samsung Sans';
	            	summaryContext.textAlign = 'center';
	            	summaryContext.textBaseline = 'middle';
	            	summaryContext.fillStyle = '#000';
	                if(drawHighscoreText) {
	                	summaryContext.fillText(score, summaryCanvas.width/2, summaryCanvas.height/2 - 30);
	                }
	            } 
        	} else {
        		var bottomMargin = 90;
        		sharedImage.draw(summaryContext, summaryCanvas.width / 2 - sharedImage.width / 2, summaryCanvas.height / 2 - sharedImage.height / 2 - bottomMargin / 2, dt);
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
        	document.getElementById('eliminator-end').classList.toggle('hidden', true);
            document.getElementById('eliminator-highscore').classList.toggle('hidden', true);
            e.die('tizen.back', onBack);
        }        
        
        function bindEvents() {
        	 page.addEventListener('pageshow', onPageShow);
             page.addEventListener('pagehide', onPageHide);
             
             page.addEventListener('click', onSummaryEndClick);
             
             document.getElementById('eliminator-twitter-btn').addEventListener('click', shareScore);
           	 document.getElementById('eliminator-fb-btn').addEventListener('click', shareScore);
             
             list.addEventListener('click', onItemTap);
             document.getElementById('end-game-btn').addEventListener('click', onBack);
        }
        
        function shareScore(event) {
        	event.stopPropagation();
        	if(this.id == 'eliminator-twitter-btn') {
        		sapProvider.sendShareHighscoreReq(score, 'twitter', highscore, subtext);
        	} else if(this.id == 'eliminator-fb-btn') {
        		sapProvider.sendShareHighscoreReq(score, 'facebook', highscore, subtext);
        	}
        	
        	document.getElementById('eliminator-end').classList.toggle('hidden', true);
        	shareComplete = true;
        	
            document.getElementById('eliminator-highscore').classList.toggle('hidden', true);
            summaryContext.clearRect(0, 0, summaryCanvas.width, summaryCanvas.height);
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
            
			loadImage('images/facebook_icon.jpg', function() {
				facebookIcon = new Sprite(this, this.width, 1000);
			});
			
			loadImage('images/twitter_icon.jpg', function() {
				twitterIcon = new Sprite(this, this.width, 1000);
			});
            
			loadImage('images/animation_latest_high_score_all_together.png', function() {
				highscoreSprite = new Sprite(this, this.width / 11, 1800, {loop: true, loopstart: 8});
			});
			
			loadImage('images/icon_social_media_connection.png', function() {
				sharedImage = new Sprite(this, this.width, 1000);
			});
			
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
        
        function loadImage(url, onload) {
        	var image = new Image();
        	image.onerror = function() {
        		throw 'could not load' + this.src;      	
        	}
        	image.onload = function() {
        		onload.call(this);
        	};
        	image.src = url;
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
