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
    name: 'views/page/intensityType',
    requires: [
        'core/event',
        'models/application',
        'models/race',
        'models/settings',
        'views/page/ageselect'
    ],
    def: function viewsPageIntensityTypeSetting(req) {
        'use strict';

        var e = req.core.event,
            app = req.models.application,
            race = req.models.race,
            settings = req.models.settings,
            page = null;

        function show() {
            gear.ui.changePage('#intensityType');            
        }
        
        function onPageShow() {
            e.listen('tizen.back', onBack);
            
            var radios = document.getElementsByName('radio-intensity-type');
            
            for(var i=0, length = radios.length; i < length; i++) {
            	if(radios[i].value == settings.getGameType())
            	{
            		radios[i].checked = true;
            	}
            }
        }

        function onPageHide() {
           e.die('tizen.back', onBack);
        }
        
        function onBack() {
        	history.back();
        }

        function bindEvents() {
        	page.addEventListener('pageshow', onPageShow);
            page.addEventListener('pagehide', onPageHide);
        }
        
        function init() {
            page = document.getElementById('intensityType');
            
            var radios = document.getElementsByName('radio-intensity-type');
            for(var i=0, length=radios.length; i<length; i++) {
            	radios[i].addEventListener('click', onRadioClick);
            }
            
            bindEvents();
        }
        
        function onRadioClick() {
        	var radios = document.getElementsByName('radio-intensity-type');
            for(var i=0, length=radios.length; i<length; i++) {
         	   if(radios[i].checked == true) {
					console.log('FOUND MATCHING RADIO - ' + radios[i].value);
					settings.setGameType( radios[i].value );         		   
					break;
         	   }
         	   
            }
            e.fire('settingspage.show');
        }
        
        e.listeners({
            'intensityTypeSelect.show': show
        });
        
        return {
            init: init
        };
    }

});
