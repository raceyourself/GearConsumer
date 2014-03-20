/*global define, $, console, window, history, document*/

/**
 * Main page module
 */

define({
    name: 'views/page/hrzgame',
    requires: [
        'core/event',
        'views/page/gameachievements',
        'views/page/gamestats1',
        'views/page/gamestats2',
        'views/page/gamestats3',
        'views/page/gamestats4',
//        'views/page/gameselect',
        'models/race',
        'models/hrm',
        'models/sprite',
        'models/settings',
        'models/settings',
		'models/game',
    ],
    def: function viewsPageHeartRateZombiesGame(req) {
        'use strict';

        var e = req.core.event,
            race = req.models.race,
            hrm = req.models.hrm,
            game = req.models.game,
            settings = req.models.settings,
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
            countingdown = false,
            runner = null,
            heartGreen = null,
            heartRed = null,
            heartBlack = null,
            deadImage = null,
            deadRunnerImage = null,
            gps = null,
            sweat = null,
            runnerAnimations = {
                    idle: { name: 'idle', sprite: null, speedThreshold: 0},
                    running: { name: 'running', sprite: null, speedThreshold: 0.1},
                    running_red: { name: 'running_red', sprite: null, speedThreshold: 0.1},
                    sprinting: { name: 'sprinting', sprite: null, speedThreshold: 4},
                    sprinting_red: { name: 'sprinting_red', sprite: null, speedThreshold: 4},
                    zombieDead: { name: 'zombieDead', sprite: null, speedThreshold: -1}
            },
            notification = {
            		active: false,
            		colour: '#fff',
            		text: 'Achievement Unlocked',
            		period: 600,
            		phase: 0,
            		},
            notificationTimeout = false,            	
            zombies = [],
            dino = null,
            boulder = null,
            dinoGameImage = null,
            boulderGameImage = null,
            zombiesAnimOffset = [],
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
            visible = false,
            changer,
            sectionChanger,
            fpsInterval = false,
            frames = 0,
            fps = 0,
            lastDistanceAwarded = 0,
            ppm = 5, // pts/meter
            hr = 100,
            maxHeartRate = 150,
            minHeartRate = 120,
            hrInterval = false,
            hrChangePeriod = 5000,
            lastHRtime = 0,
            hrColour = '#fff',
            zombieCatchupSpeed = 0.05,
            zombieStartOffset = -25,
            zombieOffset = zombieStartOffset,
            screenWidthDistance = 25,	//'real-world' distance covered by the screen's width
            screenLeftDistance = zombieOffset,		//'real-world' position of left of screen
			hrZones = [],
			currentHRZone = null,
			currentZone = 0,
			warmupTimeout = false,
			timeMultiplier = 0.1,			//hack to test quickly. Set to 1
			intervalTimeout = false,
			zoneAdaptTimeout = false,
			warningTimeout = false,
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
            lightRed = '#dc8080',
			flashingRed = 'flashingRed',
			flashingRedParams = { colour: '#fff', period:400, phase: 0 },
			hrNotFound = false,
			unlockNotification = null,
			unlockNotificationTimer = null,
			dottedPattern = null;

			

        function show() {
            gear.ui.changePage('#race-game');
        }

		function setNotification(colour, text, duration)
		{
			notification.colour = colour;
			notification.text = text;
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

		function showUnlockNotification(game)
		{
			//vibrate
			navigator.vibrate([10, 10, 10, 10, 10, 10, 10]);
			unlockNotifiaction = game;
			//TODO - have this only disappear 5s after user raises wrist
			unlockNotificationTimer = setTimeout(clearUnlockNotification, 5*1000);
		}

		function onUnlockDino()
		{
			showUnlockNotification('dino');
		}
		
		function onUnlockBoulder()
		{
			showUnlockNotification('boulder');
		}

        function onPageShow() {
            visible = true;
            e.listen('tizen.back', onBack);
            sectionChanger = new SectionChanger(changer, {
                circular: false,
                orientation: "horizontal"
            });
            
            var r = race.getOngoingRace();
            if (r === null || !r.isRunning() || r.hasStopped()) {
                r = race.newRace();
                lastDistanceAwarded = 0;
                r.data.hr_zones = true;
                r.data.time_in_zone = 0;
                e.listen('pedometer.step', step);
                e.listen('hrm.change', onHeartRateChange);

                startCountdown();
            }
            
			e.listen('game.unlock.dino', onUnlockDino);
			e.listen('game.unlock.boulder', onUnlockBoulder);
			
            isDead = false;
			var length = settings.getDistance();
			console.log('target dist = ' + length);
//			var type = settings.getTargetType();
			var type = settings.getCurrentTarget();
			
			if (type == 'time') { targetTime = settings.getTime() * 60 * 1000; }
			else if (type == 'distance') { TRACK_LENGTH = settings.getDistance(); }
				
            lastHRtime = Date.now();
            
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;        
            
            frames = 0;
            fpsInterval = setInterval(function() {
                fps = frames;
                frames = 0;
            }, 1000);
            
            animate();
            requestRender();
            hrInterval = setInterval(randomHR, hrChangePeriod);
            
            //get opponent type from game
			setOpponent(game.getCurrentOpponentType());
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
        			regularSound = zombieMoan;
        			killSound = zombieGrowl;
					break;
        		case 'boulder':
        			regularSound = zombieMoan;
        			killSound = zombieGrowl;
					break;
				default:
					console.error('unrecognised opponent type: ' + game.getCurrentOpponentType());
					break;
        	}
        }
        
        function onPageHide() {
            visible = false;
            clearInterval(fpsInterval);
            clearInterval(randomHR);
			clearTimeout(warmupTimeout);
            clearTimeout(intervalTimeout);
            clearTimeout(adaptingTimeout);
            clearTimeout(warningTimeout);
            sectionChanger.destroy();
            e.die('tizen.back', onBack);
            
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
            e.die('game.unlock.boulder', onUnlockBoulder);
        }        
        
        function onBack() {
            e.fire('gameselect.show');
        }
        
        function startCountdown() {
            countingdown = true;
			banner = 'READY';
            clearTimeout(bannerTimeout);
            bannerTimeout = setTimeout(ready, 1000);
        }
        
        function ready() {
            banner = 'SET';
            requestRender();
            clearTimeout(bannerTimeout);
            bannerTimeout = setTimeout(set, 1000);
        }
        function set() {
            banner = 'GO';
            requestRender();
            clearTimeout(bannerTimeout);
            bannerTimeout = setTimeout(go, 1000);
        }
        function go() {
            race.getOngoingRace().start();
            startZombies();
            lastRender = Date.now();
            requestRender();
            countingdown = false;
            clearTimeout(bannerTimeout);
            bannerTimeout = setTimeout(clearbanner, 1000);
            setCurrentHRZone("Recovery");
            warmupTimeout = setTimeout(endWarmup, 5*60*1000 * timeMultiplier);	//5 minutes warmup
        }
        
        function restart() {
        	countingdown = false;
        	startZombies();
        	clearTimeout(bannerTimeout);
        	bannerTimeout = setTimeout(clearbanner, 1000);
        }
        
        function endWarmup() 
        {
        	var r = race.getOngoingRace();
        	        	console.log("Warmup over. Goal is: " + r.getGoal());

        	switch(r.getGoal())
        	{
        	
        		case "WeightLoss":
        		//set new zone and stay there
        			setCurrentHRZone("Light");
        			break;
        		case "Endurance":
        		//set light zone, then step up to aerobic later
        			setCurrentHRZone("Light");
        			intervalTimeout = setTimeout(nextHRZone, 3*60*1000 * timeMultiplier);
        			break;
				case "Strength":
					setCurrentHRZone("Light");
				//set light zone then step up later
					intervalTimeout = setTimeout(nextHRZone, 3*60*1000 * timeMultiplier);
					break;
				default:
					console.error("Unknown goal type: " + r.getGoal());
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
					switch(currentHRZone)
					{
						case "Light":
							//step up to aerobic and stay there
							setCurrentHRZone("Aerobic");
							break;
						default:
							console.log("shouldn't be in this zone in Endurance training: " + currentHRZone);
							break;
					}
					break;
				case "Strength":
					switch(currentHRZone)
					{
						case "Light":
						case "Anaerobic":
							//transition to Aerobic for next interval
							setCurrentHRZone("Aerobic");
							intervalTimeout = setTimeout(nextHRZone, 1*60*1000 * timeMultiplier);
							break;
						case "Aerobic":
							//transition up to Anaerobic
							setCurrentHRZone("Anaerobic");
							intervalTimeout = setTimeout(nextHRZone, 2*60*1000 * timeMultiplier);
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
        	handleHRChanged()
        if(zone == currentHRZone)
        {
        	
        }
        else
        {
        	currentHRZone = zone;
        //eventually look up based on age, but for now just used valued based on 30yo
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
			adaptingTimeout	= setTimeout(adaptComplete, 1 * 60 * 100 * timeMultiplier);
			
			//vibrate
			navigator.vibrate([10, 10, 10, 10, 10, 10, 10]);

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
            zombieCatchupSpeed += 0.01;
            banner = 'GO';
            zombieOffset = -25;
            requestRender();
            clearTimeout(bannerTimeout);
            bannerTimeout = setTimeout(restart, 1500);
            startZombies();
        }
        
        function startZombies() {
            clearInterval(zombieInterval);
            var animDelay = Math.random() * 0.2;
            //4 zombies, we just don't show them all
            while (zombies.length < 4) {
                zombies.push(zombies[0].clone());
                zombiesAnimOffset.push(animDelay);
            };
            for (var i=0;i<zombies.length;i++) zombies[i].reset();
            zombieOffset = zombieStartOffset;
            zombieDistance = zombieOffset;
//            int intervalTime = Math.min(350, 750-(wave*50));
			var intervalTime = 33;
            zombieInterval = setInterval(zombieTick, intervalTime);
        }
        
        function zombieTick() 
        {
        	if(zombiesCatchingUp)
        	{
            	zombieOffset += zombieCatchupSpeed;
        	}
        	var r = race.getOngoingRace();
        	zombieDistance = r.getDistance() + zombieOffset;
            requestRender();
            step();
            
            //general update of track window
            if(!isDead)
            {
				screenWidthDistance = Math.max( 10, Math.min( -zombieOffset + 15, 100));
			}
			
			screenLeftDistance = (zombieDistance + r.getDistance() - screenWidthDistance)/2;
			
			//check how long since heartrate
			if( Date.now() - lastHRtime > 10*1000 )
			{
				hrNotFound = true;			
			}


			//instigate warning
			if(hr < minHeartRate)
			{	
				showWarningLow = false;
				ppm = 5; // Standard pts/meter
				if(!showWarningHigh)
				{
					clearNotification()
					setNotification(flashingRed, 'Heart Rate too low!', 0);
					showWarningHigh = true;
					regularSound.play();
					navigator.vibrate([1000, 500, 250, 100]);
				}
				if(!adaptingToRecentZoneShift)
				{
					if(warningTimeout == false)
					{
						warningTimeout = setTimeout(warningOver_low, 10*1000 * timeMultiplier);
					}
				}
				if(!isDead)
				{
					runner = runnerAnimations.running;
				}
			}
			else if(hr > maxHeartRate)
			{
				showWarningHigh = false;
				ppm = -1; // Negative pts/meter
				if(!showWarningLow)
				{
					clearNotification();
					setNotification(flashingRed, 'Heart Rate too high!', 0);
					showWarningLow = true;
					navigator.vibrate([1000, 500, 250, 100]);
				}
				if(!adaptingToRecentZoneShift)
				{
					if(warningTimeout == false)
					{
						warningTimeout = setTimeout(warningOver_high, 10*1000 * timeMultiplier);
					}
				}
			}
			else
			{
				ppm = 5; // Standard pts/meter
				//clear warning
				if(showWarningLow || showWarningHigh)
				{
					showWarningLow = false;
					showWarningHigh = false;
					clearNotification();
				}
				clearTimeout(warningTimeout);
				warningTimeout = false;
				//stop zombies catching up
				zombiesCatchingUp = false;
				//clear runner
				if(!isDead)
				{
					runner = runnerAnimations.running;
				}
			}
        }

        
        function stopZombies() {
            clearInterval(zombieInterval);
            zombieDistance = false;            
        }
        
        
        function onHeartRateChange(hrmInfo) {
        	//set heartRate
        	lastHRtime = Date.now();
        	hrNotFound = false;
            hr = hrmInfo.detail.heartRate;
        	handleHRChanged();
        }

		function setMinMaxHeartRate() {
			//to be eventually based on age and user-defined goals. Just use values for 30yo aerobic exercise for now.
		}
        
        //test function to provide random heart rate
        function randomHR() {
        	hr = Math.floor( 50 + 150 * (Math.random()) );
        	e.fire('hrm.change', {heartRate: hr});
        }
        
        function handleHRChanged() 
        {
        	if(hrNotFound)
        	{
				showWarningLow = false;
				showWarningHigh = false;
				clearTimeOut(warningTimeout);
				zombiesCatchingUp = false;
				runner = runnerAnimations.running;
				clearNotification();
				setNotification( '#fff', 'No Heart Rate', 0);
        	}
        	else
        	{
        
				if(hr > maxHeartRate && !hrNotFound)
				{
					hrColour = '#ff0000';
				}
				else if (hr > minHeartRate && !hrNotFound)
				{
					hrColour = '#fff';
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
        
        function warningOver_low() 
        {
        	console.log("Warning up! Zombies catching up");
        	zombiesCatchingUp = true;
        }
        function warningOver_high()
        {
        	console.log("Warning up! now losing sweat points");
        	runner = runnerAnimations.running_red;
        }
        
        function step() {
            var r = race.getOngoingRace();
            if (r.getDistance() < zombieDistance && !isDead) {
                r.data.caught_by = game.getCurrentOpponentType();
                r.data.times_caught = r.data.times_caught || 0;
                r.data.times_caught++;
                r.addPoints(-100);
                killSound.play();
                navigator.vibrate([1000, 500, 250, 100]);
//                r.stop();
//                e.fire('race.end', r);
//                lastRender = null;
//                stopZombies();
				isDead = true;
				runner = runnerAnimations.zombieDead;
                requestRender();
                clearTimeout(bannerTimeout);
                bannerTimeout = setTimeout(nextWave, 3000);
                e.fire('died', {cause: game.getCurrentOpponentType()});
                return;
            }
            if (r.getDistance() >= TRACK_LENGTH || r.getDuration() >= targetTime) {
//                zombieMoan.play();
                r.addPoints(50);
                navigator.vibrate(1000);
                e.fire('race.end', r);
                r.stop();
                lastRender = null;
                stopZombies();
                
                banner = 'Complete!';
                requestRender();
                clearTimeout(bannerTimeout);
				bannerTimeout = setTimeout(continueToResults, 5000);

                return;
            }
            
            if (lastDistanceAwarded < r.getDistance()) {
                var distance = r.getDistance();
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
            var dt = 0;
            var trackHeight = 50;

            
            if (lastRender !== null) {
                dt = Date.now() - lastRender;
                lastRender = Date.now();
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
            var r = race.getOngoingRace();

			//Header
			//sweat points
			if(true)
			{
				var xpos = 0;
				var ypos = 0;
				sweat.draw(context, xpos,ypos,0);
				context.font = '18px Samsung Sans';
				context.fillStyle = '#fff';
				context.textBaseline = "middle";
				context.textAlign = "left";
				context.fillText('SP', xpos + sweat.width + 5, ypos + sweat.height/2);
				context.fillStyle = green;
				context.fillText(~~settings.getPoints(), xpos + sweat.width + 5 + 30, ypos + sweat.height/2);
			}

			//GPS
			if(true)
			{
				var GPSscale = sweat.height / gps.height;
				gps.drawscaled(context, canvas.width - gps.width*GPSscale, 0, 0, GPSscale);
			}

            // Banner
            if (false) {
                context.font = '75px Samsung Sans';
                context.fillStyle = '#fff';
                context.textBaseline = "top";
                context.textAlign = "center";
                context.fillText(banner, canvas.width/2, 25);
            }
            
            if (banner === false && zombieDistance !== false) {
                var delta = r.getDistance() - zombieDistance;
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
                    context.font = '25px Samsung Sans';
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

            if(!countingdown)
            {
				// Heart Rate
				var heartIcon = null;
				var hrFillColour = green;

				if(hrNotFound)
				{
					heartIcon = heartBlack;
					hrFillColour = '#555';
				}
				else if(hr > maxHeartRate)
				{
					heartIcon = heartBlack; 
					hrFillColour = flashingRedParams.colour;             	
				}
				else if(hr < minHeartRate) 
				{
					heartIcon = heartRed; 
					hrFillColour = flashingRedParams.colour;
				}

				else { heartIcon = heartGreen; }
			
				var radius = 115/2;
				var hrXPos = canvas.width - 30 - radius;
				var hrYPos = 37 + radius;
				//fill
				var MaxCircleHR = 200;
				var MinCircleHR = 50;
				context.beginPath();
				context.arc(hrXPos, hrYPos, radius, 0, 2*Math.PI, false);
				context.fillStyle = '#fff';
				context.fill();
			
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
						
				//water marks
				context.globalAlpha = 0.5;
				context.strokeStyle = dottedPattern;
				var heightProportion = (maxHeartRate - MinCircleHR)/(MaxCircleHR - MinCircleHR);
				var height = heightProportion * 2 * radius - radius;
				var a = Math.asin(height/radius);
				//do an arc to get the pen in the right place
				context.beginPath();
				context.moveTo(hrXPos - radius * Math.cos(a), hrYPos - height);
				context.lineTo(hrXPos + radius * Math.cos(a), hrYPos - height);
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
				
				//icon
				heartIcon.draw(context, hrXPos-heartIcon.width/2, hrYPos-heartIcon.height/2 - 30, 0);
				//number
				context.font = '56px Samsung Sans';
				context.textAlign = 'center';
				context.textBaseline = "middle";
				context.fillStyle = '#000';
				var hrText = hr;
				if(hrNotFound) { hrText = '--'; }
				context.fillText(hrText, hrXPos, hrYPos + 10);
				//bpm
				context.font = '18px Samsung Sans';
				context.fillText('bpm', hrXPos, hrYPos + 38);



			
			
				//Ahead/Behind
				var distXPos = 30 + radius;
				var distYPos = 37 + radius;
				if(!isDead)
				{
					context.beginPath();
					context.arc(distXPos, distYPos, radius, 0, 360, false);
					context.fillStyle = green;
					context.fill();
					//+
					context.fillStyle = '#fff';
					context.font ='25px Samsung Sans';
					context.fillText('+', distXPos, distYPos - 33);
					//m
					context.font = '18px Samsung Sans';
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
            
            // Track
            context.beginPath();
            context.moveTo(15, canvas.height - trackHeight);
            context.lineTo(canvas.width - 15, canvas.height - trackHeight);
            context.lineWidth = 1;
            context.strokeStyle = "#fff";
            context.stroke();
            
            // Track text
            context.font = '25px Samsung Sans';
            context.fillStyle = '#fff';
            context.textBaseline = "top";
//            context.textAlign = "left";
//            context.fillText(''+ Math.floor(screenLeftDistance), 10, canvas.height-25);
//            context.textAlign = "right";
//            context.fillText(''+ Math.floor(screenWidthDistance + screenLeftDistance), canvas.width - 10, canvas.height-25);
  			context.textAlign = "center";          
			
			//draw distance markers for screen range
			context.beginPath();
			var distMarkerSpacing = 10;
			var distMarkerIndex = Math.floor(screenLeftDistance/distMarkerSpacing);
			distMarkerIndex = Math.max(distMarkerIndex, 0);
			while (distMarkerIndex * distMarkerSpacing <= (screenLeftDistance + 2*screenWidthDistance) )
			{
				var dist = distMarkerIndex * distMarkerSpacing
				var screenPosX = distanceToTrackPos(dist);
				if(dist%500 == 0)
				{
					context.textBaseline = "bottom";
					context.textAlign = "right";
					context.font = '18px Samsung Sans';
					var distkm = dist/1000;
					context.fillText(distkm, distanceToTrackPos(dist), canvas.height-trackHeight + 20);
					context.textAlign = "left";
					context.font = "15px Samsung Sans";
					context.fillText('km', distanceToTrackPos(dist) + 1, canvas.height-trackHeight + 20);
				}
				else
				{
					var distMarkerHeight = 12;
					if(dist%100 == 0) { distMarkerHeight = 20; }
//					context.fillText('' + dist, distanceToTrackPos(dist), canvas.height-25);
					context.moveTo(screenPosX, canvas.height - trackHeight +3);
					context.lineTo(screenPosX, canvas.height - (trackHeight -3 - distMarkerHeight*scale));
				}
				distMarkerIndex++;
			}
			context.lineWidth = 6*scale;
			context.strokeStyle = "#fff";
			context.stroke();
			
			if(!notification.active)
			{
				//Progress bar
				var progressBarRadius = 10;
				var progressBarInnerRadius = 8;
				var progressBarHeight = canvas.height - progressBarRadius - 8;
				var progressBarInset = progressBarRadius + 10;
			
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
			
			//notification
			if(notification.active)
			{
				var notificationInset = 15;
				var notificationRadius = 16;
				var notificationHeight = canvas.height - 16;
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
				//text
				context.font = '25px Samsung Sans';
				context.fillStyle = '#000';
				context.textAlign = 'center';
				context.textBaseline = 'middle';
				context.fillText( notification.text, canvas.width/2, notificationHeight);
			}
			
			//text labels
			///run
			context.font = '18px Samsung Sans';
			context.fillStyle = '#000';
			context.textAlign = 'left';
			context.textBaseline = 'middle';

			if(TRACK_LENGTH < Infinity)
			{
				//run
				distkm = Math.round(r.getDistance()/100) / 10;
				context.fillText(distkm + 'km', progressBarInset - 5, progressBarHeight);
				//target
				context.textAlign = 'right';
				var targetdist = Math.round(TRACK_LENGTH/100)/10;
				context.fillText(targetdist + 'km', canvas.width - progressBarInset + 5, progressBarHeight);

			}
			else if(targetTime < Infinity)
			{
				//time run
				var timeString = stringForTimeHHMMSS(r.getDuration());
				context.textAlign = 'left';
				context.fillText(timeString, progressBarInset - 5, progressBarHeight);
				//target
				context.textAlign = 'right';
				var targetTimeString = stringForTimeHHMMSS(targetTime);
				context.fillText(targetTimeString, canvas.width - progressBarInset + 5, progressBarHeight);
			}
			else
			{
				//show time run on left
				var timeString = stringForTimeHHMMSS(r.getDuration());
				context.textAlign = 'left';
				context.fillText(timeString, progressBarInset -5, progressBarHeight);
				
				//show distance run on right
				context.textAlign = 'right';
				var distkm = Math.round(r.getDistance()/100) / 10;
				context.fillText(distkm + 'km', canvas.width - progressBarInset + 5, progressBarHeight);
			}

			
            scale = 10/screenWidthDistance;
            
            var playerXPos = 0 + distanceToTrackPos(r.getDistance())
            
            
            switch(game.getCurrentOpponentType())
            {
	            case 'zombie':
					// Zombies
					if (zombieDistance !== false) {
						for (var i=0;i<numZombies;i++) {
							var zombie = zombies[i];
							var x_offset = ((i*(zombie.width*0.3))+(i%2)*5 + zombie.width*0.3) * scale;
							var y_offset = (-1+(i+1)%2) * 5;
							if (i%2==1) context.globalAlpha = 0.5;
							else context.globalAlpha = 1;
							var zombiePos = 0 + distanceToTrackPos(zombieDistance) - x_offset;
		//                    zombiePos -= screenLeftDistance;
					var localDT = dt * (0.9 + zombiesAnimOffset[i]);
							if(!isDead || zombiePos < playerXPos - 10)
							{	
								// if we're dead don't draw them as they join the bundle
								zombie.drawscaled(context, zombiePos, canvas.height - zombie.height * scale - trackHeight - 5*scale + y_offset, localDT, scale);
							}
						}
						context.globalAlpha = 1;
					}
					break;
				case 'dinosaur':
					if(zombieDistance != false) {
						var dinoPos = 0 + distanceToTrackPos(zombieDistance);
						dino.drawscaled(context, dinoPos, canvas.height - dino.height * scale - trackHeight - 5*scale, dt, scale);
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
            
            // Self
            //temp hack - make player bigger in death 'cloud' form
            var playerScale = scale;
            var playerOffset = runner.sprite.height * playerScale + trackHeight + 5 * playerScale 
            if(isDead) { playerOffset += 10*playerScale; }
            runner.sprite.drawscaled(context, playerXPos, canvas.height -playerOffset , dt, playerScale);
            
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
            	var centreX = canvas.width/2;
            	var centreY = canvas.height/2;
            	var countdownRadius = 100;
            	
            	//fill screen white
            	context.globalAlpha = 0.5;
            	context.fillStyle = '#fff';
            	context.fillRect(0,0,canvas.width, canvas.height);
            	context.globalAlpha = 1;
            	
            	//black circle
            	context.beginPath();
            	context.arc(centreX, centreY, countdownRadius, 0, 2* Math.PI, false);
            	context.fillStyle = '#000';
            	context.fill();
//            	context.beginPath();
//            	context.arc(centreX, centreY, countdownRadius, 0, 2* Math.PI, false);
            	context.strokeStyle = '#fff';
            	context.stroke();
            	//outer ring
            	context.beginPath();
            	context.arc(centreX, centreY, countdownRadius + 20, 0, 2*Math.PI, false);
            	context.stroke(); 
            	//text
            	context.font = '56px SamsungSans';
            	context.textAlign = "center";
            	context.textBaseline = "middle";
            	context.fillStyle = '#fff';
            	if(banner == 'GO') {context.fillStyle = green;}
            	context.fillText(banner,centreX, centreY);
            }
            
            //Unlock Notification
            if(unlockNotification != null)
            {
            	var centreX = canvas.width/2;
            	var centreY = canvas.height/2;
            	var unlockRadius = 110
            	//white bg
            	context.globalAlpha = 0.5;
            	context.fillStyle = '#fff';
            	context.fillRect(0,0,canvas.width, canvas.height);
            	context.globalAlpha = 1;
            	
            	//black circle
            	context.beginPath();
            	context.arc(centreX, centreY, unlockRadius, 0, 2* Math.PI, false);
            	context.fillStyle = '#000';
            	context.fill();
//            	context.beginPath();
//            	context.arc(centreX, centreY, unlockRadius, 0, 2* Math.PI, false);
            	context.strokeStyle = '#fff';
            	context.stroke();
            	//image
            	var unlockSprite = null;
            	var unlockMessage = '';
            	switch(unlockNotification)
            	{
            		case 'dino':
            			unlockSprite = dinoGameImage;
            			unlockMessage = 'Race Dino'
            			break;
					case 'boulder':
						unlockSprite = boulderGameImage;
						unlockMessage = 'Race Boulder'
						break;
					default:
						console.log('unknown game being unlocked ' + unlockNotification);
            	}
            	unlockSprite.draw(context, centreX - unlockSprite.width/2, centreY - unlockSprite.height/2 + 50, 0);
            	//text
            	context.font = '25px Samsung Sans';
            	context.textAlign = "center";
            	context.textBaseline = "middle";
            	context.fillStyle = '#fff';
            	context.fillText('Well Done!', centreX, centreY -69);
            	context.fillText('You unlocked', centreX, centreY -39);
            	context.fillText(unlockMessage, centreX, centreY -9 );
            }
            
            
            context.save();
            frames++;
        }
        
       
        function distanceToTrackPos(distance)
        {
        	var trackWidth = canvas.width - 0 - runner.sprite.width;
        	var pos = trackWidth * (distance - screenLeftDistance) / (screenWidthDistance);
        	return pos;
        }
        
        function attachGame() {
            page.addEventListener('pageshow', onPageShow);
            page.addEventListener('pagehide', onPageHide);
        }
        function detachGame() {
            page.removeEventListener('pageshow', onPageShow);
            page.removeEventListener('pagehide', onPageHide);
        }
                
        function bindEvents() {
        }

        function init() {
            page = document.getElementById('race-game');
            changer = document.getElementById("race-game-sectionchanger");
            canvas = document.getElementById('race-canvas');
            context = canvas.getContext('2d');
            
            // Set up animation transitions
            runnerAnimations.idle.previous = null;
            runnerAnimations.idle.next = runnerAnimations.running;
            runnerAnimations.running.previous = runnerAnimations.idle;
            runnerAnimations.running.next = runnerAnimations.sprinting;
            runnerAnimations.sprinting.previous = runnerAnimations.running;
            runnerAnimations.sprinting.next = null;
            
            var image = new Image();            
            image.onload = function() {
                runnerAnimations.idle.sprite = new Sprite(this, this.width, 1000);
                runner = runnerAnimations.running;
            }
            image.onerror = function() {
                throw "Could not load " + this.src;
            }
            image.src = 'images/runner-idle-anim.png';


            image = new Image();
            image.onload = function() {
                runnerAnimations.running.sprite = new Sprite(this, this.width / 6, 1000);
                runnerAnimations.sprinting.sprite = new Sprite(this, this.width / 6, 1000);
            }
            image.onerror = function() {
                throw "Could not load " + this.src;
            }
            image.src = 'images/animation_runner_green.png';

			image = new Image();
            image.onload = function() {
                runnerAnimations.running_red.sprite = new Sprite(this, this.width / 6, 1000);
                runnerAnimations.sprinting_red.sprite = new Sprite(this, this.width / 6, 1000);
            }
            image.onerror = function() {
                throw "Could not load " + this.src;
            }
            image.src = 'images/animation_runner_red.png';

			image = new Image();
            image.onload = function() {
                runnerAnimations.zombieDead.sprite = new Sprite(this, this.width / 2, 1000);
            }
            image.onerror = function() {
                throw "Could not load " + this.src;
            }
            image.src = 'images/animation_cloud.png';

            /*
            image = new Image();
            image.onload = function() {
                runnerAnimations.sprinting.sprite = new Sprite(this, this.width / 6, 2500);
            }
            image.onerror = function() {
                throw "Could not load " + this.src;
            }
            image.src = 'images/runner-sprinting-anim.png';
            */

            image = new Image();
            image.onload = function() {
                zombies.push(new Sprite(this, this.width / 6, 1000));
                var animDelay = Math.random() * 0.2;
                zombiesAnimOffset.push(animDelay);
            }
            image.onerror = function() {
                throw "Could not load " + this.src;
            }
            image.src = 'images/animation_zombie1.png';

            
            zombieMoan = new Audio('audio/zombie_moan.wav');
            zombieMoan.onerror = function() {
                throw "Could not load " + this.src;
            }
            zombieGrowl = new Audio('audio/zombie_growl.wav');
            zombieGrowl.onerror = function() {
                throw "Could not load " + this.src;
            }
            
            //heart     
        	image = new Image();
        	image.onload = function() {
        		heartGreen = new Sprite(this, this.width, 1000);
        		heartGreen.scale = 0.5;
        	}
            image.onerror = function() {
                throw "Could not load " + this.src;
            }
            image.src = 'images/image_heart_green.png';

        	image = new Image();
        	image.onload = function() {
        		heartRed = new Sprite(this, this.width, 1000);
        		heartRed.scale = 0.5;
        	}
            image.onerror = function() {
                throw "Could not load " + this.src;
            }
            image.src = 'images/image_heart_red.png';
            
			image = new Image();
        	image.onload = function() {
        		heartBlack = new Sprite(this, this.width, 1000);
        		heartBlack.scale = 0.5;
        	}
            image.onerror = function() {
                throw "Could not load " + this.src;
            }
            image.src = 'images/image_heart_black.png';
            
                        
            //gps
            image = new Image();
            image.onload = function() {
            	gps = new Sprite(this, this.width, 10);
			}
			image.onerror = function() { throw "could not load" + this.src; }
			image.src = 'images/gps-lock.png';
			
			//sweat points
			image = new Image();
			image.onload = function() {
				sweat = new Sprite(this, this.width, 1000);
			}
			image.onerror = function() { throw "could not load" + this.src; }
			image.src = 'images/image_sweat_point_green.png';
            
            //dead image
			image = new Image();
			image.onload = function() {
				deadImage = new Sprite(this, this.width, 1000);
			}
			image.onerror = function() { throw "could not load" + this.src; }
			image.src = 'images/image_skull.png';
                        
 			//dead player image
			image = new Image();
			image.onload = function() {
				deadRunnerImage = new Sprite(this, this.width, 1000);
			}
			image.onerror = function() { throw "could not load" + this.src; }
			image.src = 'images/image_skull.png';
			      
			//dino image
			image = new Image();
			image.onload = function() {
				dino = new Sprite(this, this.width, 1000);
			}
			image.onerror = function() { throw "could not load" + this.src; }
			image.src = 'images/image_dino_achievement_screen.png';
			
			//boulder image
			image = new Image();
			image.onload = function() {
				boulder = new Sprite(this, this.width, 1000);
				boulder.rotation = 0;
				boulder.rotationSpeed = 0.2;
			}
			image.onerror = function() { throw "could not load" + this.src; }
			image.src = 'images/image_boulder_achievement_screen.png';			
			
			//dino game image
			image = new Image();
			image.onload = function() {
				dinoGameImage = new Sprite(this, this.width, 1000);
			}
			image.onerror = function() { throw "could not load" + this.src; }
			image.src = 'images/image_dino_achievement_screen.png';
			
			//boulder game image
			image = new Image();
			image.onload = function() {
				boulderGameImage = new Sprite(this, this.width, 1000);
			}
			image.onerror = function() { throw "could not load" + this.src; }
			image.src = 'images/image_boulder_achievement_screen.png';	
			
			image = new Image();
			image.onload = function() {
				dottedPattern = context.createPattern(this, "repeat");
			}
//			image.onerror = function() {throw "could not load" + this.src; }
			image.src = 'images/dashedLine.png';
			
           /* if (hrm.isAvailable()) {
                hrm.start();
            } else {
                // TODO: Disable game?
            } */                       
            
            bindEvents();
        }

        e.listeners({
            'hrzgame.show': show,
            'hrzgame.attach': attachGame,
            'hrzgame.detach': detachGame
        });

        return {
            init: init
        };
    }

});
