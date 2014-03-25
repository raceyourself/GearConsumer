/*global define, $, console, window, history, document*/

/**
 * Main page module
 */

define({
    name: 'views/page/hrzones',
    requires: [
        'core/event',
        'models/sapRaceYourself',
        'models/sprite',
        'models/hrm'
    ],
    def: function viewsPageHeartRateZones(req) {
        'use strict';

        var e = req.core.event,
            Sprite = req.models.sprite.Sprite,
            page = null,
            changer,
            canvas,
            context,
            raf = false,
            heart = { red: null, green: null, black: null},
            hr = 50,
            zones = { 
            			speed: { name: 'speed', min: 160, max: 180 , zoneAbove:null},
            			fitness: { name: 'fitness', min: 140, max: 160 , zoneAbove:null},
            			weightLoss: { name: 'weight loss', min: 120, max: 140, zoneAbove:null},
            			recovery: { name: 'recovery', min: 0, max: 120, zoneAbove:null}
            		},
            currentZone = zones.fitness,            
			hrm = req.models.hrm,
			green = '#51b848',
            red = '#cb2027',
            amber = '#f7941d',
            hrWarningPhase = 0,
            hrWarningPeriod = 3*1000,
            lightRed = '#731216',
            white = '#fff',
            black = '#000',
            grey = '606060',            
            headerHeight = 39,
            segmentHeight = 62,
            dir = 1;

        function show() {
        }
        
        function onPageShow() {
            e.listen('hrm.change', onHeartRateChange);
			canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            //above assignment gives bad values. hard-coding screen dimensions
            canvas.width = 320;
            canvas.height = 320;
               
            zones.recovery.zoneAbove = zones.weightLoss;
            zones.weightLoss.zoneAbove = zones.fitness;
            zones.fitness.zoneAbove = zones.speed;
               
            animate();
        }

        function onPageHide() {
            e.die('hrm.change', onHeartRateChange);
        }
        
        function onBack() {
            history.back();
        }

        function bindEvents() {
            page.addEventListener('pageshow', onPageShow);
            page.addEventListener('pagehide', onPageHide);
        }
        
        function onHeartRateChange() {
        
        }
        
        function animate(time) {
            raf = requestAnimationFrame(animate);
            render();
        }
        
        function requestRender() {
            if (!raf) render();
        }

        
        function render() {
        	
			context.clearRect(0, 0, canvas.width, canvas.height);            

			//change hr
			hr += dir;
			if(hr > 200) { dir = -1; }
			if(hr < 50) { dir = 1; }

			//header
			var headerString;
			if(hr < currentZone.min || hr > currentZone.max)
			{
				context.fillStyle = red;
				headerString = 'get into your target zone';
			}
			else
			{
				context.fillStyle = grey;
				headerString = 'your heart rate zones';
			}
			context.fillRect(0,0, canvas.width, headerHeight);
			context.font = '24 Samsung Sans';
			context.textAlign = 'center';
			context.textBaseline = 'middle';
			context.fillStyle = white;
			context.fillText(headerString, canvas.width/2, headerHeight/2);
			
			var currentHeight = canvas.height - 3*segmentHeight;
			//segments
			context.strokeStyle = grey;
			context.lineWidth = 1;
			context.font = '56 Samsung Sans';
			context.textAlign = 'left';
			context.textBaseline = 'middle';
			var targetHRHeight = 0;
			
			for(var zone in zones)
			{
				//line at top
				context.beginPath();
				context.moveTo(0, currentHeight - segmentHeight);
				context.lineTo(canvas.width, currentHeight - segmentHeight);
				context.stroke();
				
				//fill & text for zone
				var colour = white; 
				if(hr >= zones[zone].min && hr < zones[zone].max)
				{
					var fillColour;
					//we are currently in this zone
					
					if( zones[zone] == currentZone )
					{
						//this is also the target zone.
						//green fill, white text
						fillColour = green;
						colour = white;
					}
					else
					{
						//this isn't the target zone
						//red fill, white text
						fillColour = red;
						colour = white;
					}
					context.fillStyle = fillColour;
					context.fillRect(0, currentHeight - segmentHeight, canvas.width, segmentHeight);
					
					//set hr position here
					var p = (hr - zones[zone].min)/(zones[zone].max - zones[zone].min);
					targetHRHeight = currentHeight - p*segmentHeight;
				}
				else
				{
					colour = grey;
					if( zones[zone] == currentZone )
					{
						colour = green;
						//TODO flash
					}
				}

				context.fillStyle = colour;
				context.textAlign = 'left';
				context.fillText(zones[zone].name, 10, currentHeight - segmentHeight/2);
			
				//black capsule
				var r = 12;
				var h = 6
				var w = 24
				context.beginPath()
//				context.moveTo(canvas.width/2 - w/2 - r, currentHeight - h/2);
//				context.lineTo(canvas.width/2 - w/2 - r, currentHeight + h/2);
				context.arc(canvas.width/2 - w/2, currentHeight - segmentHeight - h/2, r, Math.PI, 1.5*Math.PI, false);
				context.lineTo(canvas.width/2 + w/2, currentHeight - segmentHeight - h/2 - r);
				context.arc(canvas.width/2 + w/2, currentHeight - segmentHeight - h/2, r, 1.5 * Math.PI, 2*Math.PI, false);
				context.lineTo(canvas.width/2 + w/2 + r, currentHeight - segmentHeight + h/2);
				context.arc(canvas.width/2 + w/2, currentHeight - segmentHeight + h/2, r, 0, Math.PI/2, false);
				context.lineTo(canvas.width/2 - w/2, currentHeight - segmentHeight + h/2 + r);
				context.arc(canvas.width/2 - w/2, currentHeight - segmentHeight + h/2, r, Math.PI/2, Math.PI, false);
				context.closePath();
				context.fillStyle = black;
				context.fill();
				
				//number
				if(zones[zone] == currentZone || zones[zone].zoneAbove == currentZone)
				{
					context.fillStyle = green;
				}
				else
				{
					context.fillStyle = grey;
				}
				context.textAlign = 'center';
				context.font = '25px Samsung Sans';
				context.fillText(zones[zone].max, canvas.width/2, currentHeight - segmentHeight);
			
				currentHeight += segmentHeight;
			}

			//hr circle
        	renderHeartRateCircle(targetHRHeight);

        }
        
        function renderHeartRateCircle(height) {
        	
        	//pos
        	var heartRadius = 115/2;
        	var hrXPos = canvas.width - heartRadius - 10;
        	var hrYPos = height;
        	//clamp height
        	hrYPos = Math.min(canvas.height - heartRadius, hrYPos);
        	hrYPos = Math.max(headerHeight + heartRadius, hrYPos);
        	
        	
        	//circle
        	context.beginPath();
        	context.arc( hrXPos, hrYPos, heartRadius, 0, Math.PI*2, false);
        	context.fillStyle = '#fff';
        	context.fill();        
        	
        	//icon
        	//pick appropriate icon
        	var heartIcon = heart.green;
        	if(hr < currentZone.min || hr > currentZone.max)
        	{
        		heartIcon = heart.red;
        	}
        	
        	//draw icon
        	var heartScale = 1.0;
        	heartIcon.drawscaled(context, hrXPos - heartScale*heartIcon.width/2, hrYPos - heartScale*heartIcon.height/2 - 32, 0, heartScale);
        	
        	//text
			context.font = '56px Samsung Sans';
			context.textAlign = 'center';
			context.textBaseline = "middle";
			context.fillStyle = '#000';
			var hrText = '' + hr;
			if(false) { hrText = '--'; }
			context.fillText(hrText, hrXPos, hrYPos + 8);
			//bpm
			context.font = '24px Samsung Sans';
			context.fillText('bpm', hrXPos, hrYPos + 38);
        }
        
        e.listeners({
			'statsleft.show': show
        });
        
        return {
            init: init
        };

        function init() {
            page = document.getElementById('race-game');
            changer = document.getElementById("race-game-sectionchanger");
            canvas = document.getElementById('hr-canvas');
            context = canvas.getContext('2d');
            
            //load images
            var image = new Image();
			image.onload = function() {
				heart.green = new Sprite(this, this.width, 1000);
			}
			image.onerror = function() {throw "could not load" + this.src; }
			image.src = 'images/image_heart_green.png';
			
			var image = new Image();
			image.onload = function() {
				heart.red = new Sprite(this, this.width, 1000);
			}
			image.onerror = function() {throw "could not load" + this.src; }
			image.src = 'images/image_heart_red.png';

			var image = new Image();			
			image.onload = function() {
				heart.black = new Sprite(this, this.width, 1000);
			}
			image.onerror = function() {throw "could not load" + this.src; }
			image.src = 'images/image_heart_black.png';
			
            bindEvents();
        }
        
    }

});
