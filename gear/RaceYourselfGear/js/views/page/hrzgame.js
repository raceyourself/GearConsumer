/*global define, $, console, window, history, document*/

/**
 * Main page module
 */

define({
    name: 'views/page/hrzgame',
    requires: [
        'core/event',
        'views/page/statsleft',
        'views/page/statsright',
//        'views/page/gameselect',
        'models/race',
        'models/hrm',
        'models/sprite',
        'models/settings',
        //'views/page/main',

    ],
    def: function viewsPageHeartRateZombiesGame(req) {
        'use strict';

        var e = req.core.event,
            race = req.models.race,
            hrm = req.models.hrm,
            settings = req.models.settings,
            Sprite = req.models.sprite.Sprite,
            page = null,
            canvas,
            context,
            TRACK_LENGTH = 500,
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
            gps = null,
            sweat = null,
            runnerAnimations = {
                    idle: { name: 'idle', sprite: null, speedThreshold: 0},
                    running: { name: 'running', sprite: null, speedThreshold: 0.1},
                    sprinting: { name: 'sprinting', sprite: null, speedThreshold: 4}
            },
            zombies = [],
            zombiesAnimOffset = [],
            numZombies = 0,
            zombieDistance = false,
            zombieInterval = false,
            zombieSpeed = 0,
            zombieMoan = null,
            zombieGrowl = null,
            visible = false,
            changer,
            sectionChanger,
            fpsInterval = false,
            frames = 0,
            fps = 0,
            hr = 100,
            maxHeartRate = 150,
            minHeartRate = 120,
            hrInterval = false,
            hrChangePeriod = 5000,
            hrColour = '#fff',
            zombieCatchupSpeed = 0.05,
            zombieStartOffset = -25,
            zombieOffset = zombieStartOffset,
            screenWidthDistance = 25,	//'real-world' distance covered by the screen's width
            screenLeftDistance = zombieOffset,		//'real-world' position of left of screen
			hrZones = [],
			currentHRZone = "Recovery",
			currentZone = 0,
			warmupTimeout = false,
			timeMultiplier = 0.01,			//hack to test quickly. Set to 1
			intervalTimeout = false,
			zoneAdaptTimeout = false,
			warningTimeout = false,
			zombiesCatchingUp = false,
			adaptingToRecentZoneShift = false,
			adaptingTimeout = false,
			showWarning = false;
			

            

        function show() {
            gear.ui.changePage('#race-game');
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
                r.data.hr_zones = true;
                e.listen('pedometer.step', step);
                e.listen('hrm.change', onHeartRateChange);
                startCountdown();
            }
            
			TRACK_LENGTH = settings.getDistance();
            
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
        }        
        
        function onBack() {
            e.fire('gameselect.show');
        }
        
        function startCountdown() {
            countingdown = true;
            clearTimeout(bannerTimeout);
            bannerTimeout = setTimeout(ready, 1000);
        }
        
        function ready() {
            banner = 'Ready';
            requestRender();
            clearTimeout(bannerTimeout);
            bannerTimeout = setTimeout(set, 1000);
        }
        function set() {
            banner = 'Set';
            requestRender();
            clearTimeout(bannerTimeout);
            bannerTimeout = setTimeout(go, 1000);
        }
        function go() {
            race.getOngoingRace().start();
            startZombies();
            lastRender = Date.now();
            banner = 'Go!';
            requestRender();
            countingdown = false;
            clearTimeout(bannerTimeout);
            bannerTimeout = setTimeout(clearbanner, 1000);
            setCurrentHRZone("Light");
            warmupTimeout = setTimeout(endWarmup, 5*60*1000 * timeMultiplier);	//5 minutes warmup
        }
        
        function endWarmup() 
        {
        	var r = race.getOngoingRace();
        	        	console.log("Warmup over. Goal is: " + r.getGoal());

        	switch(r.getGoal())
        	{
        	
        		case "WeightLosss":
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
            countingdown = true;
            wave++;
            zombieCatchupSpeed += 0.01;
            banner = 'Wave ' + wave;
            zombieOffset = -25;
            requestRender();
            clearTimeout(bannerTimeout);
            bannerTimeout = setTimeout(go, 1500);
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
        
        function zombieTick() {
        	if(zombiesCatchingUp)
        	{
            	zombieOffset += zombieCatchupSpeed;
        	}
        	var r = race.getOngoingRace();
        	zombieDistance = r.getDistance() + zombieOffset;
            requestRender();
            step();
            
            //general update of track window
            screenWidthDistance = Math.max( 10, Math.min( -zombieOffset + 15, 100));
            screenLeftDistance = (zombieDistance + r.getDistance() - screenWidthDistance)/2;
            
			//see if we've finished the current interval
			
        }

        
        function stopZombies() {
            clearInterval(zombieInterval);
            zombieDistance = false;            
        }
        
        
        function onHeartRateChange(hrmInfo) {
        	//set heartRate
        	handleHRChanged();
        }

		function setMinMaxHeartRate() {
			//to be eventually based on age and user-defined goals. Just use values for 30yo aerobic exercise for now.
		}
        
        //test function to provide random heart rate
        function randomHR() {
        	hr = Math.floor( 50 + 150 * (Math.random()) );
        	handleHRChanged();
        }
        
        function handleHRChanged() {
			if(hr > maxHeartRate)
			{
				hrColour = '#ff0000';
			}
			else if (hr > minHeartRate)
			{
				hrColour = '#fff';
			}
			else
			{
				hrColour = '#5555ff';
			}

			var r = race.getOngoingRace();
			if (!!r) {
			    if (hr > maxHeartRate || hr < minHeartRate) r.data.zoned_out = true;
			}

						
			//instigate warning
			if(hr < minHeartRate)
		
			{	
				if(!showWarning)
				{
					showWarning = true;
					zombieGrowl.play();
					navigator.vibrate([1000, 500, 250, 100]);
				}
				if(!adaptingToRecentZoneShift)
				{
					if(warningTimeout == false)
					{
						warningTimeout = setTimeout(warningOver, 10*1000 * timeMultiplier);
					}
				}
			}
			else
			{
				//clear warning
				showWarning = false;
				clearTimeout(warningTimeout);
				warningTimeout = false;
				//stop zombies catching up
				zombiesCatchingUp = false;
			}
			
							
			
        }
        
        function warningOver() 
        {
        	console.log("Warning up! Zombies catching up");
        	zombiesCatchingUp = true;
        	showWarning = false;
        }
        
        function step() {
            var r = race.getOngoingRace();
            if (r.getDistance() < zombieDistance) {
                r.data.caught_by = 'zombie';
                zombieGrowl.play();
                navigator.vibrate([1000, 500, 250, 100]);
//                r.stop();
                e.fire('race.end', r);
                lastRender = null;
                stopZombies();
                r.data.hr_zones = true;
                banner = 'R.I.P.';
                requestRender();
                clearTimeout(bannerTimeout);
                bannerTimeout = setTimeout(nextWave, 500);
                return;
            }
            if (r.getDistance() >= TRACK_LENGTH) {
                zombieMoan.play();
                navigator.vibrate(1000);
                e.fire('race.end', r);
                r.stop();
                lastRender = null;
                stopZombies();
                r.data.hr_zones = true;
                
                banner = 'Complete!';
                requestRender();
                clearTimeout(bannerTimeout);
				bannerTimeout = setTimeout(continueToResults, 2000);
				
                

                return;
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
		    e.fire('main.show');

		}

        function animate(time) {
            raf = requestAnimationFrame(animate);
            render();
        }
        
        function requestRender() {
            if (!raf) render();
        }
        
        function render() {
            if (!visible) return;
            var dt = 0;
            var trackHeight = 50;
            var green = '#51b848';
            var red = '#cb2027';
            
            if (lastRender !== null) {
                dt = Date.now() - lastRender;
                lastRender = Date.now();
            }
            
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
				context.fillText(settings.getPoints(), xpos + sweat.width + 5 + 30, ypos + sweat.height/2);
			}

			
			//GPS
			if(true)
			{
				var scale = sweat.height / gps.height;
				gps.drawscaled(context, canvas.width - gps.width*scale, 0, 0, scale);
			}
			


            // Banner
            if (banner !== false) {
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
            
            // Heart Rate
			var heartIcon = null;
			var hrFillColour = green;

            if(hr > maxHeartRate) 
            {
             	heartIcon = heartBlack; 
				hrFillColour = red;             	
            }
            else if(hr < minHeartRate) 
            {
            	heartIcon = heartRed; 
            	hrFillColour = red;
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
            console.log('fill proportion: ' + fillProportion);
            //height in pixels above centre line
            var h = fillProportion * 2 * radius - radius
            console.log('h: ' + h);
            var angle = Math.asin(h/radius);
            context.beginPath();
            context.arc(hrXPos, hrYPos, radius, -angle, Math.PI + angle, false);
            context.fillStyle = hrFillColour;
            context.fill();
            


            //icon

            heartIcon.draw(context, hrXPos-heartIcon.width/2, hrYPos-heartIcon.height/2 - 30, 0);
            //number
            context.font = '56px Samsung Sans';
            context.textAlign = 'center';
            context.textBaseline = "middle";
			context.fillStyle = '#000';
            context.fillText(hr, hrXPos, hrYPos + 10);
            //bpm
            context.font = '18px Samsung Sans';
            context.fillText('bpm', hrXPos, hrYPos + 38);
            
            
            //Ahead/Behind
            var distXPos = 30 + radius;
            var distYPos = 37 + radius;
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
			
            
            var scale = 10/screenWidthDistance;
            
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

                    zombie.drawscaled(context, zombiePos, canvas.height - zombie.height * scale - trackHeight - 5*scale + y_offset, localDT, scale);
//                    console.log('screenwidth:' + screenWidthDistance);
//                    console.log('scale:' + scale);
                }
                context.globalAlpha = 1;
            }
            
            // Self
            runner.sprite.drawscaled(context, 0 + distanceToTrackPos(r.getDistance()), canvas.height - runner.sprite.height * scale - trackHeight - 5*scale, dt, scale);
            
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
