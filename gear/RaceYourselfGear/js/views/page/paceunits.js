/*global define, $, console, window, history, document*/

/**
 * Main page module
 */

define({
    name: 'views/page/paceunits',
    requires: [
        'core/event',
        'models/application',
        'models/race',
        'models/settings',
        'views/page/ageselect'
    ],
    def: function viewsPagePaceUnits(req) {
        'use strict';

        var e = req.core.event,
            app = req.models.application,
            race = req.models.race,
            settings = req.models.settings,
            page = null;

        function show() {
            gear.ui.changePage('#paceunits');            
        }
        
        function onPageShow() {
            e.listen('tizen.back', onBack);
            
            var radios = document.getElementsByName('radio-pace-units');
            for(var i=0, length = radios.length; i < length; i++) {
            	if(settings.getPaceUnits() == radios[i].value)
            	{
            		console.log('FOUND MATCHING RADIO - ' + radios[i].value + ", settings is " + settings.getPaceUnits());
            		radios[i].checked = true;
            	} else {
                    radios[i].checked = false;            	    
            	}
            }
        }

        function onPageHide() {
           e.die('tizen.back', onBack);
           var radios = document.getElementsByName('radio-pace-units');
           for(var i=0, length=radios.length; i<length; i++) {
        	   if(radios[i].checked) {
        		   console.log('FOUND MATCHING RADIO - ' + radios[i].value);
        		   settings.setPaceUnits(radios[i].value);
        		   break;
        	   }
           }
        }
        
        function onBack() {
        	history.back();
        }

        function bindEvents() {
        	page.addEventListener('pageshow', onPageShow);
            page.addEventListener('pagehide', onPageHide);
        }
        
        function init() {
            page = document.getElementById('paceunits');
            bindEvents();
        }
        
        e.listeners({
            'paceunits.show': show
        });
        
        return {
            init: init
        };
    }

});
