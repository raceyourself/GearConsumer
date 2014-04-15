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
    name: 'views/page/hrzones',
    requires: [
        'core/event',
        'models/sapRaceYourself',
        'models/sprite',
        'models/hrm',
        'models/settings',
        'models/game'
    ],
    def: function viewsPageHeartRateZones(req) {
        'use strict';

        var e = req.core.event,
            Sprite = req.models.sprite.Sprite,
            settings = req.models.settings,
            game = req.models.game,
            page = null,
            changer,
            canvas,
            context,
            raf = false,
//            heart = { red: null, green: null, black: null},
            hr = 50,
            rToRTime = 1,
            zones = { 
            			speed: { name: 'speed', min: 160, max: 180 , zoneAbove:null},
            			fitness: { name: 'fitness', min: 140, max: 160 , zoneAbove:null},
            			weightLoss: { name: 'weight loss', min: 120, max: 140, zoneAbove:null},
            			recovery: { name: 'recovery', min: 0, max: 120, zoneAbove:null}
            		},
            currentZone = zones.recovery,            
			hrm = req.models.hrm,
			green = '#51b848',
            red = '#cb2027',
            amber = '#f7941d',
            hrWarningPhase = 0,
            hrWarningPeriod = 3*1000,
            lightRed = '#731216',
            white = '#fff',
            black = '#000',
            grey = 'b2b2b2',            
            greyBG = '1e1e1e',
            darkGreen = '0C190C',
            headerHeight = 50,
            segmentHeight = 62,
            dir = 1,
            heartBeatOnFrames = 0,
            heartBeatOn = false,
            heartRateNotFound = false,
            textRotation = { phase: 0, period: 2 , lastUpdateTime: 0},
            hrDrift = { target: 50, current: 50 },
			infoOnly = false,
			
			currentDisplayType = null,
			displayTypeHR = {
				register : function() {
						e.listen('hrm.change', onHeartRateChange);
						e.listen('heart.beat', onHeartBeat);
						e.listen('heartrate.lost', onHeartRateLost);
						e.listen('hrzone.change', onZoneChange);
					},	
				unregister : function() {
						e.die('hrm.change', onHeartRateChange);
						e.die('heart.beat', onHeartBeat);
						e.die('heartrate.lost', onHeartRateLost);
						e.die('hrzone.change', onZoneChange);
					},
				units : 'bpm',
				goodSprite : null,
				badSprite : null,
				notFoundSprite : null,
				headingString: 'Heart rate zones',
				notFoundString: 'Heart rate not found'
								
			},
			displayTypeCadence = {
				register : function () {
						e.listen('cadence.change', onCadenceChange);
						e.listen('cadence.found', onCadenceFound);
						e.listen('cadence.lost', onCadenceLost);				
						e.listen('cadencezone.change', onZoneChange);
					},
				unregister : function () {
						e.die('cadence.change', onCadenceChange);
						e.die('cadence.found', onCadenceFound);
						e.die('cadence.lost', onCadenceLost);
						e.die('cadencezone.change', onZoneChange);
					},
				units : 'rpm',
				goodSprite : null,
				badSprite : null,
				notFoundSprite : null,
				headingString : 'Cadence zones',
				notFoundString : 'No cadence data'
			};

        function show() {
        }
        
        function onPageShow() {
        
        	//decide if we are hr or cadence
        	switch( settings.getGameType() )
        	{
        		case 'hr':
        			currentDisplayType = displayTypeHR;
					initHRZones();
        			break;
        		case 'cadence':
        			currentDisplayType = displayTypeCadence;
        			initCadenceZones();
        			break;
        		default:
        			currentDisaplayType = displayTypeHR;
        			console.error('unknown game type. Using hr');
        			break;
        	}
        
        	currentDisplayType.register();
        
			canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            //above assignment gives bad values. hard-coding screen dimensions
            canvas.width = 320;
            canvas.height = 320;
               
            zones.recovery.zoneAbove = zones.weightLoss;
            zones.weightLoss.zoneAbove = zones.fitness;
            zones.fitness.zoneAbove = zones.speed;
		   	
            animate();
            
            textRotation.lastUpdateTime = Date.now();
            
            var currentGame = game.getCurrentGame();
            if(currentGame == 'racegame')
            {
            	infoOnly = true;
            }
            else
            {
            	infoOnly = false;
            }
        }

		function onHeartBeat() {
			heartBeatOn = true;
			heartBeatOnFrames = false;
			heartRateNotFound = false;
		}

		function onHeartRateLost() {
			heartRateNotFound = true;
			hrDrift.target = false;
		}
		
		function onCadenceLost() {
			heartRateNotFound = true;
			hrDrift.target = false;
		}
		
		function onCadenceFound() {
			heartRateNotFound = false;
			hrDrift.target = 0;
		}
		
		function initCadenceZones() {
		
			var min, max;
			for(var zone in zones)
			{
				switch(zone)
				{
				case "recovery":
					min = 0;
					max = 30;
					break;
				case "weightLoss":
					min = 30;
					max = 60;
					break;
				case "fitness":
					min = 60;
					max = 100;
					break;
				case "speed":
					min = 100;
					max = 130;
					break;
				case "performance":
					min = 130;
					max = 160;
					break;
				default:
					console.log("Unknown cadence zone");
					min = 60;
					max = 100;
				}

				zones[zone].max = max;
				zones[zone].min = min;
			}
		}
	
		function initHRZones() {
				
			var min20, max20, min75, max75;
			for(var zone in zones)
			{
				switch(zone)
				{
				case "recovery":
					min20 = 0;
					max20 = 120;
					min75 = 0;
					max75 = 90;
					break;
				case "weightLoss":
					min20 = 120;
					max20 = 140;
					min75 = 90;
					max75 = 110;
					break;
				case "fitness":
					min20 = 140;
					max20 = 160;
					min75 = 110;
					max75 = 120;
					break;
				case "speed":
					min20 = 160;
					max20 = 180;
					min75 = 120;
					max75 = 135;
					break;
				case "performance":
					min20 = 180;
					max20 = 200;
					min75 = 135;
					max75 = 150;
					break;
				default:
					console.log("Unknown heart rate zone");
					min20 = 140;
					max20 = 160;
					min75 = 110;
					max75 = 120;
				}
				var age = settings.getAgeRange();
				//clamp to range 20-75
				age = Math.min( age, 75);
				age = Math.max( age, 20);
				var p = 1-(75 - age)/(75-20);
				zones[zone].max = Math.floor(max20 - p * (max20 - max75));
				zones[zone].min = Math.floor(min20 - p * (min20 - min75));
			}
		}
	
        function onPageHide() {
			currentDisplayType.unregister();
        }
        
        function onBack() {
            history.back();
        }

        function bindEvents() {
            page.addEventListener('pageshow', onPageShow);
            page.addEventListener('pagehide', onPageHide);
        }
        
        function onHeartRateChange(hrmInfo) {
        	//ignore non-sensible values
        	if(hrmInfo.detail.heartRate > 30)
        	{
				hr = Math.floor(hrmInfo.detail.heartRate);
				rToRTime = hrmInfo.detail.rInterval;
				hrDrift.target = hr;
			}
        }
        
        function onCadenceChange(cadenceInfo) {
        	if(cadenceInfo.detail.cadence >= 0)
        	{
        		hr = Math.floor(cadenceInfo.detail.cadence);
        		hrDrift.target = hr;
        	}
        }
        
		function onZoneChange(zoneInfo) {
			switch(zoneInfo.detail.name)
			{
				case 'Recovery':
					currentZone = zones.recovery;
					break;
				case 'Light':
					currentZone = zones.weightLoss;
					break;
				case 'Aerobic':
					currentZone = zones.fitness;
					break;
				case 'Anaerobic':
				case 'Performance':
					currentZone = zones.speed;
					break;
				default:
					console.error('Unrecognised hr zone: ' + zoneInfo.detail.name);
					break;	
			}
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
//			hr += dir;
//			if(hr > 200) { dir = -1; }
//			if(hr < 50) { dir = 1; }

			if(hrDrift.current > hrDrift.target) 
			{
				//slow down on approach
				if(hrDrift.current - hrDrift.target < 5) { hrDrift.current -= 0.5; }
			 	else { hrDrift.current--; }
			 }
			if(hrDrift.current < hrDrift.target) 
			{ 
				if(hrDrift.target - hrDrift.current <5) { hrDrift.current += 0.5; }
				else { hrDrift.current++; }
				
			}

			//header
			var headerString;
			var headerStyle;
			var headerBGStyle;
			if(heartRateNotFound)
			{
				headerBGStyle = red;
				headerStyle = white;
				headerString = currentDisplayType.notFoundString;
			}
			else if(hr < currentZone.min || hr > currentZone.max && !infoOnly)
			{
				headerBGStyle = red;
				headerStyle = white;
				headerString = 'Get into your target zone';
			}
			else
			{
				headerBGStyle = greyBG;
				headerStyle = grey;
				headerString = currentDisplayType.headingString;
			}
			context.fillStyle = headerBGStyle;
			context.fillRect(0,0, canvas.width, headerHeight);
			context.font = '32 Samsung Sans';
			context.textAlign = 'center';
			context.textBaseline = 'middle';
			context.fillStyle = headerStyle;
			context.fillText(headerString, canvas.width/2, headerHeight/2);
			
			var currentHeight = canvas.height - 3*segmentHeight;
			
			/// Zones
			
			var hrdt = (Date.now() - textRotation.lastUpdateTime) / 1000;
			textRotation.lastUpdateTime = Date.now();
			textRotation.phase += hrdt;
			textRotation.phase = textRotation.phase % textRotation.period;
			var textPhaseProportion = textRotation.phase/textRotation.period;
			
			//red block at top if needed			
			if(hrDrift.current > zones.speed.max && !infoOnly)
			{
				var boxHeight = canvas.height -4*segmentHeight - headerHeight;
				context.fillStyle = red;
				context.fillRect(0, headerHeight, canvas.width, boxHeight);
				context.strokeStyle = grey;
				context.beginPath();
				context.moveTo(0, headerHeight);
				context.lineTo(canvas.width, headerHeight);
				context.stroke();
			}
			
			//segments
			context.strokeStyle = grey;
			context.lineWidth = 1;
			context.font = '56 Samsung Sans';
			context.textAlign = 'left';
			context.textBaseline = 'middle';
			var targetHRHeight = 0;
			var isInTargetZone = false;
			var isInThisZone = false;
			
			for(var zone in zones)
			{
				isInTargetZone = false;
				isInThisZone = false;			
				
				var bold = false;
				
				//line at top
				context.beginPath();
				context.moveTo(0, currentHeight - segmentHeight);
				context.lineTo(canvas.width, currentHeight - segmentHeight);
				context.stroke();
				
				//fill & text for zone
				var colour = white; 
				var highlightThisZone = hrDrift.current >= zones[zone].min && hrDrift.current < zones[zone].max && !heartRateNotFound;
//				highlightThisZone = highlightThisZone || infoOnly
				if(highlightThisZone)
				{
					var fillColour;
					//we are currently in this zone
					isInThisZone = true;
					
					if( zones[zone] == currentZone || infoOnly)
					{
						//this is also the target zone.
						//green fill, white text
						fillColour = green;
						colour = white;
						isInTargetZone = true;
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
					
				}
				else
				{
					//colour in the target zone with a dull green if we're not in it
					if(zones[zone] == currentZone)
					{
						context.fillStyle = darkGreen;
						context.fillRect(0, currentHeight - segmentHeight, canvas.width, segmentHeight);
					}
					colour = grey;
					if( zones[zone] == currentZone && !infoOnly)
					{
						colour = green;
						bold = true;
						//TODO flash
					}
				}
				if(hrDrift.current >= zones[zone].min && hrDrift.current < zones[zone].max && !heartRateNotFound)
				{
					//set hr position here
					var p = (hrDrift.current - zones[zone].min)/(zones[zone].max - zones[zone].min);
					targetHRHeight = currentHeight - p*segmentHeight;
				}


				//text inside box
				context.fillStyle = colour;
				context.textAlign = 'left';
				var boxString = '';
				if(zones[zone] == currentZone)
				{
					boxString = zones[zone].name;
				}
				if(infoOnly)
				{
					boxString = zones[zone].name;
//					context.fillStyle = white;
				}
				if(!isInTargetZone && isInThisZone)
				{
//					if(textPhaseProportion > 0.5)
					if(!infoOnly)
					{
						//show encouragement/guidance string
						if(hrDrift.current > currentZone.max)
						{
							boxString = 'too high';
						}
						if(hrDrift.current < currentZone.min)
						{
							boxString = 'too low';
						}
					}					
				}
				context.font = bold? 'bold 24px Samsung Sans': '24px Samsung Sans';
				context.fillText(boxString, 10, currentHeight - segmentHeight/2);
			
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
					context.fillStyle = white;
				}
				if(infoOnly) { context.fillStyle = grey; }
				context.textAlign = 'center';
				context.font = 'bold 25px Samsung Sans';
				context.fillText(zones[zone].max, canvas.width/2, currentHeight - segmentHeight);
			
				currentHeight += segmentHeight;
			}


			//hr circle
        	renderHeartRateCircle(targetHRHeight);

        }
        
        function renderHeartRateCircle(height) {
        	
        	//set heart larger on a beat
        	var heartScale = 1;
        	if(heartBeatOn)
        	{
        		heartScale = 1.2;
        		heartBeatOnFrames++;
        		if(heartBeatOnFrames>=3)
        		{
        			heartBeatOn = false;
        			heartBeatOnFrames = 0;
				}
			}
        	
        	
        	//pos
        	var heartRadius = 115/2;
        	var hrXPos = canvas.width - heartRadius - 10;
        	var hrYPos = height;
        	//clamp height
        	hrYPos = Math.min(canvas.height - heartRadius, hrYPos);
        	hrYPos = Math.max(headerHeight + heartRadius, hrYPos);
        	
        	if(heartRateNotFound) { hrYPos = canvas.height/2; }
        	        	
        	//circle
        	context.beginPath();
        	context.arc( hrXPos, hrYPos, heartRadius, 0, Math.PI*2, false);
        	context.fillStyle = '#fff';
        	context.fill();        
        	
        	//icon
        	//pick appropriate icon
        	var heartIcon = currentDisplayType.goodSprite;
        	if(hrDrift.current < currentZone.min || hrDrift.current > currentZone.max)
        	{
        		heartIcon = currentDisplayType.badSprite;
        	}
        	
        	if(infoOnly) { heartIcon = currentDisplayType.notFoundSprite; }
        	
        	if(heartRateNotFound)
        	{
        		heartIcon = currentDisplayType.notFoundSprite;
        		heartScale = 0.9;
			}
        	
        	//draw icon
        	if(heartIcon != null)
        	{
				heartIcon.drawscaled(context, hrXPos - heartScale*heartIcon.width/2, hrYPos - heartScale*heartIcon.height/2 - 32, 0, heartScale);
        	}
        	
        	//text
			context.font = '56px Samsung Sans';
			context.textAlign = 'center';
			context.textBaseline = "middle";
			context.fillStyle = '#000';
			var hrText = '' + hr;
			if(heartRateNotFound) { hrText = '--'; }
			context.fillText(hrText, hrXPos, hrYPos + 8);
			//bpm
			context.font = '24px Samsung Sans';
			context.fillText(currentDisplayType.units, hrXPos, hrYPos + 38);
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
            
            //load images - hr
            var image = new Image();
			image.onload = function() {
				displayTypeHR.goodSprite = new Sprite(this, this.width, 1000);
			}
			image.onerror = function() {throw "could not load" + this.src; }
			image.src = 'images/image_heart_green.png';
			
			image = new Image();
			image.onload = function() {
				displayTypeHR.badSprite = new Sprite(this, this.width, 1000);
			}
			image.onerror = function() {throw "could not load" + this.src; }
			image.src = 'images/image_heart_red.png';

			image = new Image();			
			image.onload = function() {
				displayTypeHR.notFoundSprite = new Sprite(this, this.width, 1000);
			}
			image.onerror = function() {throw "could not load" + this.src; }
			image.src = 'images/image_heart_black.png';
			
			// cadence
			image = new Image();
			image.onload = function() {
				displayTypeCadence.goodSprite = new Sprite(this, this.width, 1000);
			}
			image.onerror = function() {throw "could not load" + this.src;}
			image.src = 'images/icon_cadence_green.png';
			
			image = new Image();
			image.onload = function() {
				displayTypeCadence.badSprite = new Sprite(this, this.width, 1000);
			}
			image.onerror = function() {throw "could not load" + this.src; }
			image.src = 'images/icon_cadence_red.png';
			
			image = new Image();
			image.onload = function() {
				displayTypeCadence.notFoundSprite = new Sprite(this, this.width, 1000);
			}
			image.onerror = function() { throw "could not load" + this.src; }
			image.src = 'images/icon_cadence_black.png';
			
            bindEvents();
        }
        
    }

});
