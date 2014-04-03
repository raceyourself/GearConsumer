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
    name: 'views/page/hrzgame',
    requires: [
        'core/event',
        'views/page/gameachievements',
		'views/page/hrzones',
        'views/page/gamestats1',
        'views/page/gamestats2',
        'views/page/gamestats3',
        'views/page/gamestats4',
//        'views/page/gameselect',
        'models/race',
        'models/hrm',
        'models/mocks/hrm',
        'models/sprite',
        'models/settings',
        'models/config',
		'models/game',
		'views/page/sweatpoint_rising',
    ],
    def: function viewsPageHeartRateZombiesGame(req) {
        'use strict';

        var e = req.core.event,
            race = req.models.race,
            hrm = req.models.hrm,
            hrmMock = req.models.mocks.hrm,
            game = req.models.game,
            settings = req.models.settings,
            config = req.models.config,
            Sprite = req.models.sprite.Sprite,
            SweatPoint = req.views.page.sweatpoint_rising.SweatPoint,
            page = null,
            canvas,
            context,
            TRACK_LENGTH = Infinity,
            targetTime = Infinity,
            lastRender = null,
            bannerTimeout = false,
            raf = false,
            wave = 1,
            banner = false,
            finished = false,
            countingdown = false,
            runner = null,
            heartGreen = null,
            heartRed = null,
            heartBlack = null,
            deadImage = null,
            deadRunnerImage = null,
            gpsDot = null,
            gpsAvailable = false,
            gpsRing = null,
            sweat = null,
            sweat_red = null,
            paceIcon = null,
            runnerAnimations = {
                    idle: { name: 'idle', sprite: null, speedThreshold: 0},
                    idle_red: { name: 'idle_red', sprite: null, speedThreshold: 0},
                    running: { name: 'running', sprite: null, speedThreshold: 0.1},
                    running_red: { name: 'running_red', sprite: null, speedThreshold: 0.1},
                    sprinting: { name: 'sprinting', sprite: null, speedThreshold: 4},
                    sprinting_red: { name: 'sprinting_red', sprite: null, speedThreshold: 4},
                    zombieDead: { name: 'zombieDead', sprite: null, speedThreshold: -1},
                    dinoDead: { name: 'dinoDead', sprite: null, speedThreshold: -1}
            },
            notification = {
            		active: false,
            		colour: '#fff',
            		textColour: '#000',
            		text: 'Achievement Unlocked',
            		period: 600,
            		phase: 0,
            		},
            notificationTimeout = false,            	
            animatedSprites = [],
            zombies = [],
            zombieIdle = null,
            dino = null,
            meteor = null,
            dinoBiting = null,
            dinoIdle = null,
            boulder = null,
            dinoGameImage = null,
            //elimGameImage = null,
            //boulderGameImage = null,
            weightLossGameImage = null,
            strengthGameImage = null,
            meteorGameImage = null,
            dinoUnlockImageFS = null,
            finishedImage = null,
            awardImage = null,
            numZombies = 0,
            zombieInterval = false,
            zombieSpeed = 0,
            completionSound = null,
            zombieMoan = null,
            zombieGrowl = null,
            dinoRoar = null,
            dinoKill = null,
            boulderBounce = null,
            boulderKill = null,
            regularSound = null,
            killSound = null,
            chime = null,
            visible = false,
            changer,
            sectionChanger,
            fpsInterval = false,
            frames = 0,
            fps = 0,
            lastDistanceAwarded = 0,
            ppm = 0, // pts/meter
            hr = 100,
            rToRTime= 1,
            maxHeartRate = 150,
            minHeartRate = 120,
            maxPossibleHeartRate = 200,
            minPossibleHeartRate = 50,
            lastHRtime = 0,
            hrColour = '#fff',
            zombieStartOffset = -11,
            zombieCatchupSpeed = -zombieStartOffset/500,
            zombieOffset = zombieStartOffset,
            screenWidthDistance = -zombieStartOffset,	//'real-world' distance covered by the screen's width
            screenLeftDistance = zombieOffset,		//'real-world' position of left of screen
            zombiePosWeight = 0,
			hrZones = [],
			currentHRZone = null,
			currentZone = 0,
			warmupTimeout = false,
			warmingUp = false,
			timeMultiplier = 1,			//hack to test quickly. Set to 1
			intervalTimeout = false,
			zoneAdaptTimeout = false,
			warningTimeoutLow = false,
			warningTimeoutHigh = false,
			zombiesCatchingUp = false,
			adaptingToRecentZoneShift = false,
			adaptingTimeout = false,
			showWarningLow = false,
			showWarningHigh = false,
			isDead = false,
			scale = 1,
			opponent = 'zombie',
			green = '#51b848',
            red = '#cb2027',
            amber = '#f7941d',
            hrWarningPhase = 0,
            hrWarningPeriod = 3*1000,
            lightRed = '#731216',
			flashingRed = 'flashingRed',
			flashingRedParams = { colour: '#fff', period:400, phase: 0 },
			hrNotFound = false,
			unlockNotification = null,
			unlockNotificationTimer = null,
			dottedPattern = null,
			countDownParams = { radius: 100, outerRadius: 250, outerRadiusMax: 250, shrinkSpeed: 5, stageDuration:1, startTime:0},
			goodBG = null,
			badBG = null,
			timeTurnedGood = Date.now(),
			timeTurnedBad = 0,
			crossFadeParametric = 0,
			crossFadeTime = 1,
			badFraction = 0,
            hasGPSUpdate = false,
            heartBeatInterval = null,
            heartBeatOn = false,
            heartBeatOnFrameCount = 0,
            numAwardsAtFinish = 0,
            unlockNotificationActive = false,
            hasBeenInGoalHRZone = false,
            loaded = false,
            loading = false,
            waiting = false,
            pendingAssets = 0,
            bgHeight = 246,
            sweatPointGraphics = [],
            sweatPointAwardsSinceLastGraphic = 0,
            started = false;


        function show() {
            gear.ui.changePage('#race-game');
        }

		function setNotification(colour, textColour, text, text2, duration)
		{
			notification.colour = colour;
			notification.textColour = textColour;
			notification.text = text;
			notification.text2 = text2;
			notification.active = true;
			if(notificationTimeout != false) 
			{ clearTimeout(notificationTimeout); }
			if(duration>0)
			{
				notificationTimeout = setTimeout(clearNotification, duration);
			}
		}
		
		function clearNotification()
		{
			notification.active = false;
			clearTimeout(notificationTimeout);
			notificationTimeout = false;
		}

		function clearUnlockNotification()
		{
			clearTimeout(unlockNotificationTimer);
			unlockNotification = null;
		}

		function showUnlockNotification(game, time)
		{
			//switch to game screen
			sectionChanger.setActiveSection(1, 500);
			//vibrate
			if(settings.getVibrateActive()) {
				console.log('vibrate: unlock notification');
				navigator.vibrate([10, 10, 10, 10, 10, 10, 10]);
			}
			unlockNotification = game;
			//TODO - have this only disappear 5s after user raises wrist
			//unlockNotificationTimer = setTimeout(clearUnlockNotification, time*1000);
			unlockNotificationActive = true;
		}

		function onTapHandler(data)
		{
			if(isScrolling() && !finished) return;
			//dismiss
			clearUnlockNotification();

			if(unlockNotificationActive)
			{
				//progress to end screen if this was the finished notification
				if(finished)
				{
					continueToResults();
				}
				unlockNotificationActive = false;
				return;
			}
			else if (sectionChanger) {
				sectionChanger.nextSection(500);
			}
						
//			if(warmingUp)
//			{
//				if(data.pageY > badBG.height)
//				{
//					endWarmup();
//				}
//			    return;
//			}
			

		}
        
        function isScrolling() {
            if (!sectionChanger) return false;
            if (Math.abs(sectionChanger.lastTouchPointX - sectionChanger.startTouchPointX) > 5) return true;
            if (Math.abs(sectionChanger.lastTouchPointY - sectionChanger.startTouchPointY) > 5) return true;
            return false;
        }
        
		function onUnlockDino()
		{
			showUnlockNotification('dino', 5);
		}
		
//		function onUnlockBoulder()
//		{
//			showUnlockNotification('boulder', 5);
//		}

		function onUnlockWeightLoss() {
			showUnlockNotification('WeightLoss', 5);
		}
		
		function onUnlockStrength() {
			showUnlockNotification('Strength', 5);
		}
		
		function onUnlockMeteor() {
			showUnlockNotification('meteor', 5);
		}
		
		
        function onPageShow() {
        	console.log('hrzgame:pageshow');
        	if (!loaded) {
        		waiting = true;
        		loadAssets();
        		return;
        	}
            visible = true;
            finished = false;
            sectionChanger = new SectionChanger(changer, {
                circular: true,
                orientation: "horizontal",
                scrollbar: "bar"                	
            });

			//start the canned hrm sequence if in demo mode
			if (config.getIsDemoMode()) {
				hrmMock.startCanned();
            }                       
            
            sectionChanger.setActiveSection(0, 0);
            
            e.listen('tizen.back', onBack);
            e.listen('motion.wristup', onWristUp);
            document.getElementById('quit-confirmation').classList.toggle('hidden', true);
            
            started = false;
            ppm = 0;
            
            var r = race.getOngoingRace();
            if (r === null || !r.isRunning() || r.hasStopped()) {
                r = race.newRace();
                lastDistanceAwarded = 0;
                r.data.hr_zones = true;
                r.data.time_in_zone = 0;
                e.listen('pedometer.step', step);
                e.listen('hrm.change', onHeartRateChange);

//                startCountdown();
            }

			//reset any existing animations
			for(var i=0; i<animatedSprites.length; i++)
			{
				animatedSprites[i].reset();
			}
            
			e.listen('game.unlock.dino', onUnlockDino);
			e.listen('game.unlock.WeightLoss', onUnlockWeightLoss);
			e.listen('game.unlock.meteor', onUnlockMeteor);
            e.listen('game.unlock.Strength', onUnlockStrength);
			//e.listen('game.unlock.boulder', onUnlockBoulder);
			//e.listen('game.unlock.eliminator', onUnlockEliminator)
			e.listen('achievement.awarded', onAchievementAwarded);
			page.addEventListener('click', onTapHandler);
            isDead = false;
			var length = settings.getDistance();
			console.log('target dist = ' + length);
//			var type = settings.getTargetType();
			var type = settings.getCurrentTarget();
			
			TRACK_LENGTH = Infinity;
			targetTime = Infinity;
			if (type == 'time') { targetTime = settings.getTime() * 60 * 1000; }
			else if (type == 'distance') { TRACK_LENGTH = settings.getDistance(); }
				
            lastHRtime = Date.now();
            
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;        
            
//			sweat.scaleTo( 2, 1000);
//			sweat_red.scaleTo( 2, 1000);
            
            frames = 0;
            fpsInterval = setInterval(function() {
                fps = frames;
                frames = 0;
            }, 1000);
            
            animate();
            requestRender();
            
            //get opponent type from game
			setOpponent(game.getCurrentOpponentType());
			setOpponent('meteor');

            zombieCatchupSpeed = -zombieStartOffset/config.getCatchupTime();
            
			startRun();
        }
        
        //start the run, but not the game
        function startRun()
        {
			//end warmup - now misnamed, actually sets the initial hr zone we want, based on goal type
            endWarmup();
			race.getOngoingRace().start();
            startZombies();
			lastRender = Date.now();

        }
        
        function onAchievementAwarded(data)
        {
        	setNotification( green, '#fff', 'Award Unlocked!', null, 3*1000);
        	if(settings.getVibrateActive()) {
				console.log('vibrate: award unlocked');
        		navigator.vibrate([100, 50, 100, 50]);
        	}
			
			if(finished)
			{
				numAwardsAtFinish++;
			}
			if(settings.getAudioActive()) {
				chime.play();
			}
        }
        
        function setOpponent(type)
        {
        	opponent = type;
        	switch(type)
        	{
        		case 'zombie':
        			regularSound = zombieMoan;
        			killSound = zombieGrowl;
					break;
        		case 'dinosaur':
        			regularSound = dinoRoar;
        			killSound = dinoRoar;
					break;
        		case 'boulder':
        			regularSound = zombieMoan;
        			killSound = zombieGrowl;
					break;
				case 'meteor':
					regularSound = null;
					killSound = null;
					break;
				default:
					console.error('unrecognised opponent type: ' + game.getCurrentOpponentType());
					break;
        	}
        }
        
        function onPageHide() {
        	console.log('hrzgame:pagehide');
            e.die('tizen.back', onBack);
            e.die('motion.wristup', onWristUp);
            visible = false;
            clearInterval(fpsInterval);
			clearTimeout(warmupTimeout);
            clearTimeout(intervalTimeout);
            clearTimeout(adaptingTimeout);
            clearTimeout(warningTimeoutLow);
			clearTimeout(warningTimeoutHigh);
			clearInterval(heartBeatInterval);
            if (!!sectionChanger) {
            	sectionChanger.destroy();
            	sectionChanger = false;
            }
            
            var r = race.getOngoingRace();
            if (r !== null) {
                r.stop();
                lastRender = null;                
                e.die('pedometer.step', step);
                e.die('hrm.change', onHeartRateChange);
            }
            if (!!raf) cancelAnimationFrame(raf);
            clearInterval(zombieInterval);
            clearTimeout(bannerTimeout)
            e.die('game.unlock.dino', onUnlockDino);
            //e.die('game.unlock.boulder', onUnlockBoulder);
            e.die('game.unlock.WeightLoss', onUnlockWeightLoss);
            e.die('game.unlock.meteor', onUnlockMeteor);
            e.die('game.unlock.Strength', onUnlockStrength);
            e.die('achievement.awarded', onAchievementAwarded);
			page.removeEventListener('click', onTapHandler);
        }        
        
        function onBack() {
            document.getElementById('quit-confirmation').classList.toggle('hidden');
        }
        
        function onWristUp() {
        	sectionChanger.setActiveSection(1, 1000);
        }        
        
        function onQuit() {
            e.fire('newmain.show');
        }
        
        function startCountdown() {
            countingdown = true;
			banner = 'READY';
            clearTimeout(bannerTimeout);
            bannerTimeout = setTimeout(ready, countDownParams.stageDuration * 1000);
			countDownParams.outerRadius = countDownParams.outerRadiusMax;
			countDownParams.startTime = Date.now();
			if(settings.getVibrateActive()) {
				console.log('vibrate: countdown');
				navigator.vibrate([500]);
			}
        }
        
        function ready() {
            banner = 'SET';
            requestRender();
            clearTimeout(bannerTimeout);
            bannerTimeout = setTimeout(set, countDownParams.stageDuration * 1000);
            countDownParams.outerRadius = countDownParams.outerRadiusMax;
			countDownParams.startTime = Date.now();
			if(settings.getVibrateActive()) {
				console.log('vibrate: countdown');
				navigator.vibrate([250]);
			}        
		}
			
        function set() {
            banner = 'GO';
            requestRender();
            clearTimeout(bannerTimeout);
            bannerTimeout = setTimeout(go, countDownParams.stageDuration * 1000);
            countDownParams.outerRadius = countDownParams.outerRadiusMax;
			countDownParams.startTime = Date.now();
			if(settings.getVibrateActive()) {
				console.log('vibrate: countdown');
				navigator.vibrate([250]);
			}
		}
        function go() {

			started = true;
            requestRender();
            countingdown = false;
            clearTimeout(bannerTimeout);
            bannerTimeout = setTimeout(clearbanner, countDownParams.stageDuration * 1000);

            //warmupTimeout = setTimeout(endWarmup, config.getWarmupPeriod()*1000 * timeMultiplier);	//5 minutes warmup
			countDownParams.outerRadius = countDownParams.outerRadiusMax;
			countDownParams.startTime = Date.now();
			//10 second notification of warming up
//            var warmupDurationMinutes = Math.floor(config.getWarmupPeriod() / 60);
//			setNotification(green, '#fff', 'Warm up for ' + warmupDurationMinutes + 'min', 'Tap to skip', 10*1000);
//			warmingUp = true;
			if(settings.getVibrateActive()) {
				console.log('vibrate: countdown');
				navigator.vibrate([750]);
			}
        }
        
        function restart() {
        	started = true;
        	countingdown = false;
        	startZombies();
        	clearTimeout(bannerTimeout);
        	bannerTimeout = setTimeout(clearbanner, countDownParams.stageDuration * 1000);
			countDownParams.startTime = Date.now();
			zombiePosWeight = 0;
        }
        
        function endWarmup() 
        {
			warmingUp = false;
        	var r = race.getOngoingRace();
        	        	console.log("Warmup over. Goal is: " + r.getGoal());
//        	setNotification(green, '#fff', 'Warmup Over', null, 5*1000);

        	switch(r.getGoal())
        	{
        	
        		case "WeightLoss":
        		//set new zone and stay there
        			setCurrentHRZone("Light");
        			break;
        		case "Endurance":
        		//set light zone, then step up to aerobic later
        			setCurrentHRZone("Aerobic");
        			break;
				case "Strength":
					setCurrentHRZone("Aerobic");
				//set light zone then step up later
					intervalTimeout = setTimeout(nextHRZone, 30*1000 * timeMultiplier);
					break;
				default:
					setCurrentHRZone("Aerobic");
					console.error("Unknown goal type: " + r.getGoal());
					break;
        	}
        	console.log("Ended warmup. Now in zone " + currentHRZone);
        }
        

        
        
        function nextHRZone()
        {

			var r = race.getOngoingRace();
        	console.log("Next HR Zone. Goal is: " + r.getGoal());
			switch(r.getGoal())
			{
				case "Endurance":
					break;
				case "Strength":
					switch(currentHRZone)
					{
						case "Recovery":
						case "Light":
						case "Anaerobic":
							//transition to Aerobic for next interval
							setCurrentHRZone("Aerobic");
							intervalTimeout = setTimeout(nextHRZone, config.getRecoverDuration()*1000 * timeMultiplier);
							//vibrate
//							if(settings.getVibrateActive()) {
//								console.log('vibrate: switched hr zone to anaerobic');
//								navigator.vibrate([10, 100, 10, 100, 10]);
//							}
							//notify
							setNotification(green, '#fff', 'Recover for ' + config.getRecoverDuration() + 's', null, 5*1000);
							break;
						case "Aerobic":
							//transition up to Anaerobic
							setCurrentHRZone("Anaerobic");
							intervalTimeout = setTimeout(nextHRZone, config.getSprintDuration()*1000 * timeMultiplier);
							//vibrate
//							if(settings.getVibrateActive()) {
//								console.log('vibrate: switched hr zone to aerobic');
//								navigator.vibrate([100, 10, 100, 10, 100]);
//							}
							//notify
							setNotification(red, '#fff', 'Sprint for ' + config.getSprintDuration() + 's', null, 5*1000);
							break;
						default:
							console.log("shouldn't be in this zone in Strength training: " + currentHRzone);
					}
				}
				console.log("Interval Complete. Now in zone: " + currentHRZone);
        }

        
        function setCurrentHRZone(zone)
        {
        	//update heart-rate based logic
        	handleHRChanged();

        if(zone == currentHRZone)
        {

        }
        else
        {
        	currentHRZone = zone;

        	var hrMinMax = new Object();
        	var min20, max20, min75, max75;
        	switch(zone)
        	{
        	case "Recovery":
        		min20 = 0;
        		max20 = 120;
        		min75 = 0;
        		max75 = 90;
        		numZombies = 0;
        		break;
        	case "Light":
	        	min20 = 120;
	        	max20 = 140;
	        	min75 = 90;
	        	max75 = 110;
	        	numZombies = 1;
	        	break;
			case "Aerobic":
        		min20 = 140;
        		max20 = 160;
        		min75 = 110;
        		max75 = 120;
        		numZombies = 2;
        		break;
        	case "Anaerobic":
        		min20 = 160;
        		max20 = 180;
        		min75 = 120;
        		max75 = 135;
        		numZombies = 3;
        		break;
			case "Performance":
				min20 = 180;
				max20 = 200;
				min75 = 135;
				max75 = 150;
				numZombies = 4;
				break;
			default:
				console.log("Unknown heart rate zone");
        		min20 = 140;
        		max20 = 160;
        		min75 = 110;
        		max75 = 120;
        		numZombies = 1;
			}
			var age = settings.getAgeRange();
			//clamp to range 20-75
			age = Math.min( age, 75);
			age = Math.max( age, 20);
			var p = 1-(75 - age)/(75-20);
			maxHeartRate = max20 - p * (max20 - max75);
			minHeartRate = min20 - p * (min20 - min75);
			console.log("age = " + age + " " + minHeartRate + " " + maxHeartRate);
			//set that we are currently adapting
			adaptingToRecentZoneShift = true;
			//15 seconds to adapt
			var adaptPeriod = config.getIsDemoMode? 5 : config.getAdaptPeriod();
			adaptingTimeout	= setTimeout(adaptComplete, adaptPeriod * 1000 * timeMultiplier);
			
			var zoneInfo = new Object();
        	zoneInfo.name = zone;
        	zoneInfo.maxHeartRate = maxHeartRate;
        	zoneInfo.minHeartRate = minHeartRate;
        	e.fire('hrzone.change', zoneInfo);
        	
			//vibrate
        	if(settings.getVibrateActive()) {
				console.log('vibrate: set new hr zone');
        		navigator.vibrate([10, 10, 10, 10, 10, 10, 10]);
        	}
        }
        }

        function adaptComplete()
        {
        	adaptingToRecentZoneShift = false;
        }
        
        function clearbanner() {
            banner = false;
            requestRender();
        }
        
        function nextWave() {
        	isDead = false;
        	runner = runnerAnimations.running;
            countingdown = true;
            wave++;
//            zombieCatchupSpeed += 0.01;
            banner = 'GO';
            zombieOffset = zombieStartOffset;
            requestRender();
            clearTimeout(bannerTimeout);
            bannerTimeout = setTimeout(restart, 1500);
            startZombies();
//            zombiePosWeight = 0;
        }
        
        function startZombies() {
            clearInterval(zombieInterval);
            //4 zombies, we just don't show them all
            while (zombies.length < 4) {
                zombies.push(zombies[0].clone());
            };
            for (var i=0;i<zombies.length;i++) {
                zombies[i].reset();
                var animDelay = Math.random() * zombies[i].getPeriod();
                zombies[i].time = animDelay;
            }
            zombieOffset = zombieStartOffset;
//            int intervalTime = Math.min(350, 750-(wave*50));
			var intervalTime = 33;
            zombieInterval = setInterval(zombieTick, intervalTime);
        }
        
        function zombieTick() 
        {
        	//zombies catch up
        	if(zombiesCatchingUp && hasBeenInGoalHRZone)
        	{
            	zombieOffset += zombieCatchupSpeed;
        	}
        	
        	//zombies fall back
        	if(hr >= minHeartRate && hr <= maxHeartRate)
        	{
				var timeGood = Date.now() - timeTurnedGood;
				if(timeGood > 30*1000)
				{
					if(zombieOffset > zombieStartOffset)
					{ zombieOffset -= zombieCatchupSpeed; }
				}
        	}
        	
        	var r = race.getOngoingRace();
            requestRender();
            step();
            			
			//check how long since heartrate
			if( Date.now() - lastHRtime > 10*1000 )
			{
				hrNotFound = true;			
				e.fire('heartrate.lost');
			}
	
			//update sweat point graphics
			for(var i=0; i<sweatPointGraphics.length; i++)
			{
				sweatPointGraphics[i].tick();
			}
	
			//Update Heart Rate related mechanics
			if(hr < minHeartRate)
			{	
				showWarningHigh = false;
				if(!isDead && started)
				{
					ppm = 0; // Standard pts/meter
				}
				if(warningTimeoutHigh != false)
				{
					clearTimeout(warningTimeoutHigh);
					warningTimeoutHigh = false;
				}
				if(!showWarningLow && !adaptingToRecentZoneShift)
				{
					//don't show the warning if we just shifted zones.
					//colouring and 'speed up' text will still be present
					timeTurnedBad = Date.now();
					clearNotification();
					setNotification(flashingRed, '#fff', 'Heart Rate too low!', null, 0);
					showWarningLow = true;
					if(settings.getAudioActive() && regularSound != null) {
						regularSound.play();
					}
					if(settings.getVibrateActive()) {
						console.log('vibrate: hr low warning');
						navigator.vibrate([1000, 500, 250, 100]);
					}
				}
				if(!adaptingToRecentZoneShift)
				{
					if(warningTimeoutLow == false)
					{
						var warningPeriod = config.getIsDemoMode? 3 : config.getWarningPeriod();
						warningTimeoutLow = setTimeout(warningOver_low, warningPeriod*1000 * timeMultiplier);
					}
				}
			}
			else if(hr > maxHeartRate)
			{
				showWarningLow = false;
				zombiesCatchingUp = false;
				if(!isDead && started)
				{
					ppm = config.getPpmBad(); // Negative pts/meter
				}
				if(warningTimeoutLow != false)
				{
					clearTimeout(warningTimeoutLow);
					warningTimeoutLow = false;
				}
				
				//TODO check if stationary and use stationary red if so
				if(!showWarningHigh && !adaptingToRecentZoneShift)
				{
					//don't show the warning if we just shifted zones.
					//colouring and 'speed up' text will still be present
					timeTurnedBad = Date.now();
					clearNotification();
					setNotification(flashingRed, '#fff', 'Heart Rate too high!', null, 0);
					showWarningHigh = true;
					if(settings.getVibrateActive()) { 
						console.log('vibrate: hr high warning');
						navigator.vibrate([1000, 500, 250, 100]);
					}
				}
				if(!adaptingToRecentZoneShift)
				{
					if(warningTimeoutHigh == false)
					{
						var warningPeriod = config.getIsDemoMode? 3 : config.getWarningPeriod();
						warningTimeoutHigh = setTimeout(warningOver_high, warningPeriod*1000 * timeMultiplier);
					}
				}
			}
			else
			{
				if(!isDead && started)
				{
					ppm = config.getPpmGood(); // Standard pts/meter
				}
				//clear warning
				if(warningTimeoutHigh != false)
				{
					clearTimeout(warningTimeoutHigh);
					warningTimeoutHigh = false;
				}
				if(warningTimeoutLow != false)
				{
					clearTimeout(warningTimeoutLow);
					warningTimeoutLow = false;
				}
				if(showWarningLow || showWarningHigh)
				{
					timeTurnedGood = Date.now();
					showWarningLow = false;
					showWarningHigh = false;
					clearNotification();
				}
				//stop zombies catching up
				zombiesCatchingUp = false;
			}
        }

        
        function stopZombies() {
            clearInterval(zombieInterval);
        }
        
        
        function onHeartRateChange(hrmInfo) {
        	//set heartRate
        	lastHRtime = Date.now();
        	hrNotFound = false;
            hr = hrmInfo.detail.heartRate;
            rToRTime = hrmInfo.detail.rInterval;
        	handleHRChanged();
        }

		function setMinMaxHeartRate() {
			//to be eventually based on age and user-defined goals. Just use values for 30yo aerobic exercise for now.
		}
                
        function handleHRChanged() 
        {
        	if(hrNotFound)
        	{
				showWarningLow = false;
				showWarningHigh = false;
				clearTimeOut(warningTimeoutHigh);
				warningTimeoutHigh = false;
				clearTimeout(warningTimeoutLow);
				warningTimeoutLow = false;
				zombiesCatchingUp = false;
				clearNotification();
				setNotification( '#fff', '#000', 'No Heart Rate', null, 0);
				clearInterval(heartBeatInterval);
        	}
        	else
        	{
        		//check if we've the zone for the first time
        		clearInterval(heartBeatInterval);
        		heartBeatInterval = null;
        		heartBeatInterval = setInterval(heartBeatBeatOn, 1000);
				if(hr > maxHeartRate && !hrNotFound)
				{
					hrColour = '#ff0000';
					if(!hasBeenInGoalHRZone)
					{
						hasBeenInGoalHRZone = true;
						//start run
						console.log('Reached target hr zone. Starting run');
						setTimeout(progressToGame, 1000);
					}
				}
				else if (hr > minHeartRate && !hrNotFound)
				{
					hrColour = '#fff';
					if(!hasBeenInGoalHRZone)
					{
						hasBeenInGoalHRZone = true;
						//start run
						console.log('Reached target hr zone. Starting run');
						setTimeout(progressToGame, 1000);
					}
				}
				else
				{
					hrColour = '#5555ff';
				}

				var r = race.getOngoingRace();
				if (!!r) {
					if (!!r.data.zone_time_start) {
						var dt = Date.now() - r.data.zone_time_start;
						r.data.time_in_zone = r.data.time_in_zone + dt;
					}
					if (hr > maxHeartRate || hr < minHeartRate) {
						r.data.zoned_out = true;
						r.data.zone_time_start = null;
					} else {
						r.data.zone_time_start = Date.now();
					}
				}
			}
        }
        
        function progressToGame()
        {
        	setNotification(green, '#fff', 'Race Starting', null, 2000);
			sectionChanger.setActiveSection(1, 1000);
			setTimeout(startCountdown, 1000);
        }

		function heartBeatBeatOn()
		{
//			setTimeout(heartBeatBeatOff, 250);
			heartBeatOn = true;
			e.fire('heart.beat');
		}
		
//		function heartBeatBeatOff()
//		{
//			heartBeatOn = false;
//		}
        
        function warningOver_low() 
        {
        	console.log("Warning up! Zombies catching up");
        	zombiesCatchingUp = true;
        }
        function warningOver_high()
        {
        	console.log("Warning up! now losing sweat points");
        }
        
        function step() {
            var r = race.getOngoingRace();
//            if (r.getDistance() < zombieDistance && !isDead) {
			if(zombieOffset >=0 && !isDead) {
                if(!isDead)
                {
                r.data.caught_by = game.getCurrentOpponentType();
                r.data.times_caught = r.data.times_caught || 0;
                r.data.times_caught++;
                r.addPoints(config.getPointsPenaltyDeath());
                

					if(settings.getAudioActive() && killSound != null) {
						killSound.play();
					}
					if(settings.getVibrateActive()) {
						console.log('vibrate: killed');
						navigator.vibrate([1000, 500, 250, 100]);
					}
//                r.stop();
//                e.fire('race.end', r);
//                lastRender = null;
//                stopZombies();
				isDead = true;
				spawnPointsGraphic(-100);
				started = false;
				ppm = 0;
				
                requestRender();
                clearTimeout(bannerTimeout);
                bannerTimeout = setTimeout(nextWave, 10000);
                e.fire('died', {cause: game.getCurrentOpponentType()});
				}
                return;
            }
            if (r.getDistance() >= TRACK_LENGTH || r.getDuration() >= targetTime) {
//                zombieMoan.play();
                r.addPoints(50);
                if(settings.getVibrateActive()) {
					console.log('vibrate: run complete');
                	navigator.vibrate(1000);
                }
                showUnlockNotification('finished', 5);
                finished = true;
                // Hide sectionchanger scrollbar. Optionally rewrite finish screen to be a html overlay with z-index > 1
                if (sectionChanger && sectionChanger.scrollbar && sectionChanger.scrollbar.element) {
                	sectionChanger.scrollbar.element.classList.toggle('hidden', true);
                }
                numAwardsAtFinish = 0;
                e.fire('race.end', r);
                r.stop();
                lastRender = null;
                stopZombies();
                
                return;
            }
            
            if (lastDistanceAwarded < r.getMetricDistance()) {
                var distance = r.getMetricDistance();
                var points = ((distance - lastDistanceAwarded)*ppm);
				r.addPoints(points);
				if(!(points == 0))
				{
					spawnPointsGraphic(points);
				}
                lastDistanceAwarded = distance;
            }
            
            //clear up old sweat point graphics
            var done = false;
			while(!done)
			{    
				if(sweatPointGraphics.length > 0 && sweatPointGraphics[0].getFinished())
				{
					//remove first element;
					sweatPointGraphics.shift();
				}
				else
				{ done = true; }
			}        
            
            /*
            if (runner.next !== null && r.getSpeed() >= runner.next.speedThreshold) {
                runner.sprite.onEnd(function(dt) {
                    runner.sprite.onEnd(null);
                    runner = runner.next;
                    runner.sprite.time = dt;
                });
            }
            if (r.getSpeed() < runner.speedThreshold && runner.previous !== null) {
                runner.sprite.onEnd(function(dt) {
                    runner.sprite.onEnd(null);
                    runner = runner.previous;
                    runner.sprite.time = dt;
                });
            }
            */
            
            if(!isDead)
            {
                //Update player anim
                if(r.getMetricSpeed() <= 1)
                {
                    runner.sprite.onEnd(function(dt) {
                        runner.sprite.onEnd(null);
                        if (showWarningHigh) runner = runnerAnimations.idle_red;
                        else runner = runnerAnimations.idle;
                        runner.sprite.time = dt;
                    });
                }
                else
                {
                    runner.sprite.onEnd(function(dt) {
                        runner.sprite.onEnd(null);
                        if (showWarningHigh) runner = runnerAnimations.running_red;
                        else runner = runnerAnimations.running;
                        runner.sprite.time = dt;
                    });
                }
            }
            
            requestRender();
        }

		function spawnPointsGraphic(rawPoints)
		{
			//points seems to come in with a small fractional part sometimes, so round it.
			var points = Math.round(rawPoints);
			if(points == 0) return;
			var colour = points > 0 ? green : red;
			var r = race.getOngoingRace();
//			var startPos = { x:distanceToTrackPos(r.getDistance()) + 20, y:canvas.height/2 +20};
//			var destPos = { x:canvas.width/2, y:20 };
			var startPos = { x:distanceToTrackPos(r.getDistance()) + 40, y:canvas.height - 55 - runner.sprite.height * scale};
			var destPos = { x:sweat.width/2, y:sweat.height };
			var pointsPenaltyGraphic = new SweatPoint(points, colour, startPos, destPos);
			sweatPointGraphics.push(pointsPenaltyGraphic);
		}
		function continueToResults()
		{
			clearbanner();
		    e.fire('racesummary.show');

		}

        function animate(time) {
            raf = requestAnimationFrame(animate);
            render();
        }
        
        function requestRender() {
            if (!raf) render();
        }
        
        function stringForTimeHHMMSS(milliseconds, showSeconds)
        {
			var numSeconds = Math.floor(milliseconds/1000);
			var numMinutes = Math.floor(numSeconds / 60);
			var numHours = Math.floor(numMinutes / 60);
			var timeString = '';
			
			var secondsString = '' + numSeconds%60;
			if (secondsString.length == 1) { secondsString = '0' + secondsString; }
			
			var minutesString = '' + numMinutes%60;
			if (minutesString.length ==1) { minutesString = '0' + minutesString; }
			
			if(true) { timeString = timeString + numHours + ':'; }
			timeString = timeString + minutesString + ':';
			timeString = timeString + secondsString;
			return timeString;
		}


        function render() {
            if (!visible) return;
            
        	var r = race.getOngoingRace();
        	var playerDistance = r.getMetricDistance();
        	var zOffset = zombieOffset;
        	var zDistance = playerDistance + zombieOffset;
        	
            //general update of track window
            if(!isDead)
            {
				screenWidthDistance = Math.max( 13, Math.min( -zOffset + 2, 50)) +1;
			}
			if(numZombies>0 && hasBeenInGoalHRZone)
			{
				if(zombiePosWeight < 1) { zombiePosWeight += 0.02; }
//				screenMidDistance = zombiePosWeight * zDistance + playerDistance;
				var screenLeftDistanceZ = (zDistance + playerDistance - screenWidthDistance)/2 - 4;
				var screenLeftDistanceNoZ = playerDistance - screenWidthDistance/2 - 2;
				//lerp
				var ease = Math.sin( Math.sin(zombiePosWeight*(Math.PI / 2)) );
				screenLeftDistance = (1-ease)*screenLeftDistanceNoZ + ease*screenLeftDistanceZ;
			}
			else
			{
//				screenMidDistance = playerDistance;
				screenLeftDistance = playerDistance - screenWidthDistance/2 - 2;
			}
            
//			screenLeftDistance = screenMidDistance = screenWidthDistance/2;
			
            var dt = 0;
            var trackHeight = canvas.height - bgHeight;
            var trackThickness = 4;

            if (lastRender !== null) {
                dt = Date.now() - lastRender;
                lastRender = Date.now();
            }
            
            //update animated sprites
            for(var i=0; i<animatedSprites.length; i++)
            {
            	animatedSprites[i].updateAnim();
			}
            
            //BG
            //draw good bg
            //draw bad bg with alpha
			if(showWarningLow || showWarningHigh)
			{
				//go more bad
				if(badFraction < 1)
				{
					badFraction += 1 * dt/1000;
					if(badFraction > 1) { badFraction = 1; }
				}
			}
			
			else
			{
				//go less bad
				if(badFraction > 0)
				{
					badFraction -= 1 * dt/1000;
					if(badFraction < 0) { badFraction = 0; }
				}
			}

			
            
            
            //update flashingRed
			flashingRedParams.phase += dt;
			flashingRedParams.phase = flashingRedParams.phase % flashingRedParams.period;
			if(flashingRedParams.phase > flashingRedParams.period/2)
			{ flashingRedParams.colour = red; }
			else
			{ flashingRedParams.colour = lightRed;}
            
            context.clearRect(0, 0, canvas.width, canvas.height);            
            var trackWidth = canvas.width - 0 - runner.sprite.width;

			var radius = 115/2;
			var hrXPos = canvas.width - radius - 10;
			var hrYPos = 37 + radius;
			var PaceXPosR = 2*radius;

			//draw good bg
/*			context.drawImage(goodBG, 0, 0, canvas.width, canvas.height - trackHeight);
			context.globalAlpha = badFraction;
			context.drawImage(badBG, 0, 0, canvas.width, canvas.height - trackHeight);
			context.globalAlpha = 1;
*/

			//base coat for pace readout and hr readout, so we can see the sweat points behind
			if(!countingdown)
			{
				context.globalAlpha = 1;
				drawPaceBG(hrYPos, radius, PaceXPosR);
				drawHRBG(hrXPos, hrYPos);
			}			

			//Header
			//sweat points
			if(true)
			{

				var xpos = 1;
				var ypos = 1;
				var img = ppm > 0 ? sweat : sweat_red;
				img.draw(context, xpos,ypos,0);
				context.font = '24px Samsung Sans';
				context.fillStyle = ppm > 0 ? '#fff' : red;
				context.textBaseline = "middle";
				context.textAlign = "left";
				context.fillText('SP', xpos + sweat.width + 8, ypos + sweat.height/2);
				context.fillStyle = ppm > 0 ? '#fff' : flashingRedParams.colour;
				context.fillText(~~settings.getPoints(), xpos + sweat.width + 8 + 36, ypos + sweat.height/2);

								
				//draw sweat point graphics
				for(var i=0; i<sweatPointGraphics.length; i++)
				{
					var sweatImg = sweatPointGraphics[i].amount > 0 ? sweat : sweat_red;
					sweatPointGraphics[i].render(context, sweatImg);
				}
			}
///////////////////////////


			//GPS
				var GPSscale = 0.65;
				context.save();
				context.translate(canvas.width - gpsRing.width/2 * GPSscale, gpsRing.height/2 * GPSscale);
				gpsRing.drawscaled(context, - gpsRing.width/2*GPSscale, -gpsRing.height/2 * GPSscale, 0, GPSscale);

				if(hasGPSUpdate) {
					gpsDot.drawscaled(context, - gpsDot.width/2*GPSscale, -gpsDot.height/2 * GPSscale + 0.5*GPSscale, 0, GPSscale);
				}
				context.restore();

            // Banner
            if (false) {
                context.font = '75px Samsung Sans';
                context.fillStyle = '#fff';
                context.textBaseline = "top";
                context.textAlign = "center";
                context.fillText(banner, canvas.width/2, 25);
            }
            
            if (banner === false && zDistance !== false) {
                var delta = playerDistance - zDistance;
                delta = ~~delta;
                var postfix = 'ahead';
                var prefix = '';
                if(delta > 0) 
                { prefix = '+'; }
                else if(delta < 0)
                { prefix = '-'; }
                
                // TODO: Relative speed: 'catching up', 'breaking away'
                
                var columnCenter = canvas.width/2;
                columnCenter = ~~(columnCenter/2);
                
                if (false) {
                    context.font = '45px Samsung Sans';
                    context.fillStyle = '#5f9a4a';
                    context.textBaseline = "top";
                    context.textAlign = "center";
                    context.fillText('+'+delta+'m', 0+columnCenter, 25);
                    context.font = '24px Samsung Sans';
                    //context.fillText(postfix, 0+columnCenter, 25+45);
                }
                if (false) {
                	var hrXPos = canvas.width/2 + 10;
                	var hrYPos = 25+25;
                    context.fillStyle = hrColour;
                    context.textBaseline = "middle";
                    context.textAlign = "left";
                    context.font = '45px Samsung Sans';
                    context.fillText(hr, hrXPos + heart.width*heart.scale, hrYPos);
                    heart.drawscaled(context, hrXPos, hrYPos - heart.height * heart.scale/2, dt, heart.scale);
                }
            }


            
			var progressBarHeight = canvas.height - (trackHeight - trackThickness)/2;
			var progressBarInset = 0;
			var notificationInset = 17;
			var notificationRadius = 16;
			var notificationHeight = canvas.height - 16;
			var whiteInset = 8;
			if(!notification.active)
			{

				//Progress bar
				var fillProportion = 0;
				if(TRACK_LENGTH < Infinity) 
				{
					fillProportion = r.getDistance()/TRACK_LENGTH;
				}

				else if(targetTime < Infinity)
				{
					fillProportion = r.getDuration()/targetTime;
				}
				else
				{
					//'just run' mode
					fillProportion = 0;
				}
				
				if(false)	//old capsule version
				{
				var progressBarRadius = 14;
				var progressBarInnerRadius = 8;
				progressBarHeight = canvas.height - progressBarRadius - 8;
				progressBarInset = progressBarRadius + 10;
			
				//white capsule
				context.beginPath();
				context.arc(progressBarInset, progressBarHeight, progressBarRadius, Math.PI/2, Math.PI*1.5, false);
				context.lineTo(canvas.width - progressBarInset, progressBarHeight - progressBarRadius)
				context.arc(canvas.width - progressBarInset, progressBarHeight, progressBarRadius, -Math.PI/2, Math.PI/2, false);
				context.closePath();
				context.fillStyle = '#fff';
				context.fill();
			
				//green fill
				context.beginPath();

					
				var fillDistance = (canvas.width - 2*progressBarInset + 2*progressBarRadius) * fillProportion;
				if(fillDistance <= progressBarInnerRadius)
				{
					//fill partial circle
	//				var fillSegmentProportion = (progressBarInnerRadius - fillDistance)/progressBarInnerRadius;
					//height in pixels in from edge
					var h = progressBarInnerRadius - fillDistance;
					var angle = Math.asin(h/progressBarInnerRadius);
					context.arc(progressBarInset, progressBarHeight, progressBarInnerRadius, angle + Math.PI/2, 1.5*Math.PI - angle, false);
				}
				else if(fillDistance >= (canvas.width - 2*progressBarInset) + progressBarInnerRadius )
				{
					//fill in semicircle, full box, and partial circle
					context.arc(progressBarInset, progressBarHeight, progressBarInnerRadius, Math.PI/2, 1.5*Math.PI, false);
					//across and down
					var straightEnd = canvas.width - progressBarInset;
					context.lineTo( straightEnd, progressBarHeight - progressBarInnerRadius );
					context.lineTo( straightEnd, progressBarHeight + progressBarInnerRadius );
					context.closePath();
					context.fillStyle = green;
					context.fill();
				
					//partial segment top
					context.beginPath();
					var h = fillDistance - (canvas.width - 2*progressBarInset) - progressBarInnerRadius;
					var angle = Math.asin(h/progressBarInnerRadius);
				
					context.moveTo(canvas.width - progressBarInset + h, progressBarHeight - progressBarInnerRadius * Math.cos(angle));
					context.arc(canvas.width - progressBarInset, progressBarHeight, progressBarInnerRadius, Math.PI/2 - angle, Math.PI/2, false);
					context.lineTo(canvas.width - progressBarInset, progressBarHeight - progressBarInnerRadius);
					context.arc(canvas.width - progressBarInset, progressBarHeight, progressBarInnerRadius, 1.5*Math.PI, 1.5*Math.PI + angle, false);
					context.closePath();
				}
				else
				{
					//fill in semicircle and box
					context.arc(progressBarInset, progressBarHeight, progressBarInnerRadius, Math.PI/2, 1.5*Math.PI, false);
					//across and down
					var straightEnd = progressBarInset - progressBarInnerRadius + fillDistance;
					context.lineTo( straightEnd, progressBarHeight - progressBarInnerRadius );
					context.lineTo( straightEnd, progressBarHeight + progressBarInnerRadius );
					context.closePath();

				}
				context.fillStyle = green;
				context.fill();
				}
				if(true)	//new box version
				{
					context.fillStyle = '#000';
					context.fillRect( 0, canvas.height - trackHeight + trackThickness/2, canvas.width, canvas.height);
					context.fillStyle = '#fff';
//					context.fillRect( whiteInset, canvas.height - trackHeight + trackThickness/2 + whiteInset, canvas.width - 2 * whiteInset, trackHeight - trackThickness - 2 * whiteInset);
					drawRoundedCornerBoxPath( whiteInset, canvas.height - trackHeight + trackThickness/2 + whiteInset, canvas.width - 2*whiteInset, trackHeight - trackThickness - 2*whiteInset, 8);					
					context.fill();
					var greenInset = 6 + whiteInset;
					context.fillStyle = green;
					var fillDist = fillProportion * (canvas.width - 2*greenInset);
					context.fillRect( greenInset, canvas.height - trackHeight + trackThickness/2 + greenInset, fillDist, trackHeight - trackThickness - 2*greenInset);
//					drawRoundedCornerBoxPath					
					progressBarInset = greenInset + 5;
				}
			}
			
			//notification
			if(notification.active)
			{
				if(false)
				{
					//draw capsule
					context.beginPath();
					context.arc( notificationInset, notificationHeight, notificationRadius, 0.5*Math.PI, 1.5*Math.PI, false);
					context.lineTo( canvas.width - notificationInset, notificationHeight - notificationRadius);
					context.arc( canvas.width - notificationInset, notificationHeight, notificationRadius, 1.5*Math.PI, 2.5*Math.PI, false);
					context.closePath();
					context.fillStyle = notification.colour;
					if(notification.colour == 'flashingRed')
						{ context.fillStyle = flashingRedParams.colour; }
					context.fill();
				}
				if(true)
				{
					//draw box
					context.fillStyle = '#000';
					context.fillRect( 0, canvas.height - trackHeight + trackThickness/2, canvas.width, canvas.height);
					context.fillStyle = notification.colour;
					if(notification.colour == 'flashingRed')
						{ context.fillStyle = flashingRedParams.colour; }
//					context.fillRect( whiteInset, canvas.height - trackHeight + trackThickness/2 + whiteInset, canvas.width - 2 * whiteInset, trackHeight - trackThickness - 2 * whiteInset);
					drawRoundedCornerBoxPath( whiteInset, canvas.height - trackHeight + trackThickness/2 + whiteInset, canvas.width - 2 * whiteInset, trackHeight - trackThickness - 2 * whiteInset, 8);
					context.fill();

				}
				//text
				context.font = '24px Samsung Sans';
				context.fillStyle = notification.textColour;
				context.textAlign = 'center';
				context.textBaseline = 'middle';
				var text = notification.text;
				
				//if there are 2 strings, rotate between them
				if(notification.text2 != null && (hrWarningPhase/hrWarningPeriod > 0.5))
				{
					text = notification.text2;
				}
				context.fillText( text, canvas.width/2, progressBarHeight);
			}
			
			// Track
			
			//black line above track
			context.fillStyle = '#000';
			context.fillRect(0, bgHeight - 7, canvas.width, 10);
			
            context.beginPath();
            context.moveTo(0, canvas.height - trackHeight);
            context.lineTo(canvas.width, canvas.height - trackHeight);
            context.lineWidth = trackThickness;
            context.strokeStyle = "#fff";
            context.stroke();
            
            // Track text
            context.font = '24px Samsung Sans';
            context.fillStyle = '#fff';
            context.textBaseline = "top";
//            context.textAlign = "left";
//            context.fillText(''+ Math.floor(screenLeftDistance), 10, canvas.height-25);
//            context.textAlign = "right";
//            context.fillText(''+ Math.floor(screenWidthDistance + screenLeftDistance), canvas.width - 10, canvas.height-25);
  			context.textAlign = "center";          
			
			//draw distance markers for screen range
			context.beginPath();
			var distMarkerSpacing = 2.5;
			var distMarkerIndex = Math.floor(screenLeftDistance/distMarkerSpacing);
			distMarkerIndex = Math.max(distMarkerIndex, 0);
			while (distMarkerIndex * distMarkerSpacing <= (screenLeftDistance + 2*screenWidthDistance) )
			{
				var dist = distMarkerIndex * distMarkerSpacing
				var screenPosX = distanceToTrackPos(dist);
//				if(dist%500 == 0)
				if(false)
				{
					// TODO: Make unit agnostic if enabled
					context.textBaseline = "bottom";
					context.textAlign = "right";
					context.font = '24px Samsung Sans';
					var distkm = dist/1000;
					context.fillText(distkm, distanceToTrackPos(dist), canvas.height-trackHeight + 28);
					context.textAlign = "left";
					context.font = "24px Samsung Sans";
					context.fillText('km', distanceToTrackPos(dist) + 1, canvas.height-trackHeight + 28);
				}
				else
				{
					var distMarkerHeight = 6;
//					if(dist%100 == 0) { distMarkerHeight = 20; }
//					context.fillText('' + dist, distanceToTrackPos(dist), canvas.height-25);
					context.moveTo(screenPosX, canvas.height - trackHeight +1);
					context.lineTo(screenPosX, canvas.height - (trackHeight -3 - distMarkerHeight*scale));
				}
				distMarkerIndex++;
			}
			context.lineWidth = trackThickness*0.5;
			context.strokeStyle = "#fff";
			context.stroke();
			
			//text labels
			///run
			context.font = '24px Samsung Sans';
			context.fillStyle = '#000';
			context.textAlign = 'left';
			context.textBaseline = 'middle';

			if(!notification.active)
			{
			context.fillStyle = '#000';
			if(TRACK_LENGTH < Infinity)
			{

				//run
				var d = r.getDistance();
				var targetdist = TRACK_LENGTH;
				var u = r.getShortDistanceUnits();
				if (u == 'm') {
					d = d / 1000;
					targetdist = targetdist / 1000;
					u = 'km';
				}
				
				context.fillText(Number(d).toFixed(1) + u, progressBarInset, progressBarHeight);
				//target
				context.textAlign = 'right';
				context.fillText(Number(targetdist).toFixed(1) + u, canvas.width - progressBarInset, progressBarHeight);

			}
			else if(targetTime < Infinity)
			{
				//time run
				var timeString = stringForTimeHHMMSS(r.getDuration());
				context.textAlign = 'left';
				context.fillText(timeString, progressBarInset, progressBarHeight);
				//target
				context.textAlign = 'right';
				var targetTimeString = stringForTimeHHMMSS(targetTime);
				context.fillText(targetTimeString, canvas.width - progressBarInset, progressBarHeight);
			}
			else
			{
				//show time run on left
				var timeString = stringForTimeHHMMSS(r.getDuration());
				context.textAlign = 'left';
				context.fillText(timeString, progressBarInset, progressBarHeight);
				
				//show distance run on right
				context.textAlign = 'right';
				var d = r.getDistance();
				var u = r.getShortDistanceUnits();
				if (u == 'm') {
					d = d / 1000;
					u = 'km';
				}
				context.fillText(Number(d).toFixed(1) + u, canvas.width - progressBarInset, progressBarHeight);
			}
			}

			
            scale = 10/screenWidthDistance;
            
            var playerXPos = 0 + distanceToTrackPos(playerDistance)
            
            var opponentType = game.getCurrentOpponentType()
            opponentType = 'meteor';
            switch(opponentType)
            {
	            case 'zombie':
					// Zombies
					if (zDistance !== false && hasBeenInGoalHRZone) {
						for (var i=0;i<numZombies;i++) {
							var zombie = zombies[i];
							var x_offset = ((i*(zombie.width*0.3))+(i%2)*5 + zombie.width*0.3) * scale;
							var y_offset = 7*scale;
//							if (i%2==1) context.globalAlpha = 0.75;
//							else context.globalAlpha = 1;
							context.globalAlpha = 1;
							var zombiePos = 0 + distanceToTrackPos(zDistance) - x_offset;
		//                    zombiePos -= screenLeftDistance;
							if(!isDead || zombiePos < playerXPos - 10)
							{	
								// if we're dead don't draw them as they join the bundle
								var pace = r.getMetricSpeed();
								if(pace > 1 || zombiesCatchingUp)
								{
									zombie.drawscaled(context, zombiePos, canvas.height - zombie.height * scale - trackHeight + y_offset, dt, scale);
								}
								else
								{
									//update zombie animation timer
									zombie.time += dt;
									//apply non-idle time to idle anim
									zombieIdle.time = zombie.time;
									zombieIdle.drawscaled(context, zombiePos, canvas.height - zombie.height * scale - trackHeight + y_offset, dt, scale);
								}
							} else {
							    // Just update the animation time
							    zombie.time += dt;
							}
						}
						context.globalAlpha = 1;
					}
					break;
				case 'dinosaur':
					if(zDistance != false && currentHRZone!='Recovery' && !isDead && hasBeenInGoalHRZone) {
						var dinoPos = 0 + distanceToTrackPos(zDistance);
						var dinoScale = scale * 1;
						var dinoSprite;
						var pace = r.getMetricSpeed();
						if(pace > 1 || zombiesCatchingUp)
						{
							if(zombieOffset > -5)
							{ dinoSprite = dinoBiting; }
							else
							{ dinoSprite = dino; }
						}
						else
						{
							dinoSprite = dinoIdle;
						}
						dinoSprite.drawscaled(context, dinoPos - dino.width * 0.6 * dinoScale, canvas.height - (dino.height - 32) * dinoScale - trackHeight - 5* scale, dt, dinoScale);
					}
					break;
				case 'boulder':
					if(zDistance != false) 
					{
						var boulderPos = 0 + distanceToTrackPos(zDistance);
						context.save();
						boulder.rotation += dt*boulder.rotationSpeed;
						context.translate(boulderPos, canvas.height - boulder.height * scale - trackHeight - 5*scale);
						context.rotate(boulder.rotation);
						boulder.drawscaled(context, 0,0, dt, scale);
						context.restore();
					}
					break;
				case 'meteor':
					if(zDistance != false && currentHRZone!='Recovery' && !isDead && hasBeenInGoalHRZone) {
						var meteorPos = distanceToTrackPos(zDistance);
						var meteorScale = scale *1;
//						meteor.drawscaled(context, meteorPos - meteor.width*0.5*meteorScale, canvas.height - (meteor.Height) * meteorScale, dt, meteorScale);
						meteor.drawscaled(context, meteorPos - meteor.width * 0.3, canvas.height - trackHeight - (meteor.height + 3)*meteorScale, dt, meteorScale);
					}
					break;
				default:
					console.error('unhandled opponent type: ' + game.getCurrentOpponentType());
					break;
            }
            

        	
			if(!countingdown)
            {
				// Heart Rate
				var heartIcon = null;
				var hrFillColour = green;
				var hrWarningText = false;
				hrWarningPhase += dt;
				hrWarningPhase = hrWarningPhase % hrWarningPeriod;
								
				if(hrNotFound)
				{
					heartIcon = heartBlack;
					hrFillColour = '#555';
				}
				else if(hr > maxHeartRate)
				{
					heartIcon = heartBlack; 
					hrFillColour = flashingRedParams.colour;             	
					hrWarningText = 'slow down';
				}
				else if(hr > maxHeartRate - 3)
				{
					//close to high warning
					heartIcon = heartBlack;
					hrFillColour = amber;
					hrWarningText = 'slow down';
				}
				else if(hr < minHeartRate) 
				{
					heartIcon = heartRed; 
					hrFillColour = flashingRedParams.colour;
					hrWarningText = 'speed up';
				}
				else if(hr < minHeartRate + 3)
				{
					heartIcon = heartRed;
					hrFillColour = amber;
					hrWarningText = 'speed up';
				}
				else { heartIcon = heartGreen; }
			

				//fill
				var MaxCircleHR = 200;
				var MinCircleHR = 50;
				context.beginPath();
				context.arc(hrXPos, hrYPos, radius, 0, 2*Math.PI, false);
				context.fillStyle = '#fff';
				context.fill();
				context.strokeStyle = hrFillColour;
				context.lineWidth = 5;
				context.stroke();
				if(false)
				{			
				//how high up the circle as a percentage of diameter 
				var fillProportion = (hr - MinCircleHR)/(MaxCircleHR - MinCircleHR);
				if(hrNotFound) { fillProportion = 1; }
				//height in pixels above centre line
				var h = fillProportion * 2 * radius - radius
				var angle = Math.asin(h/radius);
				context.beginPath();
				context.arc(hrXPos, hrYPos, radius, -angle, Math.PI + angle, false);
				context.fillStyle = hrFillColour;
				context.fill();
				}
				//water marks
				if(false)
				{
				context.globalAlpha = 0.5;
				context.strokeStyle = dottedPattern;
				var heightProportion = (maxHeartRate - MinCircleHR)/(MaxCircleHR - MinCircleHR);
				var height = heightProportion * 2 * radius - radius;
				var a = Math.asin(height/radius);
				//do an arc to get the pen in the right place
				context.beginPath();
				context.moveTo(hrXPos - radius * Math.cos(a), hrYPos - height);
				context.lineTo(hrXPos + radius * Math.cos(a), hrYPos - height);
				context.lineWidth = 2;
				context.stroke();
				//lower range
				heightProportion = (minHeartRate - MinCircleHR)/(MaxCircleHR - MinCircleHR);
				height = heightProportion * 2 * radius - radius;
				a = Math.asin(height/radius);
				context.beginPath();
				context.moveTo(hrXPos - radius * Math.cos(a), hrYPos - height);
				context.lineTo(hrXPos + radius * Math.cos(a), hrYPos - height);
				context.stroke();
				context.globalAlpha = 1;
				}
				if(hrWarningText != false && (hrWarningPhase/hrWarningPeriod > 0.5))
				{
					//warning text
					context.font = '24px Samsung Sans';
					context.textAlign = 'center';
					context.textBaseline = 'middle';
					context.fillStyle = hrFillColour;
					if(hrWarningText == 'slow down')
					{
						context.fillText('SLOW', hrXPos, hrYPos - 13);
						context.fillText('DOWN', hrXPos, hrYPos + 13);
					}
					else if(hrWarningText == 'speed up')
					{
						context.fillText('SPEED', hrXPos, hrYPos - 10);
						context.fillText('UP', hrXPos, hrYPos + 16);
					}
					else
					{
						console.error('unexpected hrWarning message: ' + hrWarningText);
					}
					
				}
				else
				{
					//show heart rate
					//icon
					var heartScale = 1.0;
					if(heartBeatOn)
					{
						heartScale = 1.2;
						heartBeatOnFrameCount++;
						if(heartBeatOnFrameCount > 3) 
						{ 
							heartBeatOn = false; 
							heartBeatOnFrameCount = 0;	
						}
					}
						
					
					heartIcon.drawscaled(context, hrXPos-heartScale*heartIcon.width/2, hrYPos-heartScale*heartIcon.height/2 - 32, 0, heartScale);
					//number
					context.font = '56px Samsung Sans';
					context.textAlign = 'center';
					context.textBaseline = "middle";
					context.fillStyle = '#000';
					var hrText = hr;
					if(hrNotFound) { hrText = '--'; }
					context.fillText(hrText, hrXPos, hrYPos + 8);
					//bpm
					context.font = '24px Samsung Sans';
					context.fillText('bpm', hrXPos, hrYPos + 38);
				}
				//Pace
				context.globalAlpha = 0.7;
				drawPaceBG(hrYPos, radius, PaceXPosR);
				context.globalAlpha = 1;
				
				//text
                var pace = r.getPace();
                var paceString = mss(pace*60);
                var paceUnits = r.getPaceUnits();
	            if(settings.getPaceUnits() == 'km/h') {
	                pace = r.getSpeed();
	                paceString = Number(pace).toFixed(1);
	                paceUnits = r.getSpeedUnits();
	            }
				var paceXPos = PaceXPosR - radius/2;
				context.font = '56px Samsung Sans';
				context.textAlign = 'center';
				context.textBaseline = 'middle';
				context.fillStyle = '#000';
				context.fillText(paceString, paceXPos, hrYPos + 4);
				//units
				context.font = '24px Samsung Sans';
				context.fillText(paceUnits, paceXPos, hrYPos + 38);
				//icon
				paceIcon.draw(context, paceXPos - paceIcon.width/2, hrYPos - paceIcon.height/2 - 38, 0);
								
			
			
				//Ahead/Behind
				if(false)
				{
					var distXPos = radius;
					var distYPos = 37 + radius;
					if(!isDead)
					{
						context.beginPath();
						context.arc(distXPos, distYPos, radius, 0, 360, false);
						context.fillStyle = green;
						context.fill();
						//+
						context.fillStyle = '#fff';
						context.font ='24px Samsung Sans';
						context.fillText('+', distXPos, distYPos - 33);
						//m
						context.font = '24px Samsung Sans';
						context.fillText('m', distXPos, distYPos + 38);
						//number
						var delta = Math.round(playerDistance - zDistance);
						context.font = '56px Samsung Sans';
						context.fillText(delta, distXPos, distYPos +4);
					}
					else
					{
						//dead
						context.beginPath();
						context.arc(distXPos, distYPos, radius, 0, 360, false);
						context.fillStyle = red;
						context.fill();
						//image
						deadImage.draw(context, distXPos - deadImage.width/2, distYPos - deadImage.height/2, 0);
					}
				}
            }
            
            /// DEBUG
            // fps
            if(false)
            {
            context.font = '20px Samsung Sans';
            context.fillStyle = '#fff';
            context.textBaseline = "top";
            context.textAlign = "center";
            context.fillText('fps: '+fps, canvas.width/2, 0);
            }
            /// DEBUG
            
        	// Self
            //temp hack - make player bigger in death 'cloud' form
            var playerScale = scale;
            var playerOffset = runner.sprite.height * playerScale + trackHeight - 6*scale; 
            if(isDead)
            {	
                if (game.getCurrentOpponentType() == 'dinosaur') 
                {
                	runner = runnerAnimations.dinoDead;
//                	playerOffset = 0;
                	playerScale = canvas.width / runner.sprite.width;
                	playerOffset += 20;
                	playerXPos = canvas.width/2 - runner.sprite.width/2 * playerScale;

				}
                else
                {
                	runner = runnerAnimations.zombieDead;
					playerScale *=1.6;	
					playerOffset += 30*playerScale; 
				}
            }
            runner.sprite.drawscaled(context, playerXPos, canvas.height -playerOffset , dt, playerScale);
            
            				
			//draw sweat point graphics
//			for(var i=0; i<sweatPointGraphics.length; i++)
//			{
//				sweatPointGraphics[i].render(context);
//			}
            
            //countdown        
            if(countingdown && banner!=false)
            {
            	//shrink outer ring
            	var delta = Date.now() - countDownParams.startTime;
            	var p = 1 - delta / (countDownParams.stageDuration * 1000);
            	var p = p*p*p;
            	countDownParams.outerRadius = countDownParams.outerRadiusMax -  p * (countDownParams.outerRadiusMax - (countDownParams.radius - 20)) ;
            	countDownParams.outerRadius = Math.max(0, countDownParams.outerRadius);
            	var centreX = canvas.width/2;
            	var centreY = canvas.height/2;
//            	var countdownRadius = 100;
            	
            	context.lineWidth = 4;
            	
            	//fill screen white
            	context.globalAlpha = 0.5;
            	context.fillStyle = '#fff';
            	context.fillRect(0,0,canvas.width, canvas.height);
            	context.globalAlpha = 1;
            	            	
            	//outer ring
            	context.beginPath();
            	context.arc(centreX, centreY, countDownParams.outerRadius, 0, 2*Math.PI, false);
            	context.stroke(); 
            	
				//black circle
            	context.beginPath();
            	context.arc(centreX, centreY, countDownParams.radius, 0, 2* Math.PI, false);
            	context.fillStyle = '#000';
            	context.fill();
//            	context.beginPath();
//            	context.arc(centreX, centreY, rad, 0, 2* Math.PI, false);
            	context.strokeStyle = '#fff';
            	context.stroke();

            	//text
            	context.font = '56px Samsung Sans';
            	context.textAlign = "center";
            	context.textBaseline = "middle";
            	context.fillStyle = '#fff';
            	if(banner == 'GO') {context.fillStyle = green;}
            	context.fillText(banner, centreX, centreY);
            }
            
            //Unlock Notification
            if(unlockNotification != null)
            {
            	var centreX = canvas.width/2;
            	var centreY = canvas.height/2;
            	var unlockRadius = 110
            	//black bg
            	context.globalAlpha = 0.9;
            	context.fillStyle = '#000';
            	context.fillRect(0,0,canvas.width, canvas.height);
            	context.globalAlpha = 1;
            	
            	//image
            	var unlockSprite = null;
            	switch(unlockNotification)
            	{
            		case 'dino':
            			dinoGameImage.draw(context, 0, 0, 0);
            			break;
//            		case 'eliminator':
//            			elimGameImage.draw(context, 0, 0, 0);
//            			break;
//					case 'boulder':
//						boulderGameImage.draw(context, 0, 0, 0);
//						break;
            		case 'WeightLoss':
						weightLossGameImage.draw(context, 0, 0, dt);
						break;
					case 'Strength':
						strengthGameImage.draw(context, 0, 0, dt);
						break;
					case 'meteor':
						meteorGameImage.draw(context, 0, 0, dt);
						break;
					case 'finished':
						finishedImage.draw(context, centreX - finishedImage.height/2, centreY - finishedImage.height/2, 0);
						//also draw text for finished
						context.font = '25px Samsung Sans';
						context.textAlign = 'center';
						context.textBaseline = 'middle';
						context.fillStyle = '#fff';
						context.fillText('Training Complete', centreX, 40);
						var margin = 5;
						context.textBaseline = 'bottom';
						if(numAwardsAtFinish == 1)
						{
							context.fillText('1 Award Unlocked', centreX, canvas.height - margin - margin*3 - awardImage.height);
						}
						else if(numAwardsAtFinish >1)
						{
							context.fillText(numAwardsAtFinish + ' Awards Unlocked', centreX, canvas.height - margin - margin*3 - awardImage.height);
						}
						if (numAwardsAtFinish > 0) {
							var width = (awardImage.width+margin)*numAwardsAtFinish - margin;
							var left = centreX - width/2;
							for (var i=0; i < numAwardsAtFinish; i++) {
								awardImage.draw(context, left + (awardImage.width+margin)*i, canvas.height - margin*3 - awardImage.height, 0);
							}
						}
						
						break;
					default:
						console.log('unknown game being unlocked ' + unlockNotification);
            	}
            	
            }
            
            
            context.save();
            frames++;
        }
        
        function drawPaceBG(ypos, radius, posR) 
        {
			context.beginPath();
			context.arc(posR, ypos, radius, Math.PI * 1.5, Math.PI * 2.5, false);
			context.lineTo(posR - 2*radius, ypos + radius);
			context.arc(posR-2*radius, ypos, radius, Math.PI/2, Math.PI*1.5, false);
			context.closePath();
			context.fillStyle = '#fff';
			context.fill();

        }
        
        function drawHRBG()
        {
        
        }
        
        //creates a new path which forms the shape of a box with rounded corners. Caller is responsible for then filling or stroking
        function drawRoundedCornerBoxPath(minx, miny, width, height, radius)
        {
        	context.beginPath();
        	context.arc(minx + radius, miny + radius, radius, Math.PI, Math.PI * 1.5, false);
        	context.lineTo(minx + width - radius, miny);
        	context.arc(minx + width - radius, miny + radius, radius, 1.5 * Math.PI, 2 * Math.PI, false);
        	context.lineTo(minx + width, miny + height - radius);
        	context.arc(minx + width - radius, miny + height - radius, radius, 0, 0.5 * Math.PI, false);
        	context.lineTo(minx + radius, miny + height);
        	context.arc(minx + radius, miny + height - radius, radius, 0.5 * Math.PI, Math.PI, false);
        	context.closePath();
        }
        
        function mss(seconds) {
            if (!isFinite(seconds)) return '--:--';
            
            var mins = ~~(seconds/60);
            var secs = ~~(seconds - mins*60);
            
            if (mins > 99) return '--:--';
            
            if (secs < 10) secs = '0' + secs;
            
            return mins + ':' + secs;
        }
       
        function distanceToTrackPos(distance)
        {        	
        	var trackWidth = canvas.width - 0 -  runner.sprite.width;
        	var pos = trackWidth * (distance - screenLeftDistance) / (screenWidthDistance);
        	return pos;
        }



        function gpsSymbolOn(){
             hasGPSUpdate = true;

        }
        function gpsSymbolOff(){
             hasGPSUpdate = false;
            
        }

        
        function attachGame() {
        	console.log('Attaching hrzgame');
            page.addEventListener('pageshow', onPageShow);
            page.addEventListener('pagehide', onPageHide);
            document.getElementById('game-yesquit-btn').addEventListener('click', onQuit);
            document.getElementById('game-noquit-btn').addEventListener('click', onBack);
        }
        function detachGame() {
        	console.log('Detaching hrzgame');
            page.removeEventListener('pageshow', onPageShow);
            page.removeEventListener('pagehide', onPageHide);
            document.getElementById('game-yesquit-btn').removeEventListener('click', onQuit);
            document.getElementById('game-noquit-btn').removeEventListener('click', onBack);
        }
                
        function onGpsStatus(event) {
            var status = event.detail;
            gpsAvailable = (status == 'ready');
        }
        
        function bindEvents() {
        }

        function init() {
            page = document.getElementById('race-game');
            changer = document.getElementById("race-game-sectionchanger");
            canvas = document.getElementById('race-canvas');
            context = canvas.getContext('2d');
            
            if(!config.getIsDemoMode())
            {
				if (hrm.isAvailable()) {
					hrm.start();
					// Availability will change if start fails
				} 
				if (!hrm.isAvailable()) {
	            	hrmMock.start();
				}
            }                       
            
            bindEvents();
        }
        
        function loadAssets() {
            // Set up animation transitions
            runnerAnimations.idle.previous = null;
            runnerAnimations.idle.next = runnerAnimations.running;
            runnerAnimations.running.previous = runnerAnimations.idle;
            runnerAnimations.running.next = runnerAnimations.sprinting;
            runnerAnimations.sprinting.previous = runnerAnimations.running;
            runnerAnimations.sprinting.next = null;
            
            loadImage('images/animation_runner_green_still.png', function() {
                runnerAnimations.idle.sprite = new Sprite(this, this.width, 1000);
                runner = runnerAnimations.running;
            });

            loadImage('images/animation_runner_green.png', function() {
                runnerAnimations.running.sprite = new Sprite(this, this.width / 6, 500);
                runnerAnimations.sprinting.sprite = new Sprite(this, this.width / 6, 500);
            });

            loadImage('images/animation_runner_red.png', function() {
                runnerAnimations.running_red.sprite = new Sprite(this, this.width / 6, 500);
                runnerAnimations.sprinting_red.sprite = new Sprite(this, this.width / 6, 500);
            });

            loadImage('images/animation_runner_red_stationary.png', function() {
                runnerAnimations.idle_red.sprite = new Sprite(this, this.width, 500);
            });
            
            loadImage('images/animation_cloud.png', function() {
                runnerAnimations.zombieDead.sprite = new Sprite(this, this.width / 2, 1000);
            });

            loadImage('images/animation_dino_eating.png', function() {
                runnerAnimations.dinoDead.sprite = new Sprite(this, this.width / 11, 1375);
            });

            loadImage('images/animation_zombie1.png', function() {
                zombies.push(new Sprite(this, this.width / 6, 1000));
            });

			//zombie idle
            loadImage('images/animation_zombie_stationary.png', function() {
                zombieIdle = new Sprite(this, this.width/14, 2000);
            });
            
            
            zombieMoan = new Audio('audio/zombie_moan.wav');
            zombieMoan.onerror = function() {
                throw "Could not load " + this.src;
            }
            zombieGrowl = new Audio('audio/zombie_growl.wav');
            zombieGrowl.onerror = function() {
                throw "Could not load " + this.src;
            }
            dinoRoar = new Audio('audio/T Rex Roar.wav');
            dinoRoar.onerror = function() {
            	throw "Could not load " + this.src;
            }           
            
			dinoRoar = new Audio('audio/T Rex Roar.wav');
            dinoRoar.onerror = function() {
                throw "Could not load " + this.src;
            }
            dinoKill = dinoRoar;
            
            //chime
            chime = new Audio('audio/Chime.wav');
            chime.onerror = function() { throw "Could not load " + this.src; }
            
            
            //heart     
            loadImage('images/image_heart_green.png', function() {
        		heartGreen = new Sprite(this, this.width, 1000);
        		heartGreen.scale = 0.5;
        	});

            loadImage('images/image_heart_red.png', function() {
        		heartRed = new Sprite(this, this.width, 1000);
        		heartRed.scale = 0.5;
        	});
            
            loadImage('images/image_heart_black.png', function() {
        		heartBlack = new Sprite(this, this.width, 1000);
        		heartBlack.scale = 0.5;
        	});
            
                        
            //gps
			loadImage('images/image_gps target.png', function() {
            	gpsRing = new Sprite(this, this.width, 10);
			});

			loadImage('images/image_gps green circle.png', function() {
            	gpsDot = new Sprite(this, this.width, 10);
			});

			//sweat points
			loadImage('images/image_sweat_point_green.png', function() {
				sweat = new Sprite(this, this.width, 1000);
				animatedSprites.push(sweat);
			});

			loadImage('images/image_sweat_point_red.png', function() {
				sweat_red = new Sprite(this, this.width, 1000);
				animatedSprites.push(sweat_red);
			});
			            
            //dead image
			loadImage('images/image_skull.png', function() {
				deadImage = new Sprite(this, this.width, 1000);
			});
                        
 			//dead player image
			loadImage('images/image_skull.png', function() {
				deadRunnerImage = new Sprite(this, this.width, 1000);
			});
			      
			//dino image
			loadImage('images/animation_dino_small_running.png', function() {
				dino = new Sprite(this, this.width/5, 500);
			});
			loadImage('images/animation_dino_small_biting.png', function() {
				dinoBiting = new Sprite(this, this.width/5, 500);
			});
			loadImage('images/animation_dino_small_stationary.png', function() {
				dinoIdle = new Sprite(this, this.width/5, 500);
			});
			
			//meteor image
			loadImage('images/animation_meteor_big_in_game.png', function() {
				meteor = new Sprite(this, this.width/5, 500);
			});
			
			//boulder image
			loadImage('images/image_boulder_achievement_screen.png', function() {
				boulder = new Sprite(this, this.width, 1000);
				boulder.rotation = 0;
				boulder.rotationSpeed = 0.2;
			});
			
			//dino game image
			loadImage('images/race_dino_unlocked_ingame.png', function() {
				dinoGameImage = new Sprite(this, this.width, 1000);
			});			
			
//			loadImage('images/Game_Eliminator/screen_menu_game_eliminator_unlocked.png', function() {
//				elimGameImage = new Sprite(this, this.width, 1000);
//			});
			
			// Weight loss game image
			loadImage('images/animation_RY_Slimmer_unlocked_all_together.png', function() {
				weightLossGameImage = new Sprite(this, this.width / 12, 2000, {loop: true, loopstart: 9});
			});
			
			// Strength game image
			loadImage('images/animation_RY_Faster_unlocked_all_together.png', function() {
				strengthGameImage = new Sprite(this, this.width / 12, 2000, {loop: true, loopstart: 9});
			});
			
			loadImage('images/animation_meteor_unlocked_all_together.png', function() {
				meteorGameImage = new Sprite(this, this.width/12, 2000, {loop: true, loopstart: 9});
			});
			//boulder game image
//			loadImage('images/image_boulder_achievement_screen.png', function() {
//				boulderGameImage = new Sprite(this, this.width, 1000);
//			});
			
			//finished image
			loadImage('images/image_ending flag with effect.png', function() {
				finishedImage = new Sprite(this, this.width, 1000);
			});
			
			loadImage('images/awarded.png', function() {
				awardImage = new Sprite(this, this.width, 1000);
			});
			
			//dashed pattern
			loadImage('images/dashedLine.png', function() {
				dottedPattern = context.createPattern(this, "repeat");
			});
			
			loadImage('images/icon-speed_whiteBG.png', function() {
				paceIcon = new Sprite(this, this.width, 1000);
			});
						
//			loadImage('images/bg_good.jpg', function() {
//				goodBG = this;
//			});
			
//			loadImage('images/bg_bad.jpg', function() {
//				badBG = this;
//			});
			
        	loading = true;
        }
        
        function loadImage(url, onload) {
        	pendingAssets++;
        	var image = new Image();
        	image.onerror = function() {
        		throw 'could not load' + this.src;      	
        	}
        	image.onload = function() {
        		pendingAssets--;
        		onload.call(this);
        		if (loading && pendingAssets == 0) {
        			onAssetsLoaded();
        		}
        	};
        	image.src = url;
        }
        
        function onAssetsLoaded() {
        	console.log('Assets loaded');
        	loading = false;
        	loaded = true;
        	if (waiting) {
        		onPageShow();
        		waiting = false;
        	}
        }
        
        function onPreload() {
        	loadAssets();
        }

        e.listeners({
            'hrzgame.show': show,
            'hrzgame.attach': attachGame,
            'hrzgame.detach': detachGame,
            'hrzgame.preload': onPreload,
            'gps.status': onGpsStatus,
            'gpsUpdateOn': gpsSymbolOn,
            'gpsUpdateOff': gpsSymbolOff
        });

        return {
            init: init
        };
    }

});
