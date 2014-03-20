/*global define, $, console, window, history, document*/

/**
 * Main page module
 */

define({
    name: 'views/page/distanceunits',
    requires: [
        'core/event',
        'models/application',
        'models/race',
        'models/settings',
        'views/page/ageselect'
    ],
    def: function viewsPageDistanceUnits(req) {
        'use strict';

        var e = req.core.event,
            app = req.models.application,
            race = req.models.race,
            settings = req.models.settings,
            page = null;

        function show() {
            gear.ui.changePage('#distanceunits');            
        }
        
        function onPageShow() {
            e.listen('tizen.back', onBack);
            
            var radios = document.getElementsByName('radio-distance-units');
            for(var i=0, length = radios.length; i < length; i++) {
            	if(settings.getDistanceUnits() == radios[i].value)
            	{
            		console.log('FOUND MATCHING RADIO - ' + radios[i].value + ", settings is " + settings.getDistanceUnits());
            		radios[i].checked = true;
            	} else {
                    radios[i].checked = false;
            	}
            }
        }

        function onPageHide() {
           e.die('tizen.back', onBack);
           var radios = document.getElementsByName('radio-distance-units');
           for(var i=0, length=radios.length; i<length; i++) {
        	   if(radios[i].checked == true) {
        		   console.log('FOUND MATCHING RADIO - ' + radios[i].value);
        		   settings.setDistanceUnits(radios[i].value);
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
            page = document.getElementById('distanceunits');
            
            bindEvents();
        }
        
        e.listeners({
            'distanceunits.show': show
        });
        
        return {
            init: init
        };
    }

});
