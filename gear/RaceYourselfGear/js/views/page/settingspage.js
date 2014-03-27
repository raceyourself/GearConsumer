/*global define, $, console, window, history, document*/

/**
 * Main page module
 */

define({
    name: 'views/page/settingspage',
    requires: [
        'core/event',
        'models/application',
        'models/race',
        'models/settings',
        'views/page/ageselect',
        'views/page/audioactive',
        'views/page/distanceunits',
        'views/page/paceunits',
        'views/page/about',
        'views/page/vibratesetting'
    ],
    def: function viewsPageSettingsPage(req) {
        'use strict';

        var e = req.core.event,
            app = req.models.application,
            race = req.models.race,
            settings = req.models.settings,
            page = null;

        function show() {
            gear.ui.changePage('#settingspage');            
        }
        
        function onPageShow() {
            e.listen('tizen.back', onBack);
            
            var audioTextEl = document.getElementById('audio-text');
            if(settings.getAudioActive()) {
            	audioTextEl.innerHTML = 'On';
            } else {
            	audioTextEl.innerHTML = 'Off';
            }
            
            var vibrateTextEl = document.getElementById('vibrate-text');
            if(settings.getVibrateActive()) {
            	vibrateTextEl.innerHTML = 'On';
            } else {
            	vibrateTextEl.innerHTML = 'Off';
            }
            
            var distanceTextEl = document.getElementById('distance-text');
            distanceTextEl.innerHTML = settings.getDistanceUnits();
            
            var paceTextEl = document.getElementById('pace-text');
            var pu = settings.getPaceUnits();
            if (settings.getDistanceUnits() == 'Miles') {
            	if (pu == 'km/h') pu = 'mph';
            	if (pu == 'Min/km') pu = 'Min/mile';
            }
            paceTextEl.innerHTML = pu;
            
            var ageTextEl = document.getElementById('age-text');
            switch(settings.getAgeRange()) {
            case 0:
            	ageTextEl.innerHTML = 'No age chosen';
            	break;
            	
            case 20:
            	ageTextEl.innerHTML = '0-20';
            	break;
            	
            case 25:
            	ageTextEl.innerHTML = '21-30';
            	break;
            	
            case 35:
            	ageTextEl.innerHTML = '31-40';
            	break;
            	
            case 45:
            	ageTextEl.innerHTML = '41-50';
            	break;
            	
            case 55: 
                ageTextEl.innerHTML = '51-60';
            	break;
            	
            case 65: 
            	ageTextEl.innerHTML = '61-70';
            	break;
            	
            case 75:
            	ageTextEl.innerHTML = '71-80';
            	break;
            	
            case 80:
            	ageTextEl.innerHTML = '80+';
            	break;
            	
            default:
            	ageTextEl.innerHTML = 'No age chosen';
            	break;
            }
        }

        function onPageHide() {
           e.die('tizen.back', onBack);
        }
        
        function onBack() {
            e.fire('newmain.show');
        }

        function bindEvents() {
        	page.addEventListener('pageshow', onPageShow);
            page.addEventListener('pagehide', onPageHide);
            
            document.getElementById('audioactive-btn').addEventListener('click', onAudioActiveBtnClick);
            document.getElementById('distance-units-btn').addEventListener('click', onDistanceUnitsBtnClick);
            document.getElementById('pace-units-btn').addEventListener('click', onPaceUnitsBtnClick);
            document.getElementById('age-btn').addEventListener('click', onAgeBtnClick);
            document.getElementById('vibrate-btn').addEventListener('click', onVibrateBtnClick);
            document.getElementById('about-btn').addEventListener('click', onAboutBtnClick);
            
        }
        
        function onAudioActiveBtnClick() {
        	e.fire('audioactive.show');
        }
        
        function onVibrateBtnClick() {
        	e.fire('vibratesetting.show');
        }
        
        function onDistanceUnitsBtnClick() {
        	e.fire('distanceunits.show');
        }
        
        function onPaceUnitsBtnClick() {
        	e.fire('paceunits.show');
        }
        
        function onAgeBtnClick() {
        	e.fire('ageselect.show', "settingspage");
        }
        
        function onAboutBtnClick() {
            e.fire('about.show');            
        }
        
        function init() {
            page = document.getElementById('settingspage');
            bindEvents();
        }
        
        e.listeners({
            'settingspage.show': show
        });
        
        return {
            init: init
        };
    }

});
