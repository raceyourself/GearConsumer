/*global define, $, console, window, history, document*/

/**
 * Main page module
 */

define({
    name: 'views/page/racegame',
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
    ],
    def: function viewsRaceGame(req) {
        'use strict';

        var e = req.core.event,
            race = req.models.race,
            hrm = req.models.hrm,
            hrmMock = req.models.mocks.hrm,
            game = req.models.game,
            settings = req.models.settings,
            config = req.models.config,
            Sprite = req.models.sprite.Sprite,
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
                    zombieDead: { name: 'zombieDead', sprite: null, speedThreshold: -1}
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
            boulder = null,
            dinoGameImage = null,
//            boulderGameImage = null,
            weightLossGameImage = null,
            strengthGameImage = null,
            dinoUnlockImageFS = null,
            finishedImage = null,
            numZombies = 0,
            zombieDistance = false,
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
            ppm = 5, // pts/meter
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
            grey = '303030',
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
            
            
            //eliminator vars
            nextLapDistance = config.getLapLength(),
            timeCurrentLapStarted = 0,
            numLaps = 0,
			ghostRunners = [],
			tickInterval = null,
			ghostImage = null,
			lastTickTime = null,
			playerIsAhead = true,
			timeAheadnessSwitched = 0,
			showLapCompleteBox = false	,
			timeIcon = null,
			lastLapTime = 0,
			timeOfLastStep,
			timeSpeedLastNonZero,
			gameOver = false,
			lapStartDist = 0,
			loaded = false,
            loading = false,
            waiting = false,
            pendingAssets = 0,
            showOpponentProgressBar = true;
			

			
//// in common with zombie game <---
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
			//vibrate
			navigator.vibrate([10, 10, 10, 10, 10, 10, 10]);
			unlockNotification = game;
			//TODO - have this only disappear 5s after user raises wrist
			//unlockNotificationTimer = setTimeout(clearUnlockNotification, time*1000);
			unlockNotificationActive = true;
		}

		function onTapHandler(data)
		{
			if(isScrolling()) return;
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

/// ---> /in common with zombie game

        function onPageShow() {
        	console.log('racegame:pageshow');
        	gameOver = false;
            document.getElementById('eliminator-end').classList.toggle('hidden', true);
            document.getElementById('eliminator-highscore').classList.toggle('hidden', true);
        	if (!loaded) {
        		waiting = true;
        		loadAssets();
        		return;
        	}
            visible = true;
            finished = false;
            sectionChanger = new SectionChanger(changer, {
                circular: false,
                orientation: "horizontal",
                scrollbar: "bar"                	
            });
            e.listen('tizen.back', onBack);
            e.listen('motion.wristup', onWristUp);
            document.getElementById('quit-confirmation').classList.toggle('hidden', true);
            
            var r = race.getOngoingRace();
            if (r === null || !r.isRunning() || r.hasStopped()) {
                r = race.newRace();
                lastDistanceAwarded = 0;
//                r.data.hr_zones = true;
//                r.data.time_in_zone = 0;
                e.listen('pedometer.step', step);
////                e.listen('hrm.change', onHeartRateChange);

                startCountdown();
            }

			sectionChanger.setActiveSection(1, 0);

			//reset any existing animations
			for(var i=0; i<animatedSprites.length; i++)
			{
				animatedSprites[i].reset();
			}
            
			e.listen('game.unlock.dino', onUnlockDino);
			e.listen('game.unlock.WeightLoss', onUnlockWeightLoss);
            e.listen('game.unlock.Strength', onUnlockStrength);
            
			e.listen('achievement.awarded', onAchievementAwarded);
			page.addEventListener('click', onTapHandler);
////            isDead = false;
			var length = settings.getDistance();
			console.log('target dist = ' + length);
//			var type = settings.getTargetType();
////			var type = settings.getCurrentTarget();
			
////			TRACK_LENGTH = Infinity;
////			targetTime = Infinity;
////			if (type == 'time') { targetTime = settings.getTime() * 60 * 1000; }
////			else if (type == 'distance') { TRACK_LENGTH = settings.getDistance(); }
				
////            lastHRtime = Date.now();
            
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
////			setOpponent(game.getCurrentOpponentType());
//			setOpponent('dinosaur');

////            zombieCatchupSpeed = -zombieStartOffset/config.getCatchupTime();
            
//////////// Eliminator
			nextLapDistance = config.getLapLength();
			
			TRACK_LENGTH = config.getLapLength();
			
			//clear ghosts;
			ghostRunners = [];

			//for now add some sample ghosts
//			addGhost(120);
//			addGhost(135);
//			addGhost(100);
//			addGhost(50);

			// set up tick
			var intervalTime = 33;
			tickInterval = setInterval(tick, intervalTime);
			lastTickTime = Date.now();

			timeSpeedLastNonZero = Date.now();
			
			numLaps = 0;
			lapStartDist = 0;
			
////////////	/Eliminator
            
            
            
        }
        
        function addGhost(time)
        {
        	//TODO set anim speed based on time
        	var newRunner = new Sprite(ghostImage, ghostImage.width/6, 500);
        	newRunner.lapTime = time;
        	newRunner.lapDistance = 0;
        	ghostRunners.push(newRunner);
        	
        	//Sort based on speed for render order - fastest first
			ghostRunners.sort( function(a,b) { return a.lapTime - b.lapTime; } );

			//cull the slowest if too many
			if(ghostRunners.length >= 5)
			{
				ghostRunners.remove
			}

        }
        
        //start the run, but not the game
        function startRun()
        {
			//end warmup - now misnamed, actually sets the initial hr zone we want, based on goal type
////            endWarmup();
			race.getOngoingRace().start();
////            startZombies();
			lastRender = Date.now();
			ppm = 5;
			
			timeCurrentLapStarted = Date.now();
			
        }
        
        function onAchievementAwarded(data)
        {
        	setNotification( green, '#fff', 'Award Unlocked!', null, 3*1000);
			navigator.vibrate([100, 50, 100, 50]);
			if(finished)
			{
				numAwardsAtFinish++;
			}
			chime.play();
        }
        
      
        function onPageHide() {
        	console.log('racegame:pagehide');
            e.die('tizen.back', onBack);
            e.die('motion.wristup', onWristUp);
            
            visible = false;
            document.getElementById('eliminator-end').classList.toggle('hidden', true);
            document.getElementById('eliminator-highscore').classList.toggle('hidden', true);
            clearInterval(fpsInterval);
			clearTimeout(warmupTimeout);
////            clearTimeout(intervalTimeout);
////            clearTimeout(adaptingTimeout);
////            clearTimeout(warningTimeoutLow);
////			clearTimeout(warningTimeoutHigh);
////			clearInterval(heartBeatInterval);
            if (!!sectionChanger) {
            	sectionChanger.destroy();
            	sectionChanger = false;
            }
            
            var r = race.getOngoingRace();
            if (r !== null) {
                r.stop();
                lastRender = null;                
                e.die('pedometer.step', step);
////                e.die('hrm.change', onHeartRateChange);
            }
            if (!!raf) cancelAnimationFrame(raf);
////            clearInterval(zombieInterval);

///////////// Eliminator
			clearInterval(tickInterval);
///////////// /Eliminator


            clearTimeout(bannerTimeout)
            e.die('game.unlock.dino', onUnlockDino);
//            e.die('game.unlock.boulder', onUnlockBoulder);
            e.die('game.unlock.WeightLoss', onUnlockWeightLoss);
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
        
        function onAgain() {
        	numLaps = 0;
			ghostRunners = [];
            document.getElementById('eliminator-end').classList.toggle('hidden', true);
            document.getElementById('eliminator-highscore').classList.toggle('hidden', true);
            gameOver = false;
            ppm = 5;
            playerIsAhead = true;
            timeAheadnessSwitched = Date.now();
        	restart();
        }
        
        function onQuit() {
			var r = race.getOngoingRace();
			e.fire('race.end', r);
			r.stop();

		    e.fire('racesummary.show');
        }
        
        function startCountdown() {
            countingdown = true;
			banner = 'READY';
            clearTimeout(bannerTimeout);
            bannerTimeout = setTimeout(ready, countDownParams.stageDuration * 1000);
			countDownParams.outerRadius = countDownParams.outerRadiusMax;
			countDownParams.startTime = Date.now();
        }
        
        function ready() {
            banner = 'SET';
            requestRender();
            clearTimeout(bannerTimeout);
            bannerTimeout = setTimeout(set, countDownParams.stageDuration * 1000);
            countDownParams.outerRadius = countDownParams.outerRadiusMax;
			countDownParams.startTime = Date.now();
        }
        function set() {
            banner = 'GO';
            requestRender();
            clearTimeout(bannerTimeout);
            bannerTimeout = setTimeout(go, countDownParams.stageDuration * 1000);
            countDownParams.outerRadius = countDownParams.outerRadiusMax;
			countDownParams.startTime = Date.now();
		}
        function go() {

			startRun();
			
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

        }
        
        function restart() {
        	countingdown = false;
////        	startZombies();
        	clearTimeout(bannerTimeout);
        	bannerTimeout = setTimeout(clearbanner, countDownParams.stageDuration * 1000);
			countDownParams.startTime = Date.now();
////			zombiePosWeight = 0;
			lapStartDist = race.getOngoingRace().getMetricDistance();

///////// Eliminator
			for(var i=0; i<ghostRunners.length; i++)
			{
				var ghost = ghostRunners[i];
				ghost.lapDistance = 0;
			}
			
			timeCurrentLapStarted = Date.now();
			
			
///////// /Eliminator

        }
        
        
        function clearbanner() {
            banner = false;
            requestRender();
        }
        
////        function nextWave() {
////        	isDead = false;
////        	runner = runnerAnimations.running;
////            countingdown = true;
////            wave++;
//            zombieCatchupSpeed += 0.01;
////            banner = 'GO';
////            zombieOffset = zombieStartOffset;
////            requestRender();
////            clearTimeout(bannerTimeout);
////            bannerTimeout = setTimeout(restart, 1500);
////            startZombies();
//            zombiePosWeight = 0;
////        }
        
////        function startZombies() {
////            clearInterval(zombieInterval);
////            //4 zombies, we just don't show them all
////            while (zombies.length < 4) {
////                zombies.push(zombies[0].clone());
////            };
////           for (var i=0;i<zombies.length;i++) {
////                zombies[i].reset();
////                var animDelay = Math.random() * zombies[i].getPeriod();
////                zombies[i].time = animDelay;
////            }
////            zombieOffset = zombieStartOffset;
////            zombieDistance = zombieOffset;
//            int intervalTime = Math.min(350, 750-(wave*50));
////			var intervalTime = 33;
////            zombieInterval = setInterval(zombieTick, intervalTime);
////        }
        
		function tick()
		{
			var dt = Date.now() - lastTickTime;
			lastTickTime = Date.now();
			
			var lapLength = config.getLapLength();
			
			var timeInLap = (Date.now() - timeCurrentLapStarted) / 1000;
			
			var r = race.getOngoingRace();
			var playerLapDistance = (r.getMetricDistance() - lapStartDist) % TRACK_LENGTH;
			var playerIsAheadNow = true;
			
			//update runner distances
			for(var i=0; i<ghostRunners.length; i++)
			{
				var ghost = ghostRunners[i];

				ghost.lapDistance = TRACK_LENGTH * (timeInLap / ghost.lapTime);
				if(ghost.lapDistance > lapLength)
				{
					ghost.lapDistance = lapLength;
					gameOverEliminated();
				}
				
				//check if we are still in the lead
				if(ghost.lapDistance > playerLapDistance)
				{
					playerIsAheadNow = false;
				}
			}
			
			//flip this bool, but with some stickingess
			var timeSinceLastSwitch = Date.now() - timeAheadnessSwitched;
			if(timeSinceLastSwitch > 500)
			{
				playerIsAhead = playerIsAheadNow;
				timeAheadnessSwitched = Date.now();
			}
			
			//check if we're actually moving
			if(r.getMetricSpeed() > 1)
			{
				timeSpeedLastNonZero = Date.now();
			}
			else
			{
				if(!notification.active)
				{
					if(Date.now() - timeSpeedLastNonZero > 5000)
					{
						setNotification( flashingRed, '#fff', 'Run to Move Forward', null, 2000);
					}
				}
			}
			
////        if(!isDead)
////        {
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
////        }        
		}


        function gameOverEliminated()
        {
			if(!gameOver)
			{
				gameOver = true;
				ppm = 0;
				//show notification
				setNotification(red, '#fff', 'Eliminated!', null, 3000);

				navigator.vibrate([100, 100, 100, 100, 100, 100, 100]);
			
				setTimeout( function() {
					if (numLaps <= settings.getEliminatorHighScore()) {
						document.getElementById('eliminator-score-value').innerHTML = numLaps;
						document.getElementById('eliminator-best-value').innerHTML = settings.getEliminatorHighScore();
						document.getElementById('eliminator-end').classList.toggle('hidden');
					} else {
						settings.setEliminatorHighScore(numLaps);
						document.getElementById('eliminator-new-hs-value').innerHTML = numLaps;
						document.getElementById('eliminator-highscore').classList.toggle('hidden');
					}
					}, 2000);
				finished = true;
//				var r = race.getOngoingRace();
//				e.fire('race.end', r);
//				r.stop();
			
				chime.play();
			}
        }
        
        function progressToGame()
        {
        	setNotification(green, '#fff', 'Race Starting', null, 2000);
			sectionChanger.setActiveSection(1, 1000);
			setTimeout(startCountdown, 1000);
        }

        
        function step() {
            var r = race.getOngoingRace();
//            if (r.getDistance() < zombieDistance && !isDead) {
////			if(zombieOffset >=0 && !isDead) {
////                if(!isDead)
////                {
////                r.data.caught_by = game.getCurrentOpponentType();
////                r.data.times_caught = r.data.times_caught || 0;
////                r.data.times_caught++;
////                r.addPoints(-100);
                

////					if(settings.getAudioActive()) {
////						killSound.play();
////					}
////                navigator.vibrate([1000, 500, 250, 100]);
//                r.stop();
//                e.fire('race.end', r);
//                lastRender = null;
//                stopZombies();
////				isDead = true;
////                runner.sprite.onEnd(function(dt) {
////                    runner.sprite.onEnd(null);
////                    runner = runnerAnimations.zombieDead;
////                    runner.sprite.time = dt;
////                });
////                requestRender();
////                clearTimeout(bannerTimeout);
////                bannerTimeout = setTimeout(nextWave, 10000);
////                e.fire('died', {cause: game.getCurrentOpponentType()});
////				}
////                return;
////            }
////            if (r.getDistance() >= TRACK_LENGTH || r.getDuration() >= targetTime) {
//                zombieMoan.play();
////                r.addPoints(50);
////                navigator.vibrate(1000);
////                showUnlockNotification('finished', 5);
////                finished = true;
////                numAwardsAtFinish = 0;
////                e.fire('race.end', r);
////                r.stop();
////                lastRender = null;
////                stopZombies();
////                
////                return;
////            }
            
            
////////////// Eliminator            
            if (r.getMetricDistance() >= lapStartDist + TRACK_LENGTH)
            {
            	// add new ghost
            	var lapTime = (Date.now() - timeCurrentLapStarted)/1000;

            	
            	
            	//set next lap distance
//            	nextLapDistance += config.getLapLength();
				lapStartDist = race.getOngoingRace().getMetricDistance();
            	
            	//show 'go'
            	
/*            	//check if the fastest ghost finished before us
            	var playerWon = true;
				for(var i=0; i<ghostRunners.length; i++)
				{
					var ghost = ghostRunners[i];
					if(ghost.lapDistance >= TRACK_LENGTH)
					{
						playerWon = false;

					}
				}
*/
            	
            	if(playerIsAhead)
            	{
            	   	restart();
            	   	numLaps++;
					//show notification
					setNotification(green, '#fff', 'Lap Complete', null, 3000);
					chime.play();
					navigator.vibrate([10, 10, 10, 10]);
					lastLapTime = lapTime.toFixed(1);
					showLapCompleteBox = true;
					setTimeout(hideLapCompleteBox, 5000);
					addGhost(lastLapTime);

            	}
            	else
            	{
					gameOverEliminated();
            	}
            	
            }
///////////// /Eliminator
            
            if (lastDistanceAwarded < r.getMetricDistance()) {
                var distance = r.getMetricDistance();
				r.addPoints((distance - lastDistanceAwarded)*ppm);
				lastDistanceAwarded = distance;
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
            
            requestRender();
        }

		function hideLapCompleteBox() 
		{
			showLapCompleteBox = false;
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
        
        
            var r = race.getOngoingRace();
        	
            //general update of track window
/*            if(!isDead)
            {
				screenWidthDistance = Math.max( 13, Math.min( -zombieOffset + 2, 50)) +1;
			}
			if(numZombies>0 && hasBeenInGoalHRZone)
			{
				if(zombiePosWeight < 1) { zombiePosWeight += 0.02; }
//				screenMidDistance = zombiePosWeight * zombieDistance + r.getDistance();
				var screenLeftDistanceZ = (zombieDistance + r.getDistance() - screenWidthDistance)/2 - 4;
				var screenLeftDistanceNoZ = r.getDistance() - screenWidthDistance/2 - 2;
				//lerp
				var ease = Math.sin( Math.sin(zombiePosWeight*(Math.PI / 2)) );
				screenLeftDistance = screenLeftDistanceNoZ + ease * (screenLeftDistanceZ - screenLeftDistanceNoZ);
			}
			else
			{
//				screenMidDistance = r.getDistance();
				screenLeftDistance = r.getDistance() - screenWidthDistance/2 - 2;
			}
*/

////////// Eliminator
			screenWidthDistance = 13;
			var playerLapDistance = r.getMetricDistance() - lapStartDist;
			//drift from left to right as we get further through the lap
			//go from 0.2 to 0.8 of the way across the screen.
			var lapProportion = playerLapDistance / TRACK_LENGTH;
			var minInset = 0.1;
			var inset = minInset + (1-2*minInset) * (lapProportion)
			screenLeftDistance = playerLapDistance - inset * screenWidthDistance;

////////// /Eliminator
			
			
			
//			screenLeftDistance = screenMidDistance = screenWidthDistance/2;

			// set screenLeftDistance according to how far we are through track			
        
            if (!visible) return;
            var dt = 0;
////            var trackHeight = canvas.height - badBG.height;
			var trackHeight = canvas.height - 250;
			
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
/*			if(showWarningLow || showWarningHigh)
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
*/
			
            
            
            //update flashingRed
			flashingRedParams.phase += dt;
			flashingRedParams.phase = flashingRedParams.phase % flashingRedParams.period;
			if(flashingRedParams.phase > flashingRedParams.period/2)
			{ flashingRedParams.colour = red; }
			else
			{ flashingRedParams.colour = lightRed;}
            
            context.clearRect(0, 0, canvas.width, canvas.height);            
            var trackWidth = canvas.width - 0 - runner.sprite.width;
            var r = race.getOngoingRace();

/*			
			//draw good bg
			context.drawImage(goodBG, 0, 0, canvas.width, canvas.height - trackHeight);
			context.globalAlpha = badFraction;
			context.drawImage(badBG, 0, 0, canvas.width, canvas.height - trackHeight);
			context.globalAlpha = 1;
*/
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
			}
///////////////////////////


			//GPS
				var GPSscale = 0.65;
				context.save();
				context.translate(canvas.width - gpsRing.width/2 * GPSscale, gpsRing.height/2 * GPSscale);
				gpsRing.drawscaled(context, - gpsRing.width/2*GPSscale, -gpsRing.height/2 * GPSscale, 0, GPSscale);
				if(gpsAvailable && hasGPSUpdate)
				{
					gpsDot.drawscaled(context, - gpsDot.width/2*GPSscale, -gpsDot.height/2 * GPSscale, 0, GPSscale);
				}
				context.restore();


			var progressBarHeight = canvas.height - (trackHeight - trackThickness)/2;
			var progressBarInset = 0;
			var notificationInset = 17;
			var notificationRadius = 16;
			var notificationHeight = canvas.height - 16;
			var whiteInset = 8;
			if(!notification.active)
//			if(true)
			{

				//Progress bar
				var fillProportion = 0;
/*				if(TRACK_LENGTH < Infinity) 
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
*/
				fillProportion = ((r.getMetricDistance() - lapStartDist) % TRACK_LENGTH) / TRACK_LENGTH;
				
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
//					context.fillRect(whiteInset, canvas.height - trackHeight + trackThickness/2 + whiteInset, canvas.width - 2 * whiteInset, trackHeight - trackThickness - 2 * whiteInset);
					drawRoundedCornerBoxPath(whiteInset, canvas.height - trackHeight + trackThickness/2 + whiteInset, canvas.width - 2 * whiteInset, trackHeight - trackThickness - 2 * whiteInset, 8);
					context.fill();
					
					
					var greenInset = 6 + whiteInset;
					context.fillStyle = green;
					var fillDist = fillProportion * (canvas.width - 2*greenInset);
					var barHeight = canvas.height - trackHeight + trackThickness/2 + greenInset;
					
					if(!showOpponentProgressBar)
					{					
						context.fillRect( greenInset, canvas.height - trackHeight + trackThickness/2 + greenInset, fillDist, trackHeight - trackThickness - 2*greenInset);
					}
					else
					{
						var barThickness = trackHeight - trackThickness - 2*greenInset;
						var opponentBarThickness = barThickness * 0.3;
						context.fillRect( greenInset, barHeight, fillDist, barThickness - opponentBarThickness);

						//secondary bar for the ghost
						if(ghostRunners.length > 0)
						{
							var bestGhostDist = ghostRunners[0];
							var fillProportion_Ghost = bestGhostDist.lapDistance / TRACK_LENGTH;
							var fillDistGhost = fillProportion_Ghost * (canvas.width - 2*greenInset);
							context.fillStyle = red;
							var lineThickness = 0;
							var h = barHeight + barThickness - lineThickness/2;
							context.beginPath();
							context.rect( greenInset + lineThickness, barHeight + barThickness -opponentBarThickness + lineThickness, fillDistGhost - 2*lineThickness, opponentBarThickness - 2*lineThickness);
							context.strokeStyle = grey;
							context.lineWidth = lineThickness;
//							context.stroke()
							context.fill();
						
						}
					}
					
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
//					context.fillRect( 0, canvas.height - trackHeight + trackThickness/2, canvas.width, canvas.height);
					drawRoundedCornerBoxPath( 0, canvas.height - trackHeight + trackThickness/2, canvas.width, canvas.height);
					context.fill();
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
			context.fillRect(0, trackHeight - 7, canvas.width, 10);
			
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
			
			//one thick line at the lap mark
			context.beginPath();
			context.moveTo(screenPosX, canvas.height - trackHeight +1);
			context.lineTo(screenPosX, canvas.height - (trackHeight -3 - distMarkerHeight * scale));
			context.lineWidth = trackThickness * 2;
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
				var d = r.getMetricDistance();
				var targetdist = TRACK_LENGTH;
				var u = r.getShortDistanceUnits();
				if (u == 'm') {
					d = d / 1000;
					targetdist = targetdist / 1000;
					u = 'km';
				}
				
////				context.fillText(Number(d).toFixed(1) + u, progressBarInset, progressBarHeight);
				//target
				context.textAlign = 'right';
////				context.fillText(Number(targetdist).toFixed(1) + u, canvas.width - progressBarInset, progressBarHeight);
				var heightOffset = showOpponentProgressBar? 5 : 0;
				context.fillText(config.getLapLength()+'m', canvas.width - progressBarInset, progressBarHeight - heightOffset);

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
            
            var playerXPos = 0 + distanceToTrackPos(r.getMetricDistance() - lapStartDist)
            
            var opponentType = game.getCurrentOpponentType()
//            opponentType = 'dinosaur';
/*            switch(opponentType)
            {
	            case 'zombie':
					// Zombies
					if (zombieDistance !== false && hasBeenInGoalHRZone) {
						for (var i=0;i<numZombies;i++) {
							var zombie = zombies[i];
							var x_offset = ((i*(zombie.width*0.3))+(i%2)*5 + zombie.width*0.3) * scale;
							var y_offset = 7*scale;
//							if (i%2==1) context.globalAlpha = 0.75;
//							else context.globalAlpha = 1;
							context.globalAlpha = 1;
							var zombiePos = 0 + distanceToTrackPos(zombieDistance) - x_offset;
		//                    zombiePos -= screenLeftDistance;
							if(!isDead || zombiePos < playerXPos - 10)
							{	
								// if we're dead don't draw them as they join the bundle
								var pace = r.getSpeed();
								if(pace > 0 || zombiesCatchingUp)
								{
									zombie.drawscaled(context, zombiePos, canvas.height - zombie.height * scale - trackHeight + y_offset, dt, scale);
								}
								else
								{
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
					if(zombieDistance != false && currentHRZone!='Recovery' ) {
						var dinoPos = 0 + distanceToTrackPos(zombieDistance);
						var dinoScale = scale * 1.5;
						dino.drawscaled(context, dinoPos - dino.width * 0.6 * dinoScale, canvas.height - (dino.height - 25) * dinoScale - trackHeight - 5* scale, dt, dinoScale);
					}
					break;
				case 'boulder':
					if(zombieDistance != false) 
					{
						var boulderPos = 0 + distanceToTrackPos(zombieDistance);
						context.save();
						boulder.rotation += dt*boulder.rotationSpeed;
						context.translate(boulderPos, canvas.height - boulder.height * scale - trackHeight - 5*scale);
						context.rotate(boulder.rotation);
						boulder.drawscaled(context, 0,0, dt, scale);
						context.restore();
					}
					break;
				default:
					console.error('unhandled opponent type: ' + game.getCurrentOpponentType());
					break;
            }
*/            



            // Self
            //temp hack - make player bigger in death 'cloud' form
            var playerScale = scale;
            var playerOffset = runner.sprite.height * playerScale + trackHeight - 6*scale; 

			//ghost alpha to vary between 1 and this value, with a geometric decay towards it
			var minGhostAlpha = 0.1;
			var additionalAlpha = 0.3;

			//first runner should be brighter
			context.globalAlpha = 0.9;

////////// Eliminator
			//Ghosts
			for(var i=0; i<ghostRunners.length; i++)
        	{
        		var ghost = ghostRunners[i];
        		ghost.drawscaled(context, distanceToTrackPos(ghost.lapDistance), canvas.height - playerOffset, dt, scale);
        		additionalAlpha *= 0.7;
				context.globalAlpha = minGhostAlpha + additionalAlpha;

        	}
        	context.globalAlpha = 1;
        	
        	
        	//Lap counter / lap complete notice
			var counterHeight = 100;
			var counterXPos = canvas.width/2;
			var counterRadius = 135/2;

        	if(!showLapCompleteBox)
        	{
				//circle
				context.beginPath();
				context.arc( counterXPos, counterHeight, counterRadius, 0, 2*Math.PI, false);
				context.fillStyle = playerIsAhead? green : red;
			
				context.fill();
				//text
				context.font = '85px Samsung Sans';
				context.fillStyle = '#fff';
				context.textAlign = 'center';
				context.textBaseline = 'middle';
	//        	context.fillText( numLaps, counterXPos, counterHeight - 10);
				context.fillText( numLaps+1, counterXPos, counterHeight + 15);
				context.font = '24px Samsung Sans';
	//        	context.fillText('laps', counterXPos, counterHeight + 40);
				context.fillText('lap', counterXPos, counterHeight -45);
        	}
        	else
        	{
        		//show lap complete box
        		var w = counterRadius * 1.5;
        		context.beginPath();
        		context.arc(counterXPos - w/2, counterHeight, counterRadius, Math.PI/2, 1.5*Math.PI, false);
        		context.lineTo(counterXPos + w/2, counterHeight - counterRadius);
        		context.arc(counterXPos + w/2, counterHeight, counterRadius, 1.5 * Math.PI, 2.5 * Math.PI, false);
        		context.closePath();
        		context.fillStyle = '#fff';
        		context.fill();
        		//text
        		context.font = '2	4px Samsung Sans';
        		context.fillStyle = '#000';
        		context.textAlign = 'center';
        		context.textBaseline = 'middle';
        		context.fillText ('Lap ' + numLaps + ' Complete', counterXPos, counterHeight - counterRadius/2 + 10);
				//time icon
				var timeHeight = counterHeight + counterRadius/2 - 10;
				var timeIconScale = 1;
				timeIcon.drawscaled(context, counterXPos - 25 - timeIconScale *timeIcon.width, timeHeight - timeIconScale * timeIcon.height/2, 0, timeIconScale);
				//time text
				context.textAlign = 'left';
        		context.fillText ( lastLapTime + 's', counterXPos -15, timeHeight);
				
        	}
        	
        	
////////// /Eliminator        	
        	context.globalAlpha = 1;

/*
            if(isDead)
            {
             	playerScale *=1.6;	
             	playerOffset += 30*playerScale; 
             	runner = runnerAnimations.zombieDead;
            }
*/            
            runner.sprite.drawscaled(context, playerXPos, canvas.height -playerOffset , dt, playerScale);
            
			if(!countingdown)
            {
/*				// Heart Rate
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
			
				var radius = 115/2;
				var hrXPos = canvas.width - radius - 10;
				var hrYPos = 37 + radius;

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
				
*/				
				//Pace
/*				var radius = 115/2;
				var hrXPos = canvas.width - radius - 10;
				var hrYPos = 37 + radius;

				var PaceXPosR = 2*radius;
				context.beginPath();
				context.arc(PaceXPosR, hrYPos, radius, Math.PI * 1.5, Math.PI * 2.5, false);
				context.lineTo(PaceXPosR - 2*radius, hrYPos + radius);
				context.arc(PaceXPosR-2*radius, hrYPos, radius, Math.PI/2, Math.PI*1.5, false);
				context.closePath();
				context.fillStyle = '#fff';
				context.fill();
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
*/								
			
/*			
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
						var delta = Math.round(r.getDistance() - zombieDistance);
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
*/				
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
//					case 'boulder':
//						boulderGameImage.draw(context, 0, 0, 0);
//						break;
					case 'WeightLoss':
						weightLossGameImage.draw(context, 0, 0, 0);
						break;
					case 'Strength':
						strengthGameImage.draw(context, 0, 0, 0);
						break;
					case 'finished':
						finishedImage.draw(context, centreX - finishedImage.height/2, centreY - finishedImage.height/2, 0);
						//also draw text for finished
						context.font = '25px Samsung Sans';
						context.textAlign = 'center';
						context.textBaseline = 'middle';
						context.fillStyle = '#fff';
						context.fillText('Training Complete', centreX, 40);
						if(numAwardsAtFinish == 1)
						{
							context.fillText('1 Award Unlocked', centreX, canvas.height - 30);
						}
						else if(numAwardsAtFinish >1)
						{
							context.fillText(numAwardsAtFinish + ' Awards Unlocked', centreX, canvas.height - 30);
						}
						
						break;
					default:
						console.log('unknown game being unlocked ' + unlockNotification);
            	}
            	
            }
            
            
            context.save();
            frames++;
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
////////// Eliminator        
        	var lapDistance = distance;
////////// /Eliminator
        
        	var trackWidth = canvas.width - 0 - runner.sprite.width;
        	var pos = trackWidth * (lapDistance - screenLeftDistance) / (screenWidthDistance);
        	return pos;
        }



        function gpsSymbolOn(){
             hasGPSUpdate = true;

        }
        function gpsSymbolOff(){
             hasGPSUpdate = false;
            
        }

        
        function attachGame() {
        	console.log('Attaching racegame');
            page.addEventListener('pageshow', onPageShow);
            page.addEventListener('pagehide', onPageHide);
            document.getElementById('game-yesquit-btn').addEventListener('click', onQuit);
            document.getElementById('game-noquit-btn').addEventListener('click', onBack);
            document.getElementById('eliminator-hs-again-btn').addEventListener('click', onAgain);
            document.getElementById('eliminator-hs-quit-btn').addEventListener('click', onQuit);
            document.getElementById('eliminator-end-again-btn').addEventListener('click', onAgain);
            document.getElementById('eliminator-end-quit-btn').addEventListener('click', onQuit);
        }
        function detachGame() {
        	console.log('Detaching racegame');
            page.removeEventListener('pageshow', onPageShow);
            page.removeEventListener('pagehide', onPageHide);
            document.getElementById('game-yesquit-btn').removeEventListener('click', onQuit);
            document.getElementById('game-noquit-btn').removeEventListener('click', onBack);
            document.getElementById('eliminator-hs-again-btn').removeEventListener('click', onAgain);
            document.getElementById('eliminator-hs-quit-btn').removeEventListener('click', onQuit);
            document.getElementById('eliminator-end-again-btn').removeEventListener('click', onAgain);
            document.getElementById('eliminator-end-quit-btn').removeEventListener('click', onQuit);
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
            
        	//leave hrm in, still want it for side screen
            if (hrm.isAvailable()) {
                  hrm.start();
                  // Availability will change if start fails
              } 
              if (!hrm.isAvailable()) {
              	hrmMock.start();
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
            
            loadImage('images/animation_runner_white.png', function() {
				ghostImage = this;
			});

            loadImage('images/animation_runner_red_stationary.png', function() {
                runnerAnimations.idle_red.sprite = new Sprite(this, this.width, 500);
            });
            
            //chime
            chime = new Audio('audio/Chime.wav');
            chime.onerror = function() { throw "Could not load " + this.src; }
                                    
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
			
			//dino game image
			loadImage('images/race_dino_unlocked_ingame.png', function() {
				dinoGameImage = new Sprite(this, this.width, 1000);
			});
			
			//boulder game image
//			loadImage('images/image_boulder_achievement_screen.png', function() {
//				boulderGameImage = new Sprite(this, this.width, 1000);
//			});
			
			// Weight loss game image
			loadImage('images/Game_Eliminator/screen_RY_Slimmer_unlocked.png', function() {
				weightLossGameImage = new Sprite(this, this.width, 1000);
			});
			
			// Strength game image
			loadImage('images/Game_Eliminator/screen_RY_Faster_unlocked.png', function() {
				strengthGameImage = new Sprite(this, this.width, 1000);
			});
			
			//finished image
			loadImage('images/image_ending flag.png', function() {
				finishedImage = new Sprite(this, this.width, 1000);
			});
			
			loadImage('images/icon-speed_whiteBG.png', function() {
				paceIcon = new Sprite(this, this.width, 1000);
			});

			loadImage('images/icon-time_black.png', function() {
				timeIcon = new Sprite(this, this.width, 1000);
			});
			
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
            'racegame.show': show,
            'racegame.attach': attachGame,
            'racegame.detach': detachGame,
            'racegame.preload': onPreload,
            'gps.status': onGpsStatus,
            'gpsUpdateOn': gpsSymbolOn,
            'gpsUpdateOff': gpsSymbolOff
        });

        return {
            init: init
        };
    }

});
