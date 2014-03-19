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
        'models/race',
        'models/hrm',
        'models/sprite',
        //'views/page/gameselect'
    ],
    def: function viewsPageHeartRateZombiesGame(req) {
        'use strict';

        var e = req.core.event,
            race = req.models.race,
            hrm = req.models.hrm,
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
            heart = null,
            runnerAnimations = {
                    idle: { name: 'idle', sprite: null, speedThreshold: 0},
                    running: { name: 'running', sprite: null, speedThreshold: 0.1},
                    sprinting: { name: 'sprinting', sprite: null, speedThreshold: 4}
            },
            zombies = [],
            zombiesAnimOffset = [],
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
            hrInterval = 5000,
            hrColour = '#fff',
            zombieCatchupSpeed = 0.05,
            zombieOffset = -25,
            screenWidthDistance = 25,	//'real-world' distance covered by the screen's width
            screenLeftDistance = zombieOffset;		//'real-world' position of left of screen
            
            

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
                e.listen('pedometer.step', step);
                e.listen('hrm.change', onHeartRateChange);
                startCountdown();
            }
            
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;        
            
            frames = 0;
            fpsInterval = setInterval(function() {
                fps = frames;
                frames = 0;
            }, 1000);
            
            animate();
            
            requestRender();
            
            updateMinMaxHR();
            hrInterval = setInterval(randomHR, hrInterval);
        }
        
        function onPageHide() {
            visible = false;
            clearInterval(fpsInterval);
            clearInterval(randomHR);
            sectionChanger.destroy();
            e.die('tizen.back', onBack);
        }        
        
        function onBack() {
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
            e.fire('newmain.show');
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
        }
        
        function updateMinMaxHR()
        {
        //eventually look up based on age, but for now just used valued based on 30yo
            var r = race.getOngoingRace();
        	var hrMinMax = new Object();
        	switch(r.goal)
        	{
        	case "WeightLoss":
	        	hrMinMax.min20 = 120;
	        	hrMinMax.max20 = 140;
	        	hrMinMax.min75 = 90;
	        	hrMinMax.max75 = 110;
	        	break;
			case "Endurance":
        		hrMinMax.min20 = 140;
        		hrMinMax.max20 = 160;
        		hrMinMax.min75 = 110;
        		hrMinMax.max75 = 120;
        		break;
        	case "Strength":
        		hrMinMax.min20 = 160;
        		hrMinMax.max20 = 180;
        		hrMinMax.min75 = 120;
        		hrMinMax.max75 = 135;
        		break;
			default:
        		hrMinMax.min20 = 140;
        		hrMinMax.max20 = 160;
        		hrMinMax.min75 = 110;
        		hrMinMax.max75 = 120;
			}
			var age = 30;		//TODO get from profile
			//clamp to range 20-75
			age = Math.min( age, 75);
			age = Math.max( age, 20);
			var p = (75 - age)/(75-20)
			maxHeartRate = hrMinMax.max20 - p * (hrMinMax.max20 - hrMinMax.max75);
			minHeartRate = hrMinMax.min20 - p * (hrMinMax.min20 - hrMinMax.min75);
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
            bannerTimeout = setTimeout(startCountdown, 1500);
        }
        
        function startZombies() {
            clearInterval(zombieInterval);
            var animDelay = Math.random() * 0.2;
            while (zombies.length < wave) {
                zombies.push(zombies[0].clone());
                zombiesAnimOffset.push(animDelay);
            };
            for (var i=0;i<zombies.length;i++) zombies[i].reset();
            zombieDistance = zombieOffset;
//            int intervalTime = Math.min(350, 750-(wave*50));
			var intervalTime = 33;
            zombieInterval = setInterval(zombieTick, intervalTime);
        }
        
        function zombieTick() {
        	if(hr < minHeartRate)
        	{
            	zombieOffset += zombieCatchupSpeed;
        	}
        	var r = race.getOngoingRace();
        	zombieDistance = r.getDistance() + zombieOffset;
            requestRender();
            step();
            
            //general update of track window
            screenWidthDistance = Math.max( 10, Math.min( -zombieOffset, 100));
            screenLeftDistance = (zombieDistance + r.getDistance() - screenWidthDistance)/2;
            
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
        }
        
        function step() {
            var r = race.getOngoingRace();
            if (r.getDistance() < zombieDistance) {
                zombieGrowl.play();
                navigator.vibrate([1000, 500, 250, 100]);
                r.stop();
                lastRender = null;
                stopZombies();
                r = race.newRace();
                
                banner = 'R.I.P.';
                requestRender();
                clearTimeout(bannerTimeout);
                bannerTimeout = setTimeout(nextWave, 1500);
                return;
            }
            if (r.getDistance() >= TRACK_LENGTH) {
                zombieMoan.play();
                navigator.vibrate(1000);
                r.stop();
                lastRender = null;
                stopZombies();
                r = race.newRace();
                
                banner = 'You won!';
                requestRender();
                clearTimeout(bannerTimeout);
                bannerTimeout = setTimeout(nextWave, 1500);
                return;
            }
            
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
            
            requestRender();
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
            if (lastRender !== null) {
                dt = Date.now() - lastRender;
                lastRender = Date.now();
            }
            
            context.clearRect(0, 0, canvas.width, canvas.height);            
            var trackWidth = canvas.width - 0 - runner.sprite.width;
            var r = race.getOngoingRace();

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
                
                if (true) {
                    context.font = '45px Samsung Sans';
                    context.fillStyle = '#5f9a4a';
                    context.textBaseline = "top";
                    context.textAlign = "center";
                    context.fillText('+'+delta+'m', 0+columnCenter, 25);
                    context.font = '25px Samsung Sans';
                    //context.fillText(postfix, 0+columnCenter, 25+45);
                }
                if (true) {
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
            
            // Track
            context.beginPath();
            context.moveTo(15, canvas.height - 25);
            context.lineTo(canvas.width - 15, canvas.height - 25);
            context.lineWidth = 3;
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
			var distMarkerSpacing = 10;
			var distMarkerIndex = Math.floor(screenLeftDistance/distMarkerSpacing);
			distMarkerIndex = Math.max(distMarkerIndex, 0);
			while (distMarkerIndex * distMarkerSpacing <= (screenLeftDistance + 2*screenWidthDistance) )
			{
				var dist = distMarkerIndex * distMarkerSpacing
				if(dist == 0)
				{
					context.fillText('START', distanceToTrackPos(0), canvas.height-25);
				}
				else
				{
					context.fillText('' + dist, distanceToTrackPos(dist), canvas.height-25);
				}
				
				distMarkerIndex++;
			}
			
            
            var scale = 10/screenWidthDistance;
            
            // Zombies
            if (zombieDistance !== false) {
                for (var i=0;i<zombies.length;i++) {
                    var zombie = zombies[i];
                    var x_offset = (i*(zombie.width/2))+(i%2)*10;
                    var y_offset = (-1+(i+1)%2) * 5;
                    if (i%2==1) context.globalAlpha = 0.5;
                    else context.globalAlpha = 1;
                    var zombiePos = 0 + distanceToTrackPos(zombieDistance) - x_offset;
//                    zombiePos -= screenLeftDistance;
		    var localDT = dt * (0.9 + zombiesAnimOffset[i]);

                    zombie.drawscaled(context, zombiePos, canvas.height - zombie.height * scale - 30 + y_offset, localDT, scale);
//                    console.log('screenwidth:' + screenWidthDistance);
//                    console.log('scale:' + scale);
                }
                context.globalAlpha = 1;
            }
            
            // Self
            runner.sprite.drawscaled(context, 0 + distanceToTrackPos(r.getDistance()), canvas.height - runner.sprite.height * scale - 30, dt, scale);
            
            /// DEBUG
            // fps
            context.font = '20px Samsung Sans';
            context.fillStyle = '#fff';
            context.textBaseline = "top";
            context.textAlign = "center";
            context.fillText('fps: '+fps, canvas.width/2, 0);
            
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
                runner = runnerAnimations.idle;
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
        		heart = new Sprite(this, this.width, 1000);
        		heart.scale = 0.5;
        	}
            image.onerror = function() {
                throw "Could not load " + this.src;
            }
            image.src = 'images/heartratemonitor.png';
                    	
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
