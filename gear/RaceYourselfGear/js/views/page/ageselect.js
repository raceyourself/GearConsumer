/*global define, $, console, window, history, document*/

/**
 * Main page module
 */

define({
    name: 'views/page/ageselect',
    requires: [
        'core/event',
        'models/application',
        'models/settings',
        'views/page/choosegoal',
        'views/page/aboutage'
    ],
    def: function viewsPageAgeSelect(req) {
        'use strict';

        var e = req.core.event,
            app = req.models.application,
            settings = req.models.settings,
            nextpage = "",
            page = null;

        function show(event) {
            gear.ui.changePage('#ageselect');
            nextpage = event.detail;
        }
        
        function onPageShow() {
            e.listen('tizen.back', onBack);
        }

        function onPageHide() {
           e.die('tizen.back', onBack);
        }
        
        function onBack() {
            history.back();    		
        }

        function bindEvents() {
        	document.getElementById('below-twenty-btn').addEventListener('click', onAgeBtnClick);
        	document.getElementById('mid-twenties-btn').addEventListener('click', onAgeBtnClick);
       		document.getElementById('mid-thirties-btn').addEventListener('click', onAgeBtnClick);
       		document.getElementById('mid-fourties-btn').addEventListener('click', onAgeBtnClick);
       		document.getElementById('mid-fifties-btn').addEventListener('click', onAgeBtnClick);
       		document.getElementById('mid-sixties-btn').addEventListener('click', onAgeBtnClick);
       		document.getElementById('mid-seventies-btn').addEventListener('click', onAgeBtnClick);
       		document.getElementById('over-eighties-btn').addEventListener('click', onAgeBtnClick);        	
        	
       		document.getElementById('i-btn').addEventListener('click', onIBtnClick);
       		
            page.addEventListener('pageshow', onPageShow);
            page.addEventListener('pagehide', onPageHide);
            
        }
        
        function onIBtnClick() {
        	e.fire('aboutage.show');
        }
        
        function onAgeBtnClick(event) {
        	console.log(event.target.id);
        	switch(event.target.id) {
        	case 'below-twenty-btn':
        		settings.setAgeRange(20);
        		break;
        		
        	case 'mid-twenties-btn':
        		settings.setAgeRange(25);
        		break;
        		
        	case 'mid-thirties-btn':
        		settings.setAgeRange(35);
        		break;
        		
        	case 'mid-fourties-btn':
        		settings.setAgeRange(45);
        		break;
        		
        	case 'mid-fifties-btn':
        		settings.setAgeRange(55);
        		break;
        		
        	case 'mid-sixties-btn':
        		settings.setAgeRange(65);
        		break;
        		
        	case 'mid-seventies-btn':
        		settings.setAgeRange(75);
        		break;
        		
        	case 'over-eighties-btn':
        		settings.setAgeRange(80);
        		break;
        		
        	default:
        		
        		break;
        	}
        	
        	if(settings.getFirstTimeAge()) {
        		settings.setFirstTimeAge(false);
        	}
        	if(nextpage != "") {
        		console.log('there is a nextpage, its ' + nextpage);
        		e.fire(nextpage + '.show');
        	} else {
        		e.fire('settingspage.show');
        	}
        
        }

        function init() {
            page = document.getElementById('ageselect');
            
            bindEvents();
        }
        
        e.listeners({
            'ageselect.show': show
        });
        
        return {
            init: init
        };
    }

});
