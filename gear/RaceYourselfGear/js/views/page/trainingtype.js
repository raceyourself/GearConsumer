/*global define, $, console, window, history, document*/

/**
 * Main page module
 */

define({
    name: 'views/page/trainingtype',
    requires: [
        'core/event',
        'models/application',
        'models/race',
        'views/page/setdistance',
        'views/page/ageselect'
    ],
    def: function viewsPageTrainingType(req) {
        'use strict';

        var e = req.core.event,
            app = req.models.application,
            race = req.models.race,
            page = null;

        function show() {
            gear.ui.changePage('#trainingtype');            
        }
        
        function onPageShow() {
            e.listen('tizen.back', onBack);
        }

        function onPageHide() {
           e.die('tizen.back', onBack);
        }
        
        function onBack() {
            app.closeApplication();
        }

        function bindEvents() {
        	document.getElementById('weight-loss-btn').addEventListener('click', onTypeBtnClick);
        	document.getElementById('endurance-btn').addEventListener('click', onTypeBtnClick);
        	document.getElementById('strength-btn').addEventListener('click', onTypeBtnClick);
        	
            page.addEventListener('pageshow', onPageShow);
            page.addEventListener('pagehide', onPageHide);
        }
        
        function onTypeBtnClick(event) {
        	console.log(this);
        	switch(this.id) {
        	case 'weight-loss-btn':
        		race.setGoal('WeightLoss');
        		break;
        		
        	case 'endurance-btn':
        		race.setGoal('Endurance');
        		break;
        		
        	case 'strength-btn':
        		race.setGoal('Strength');
        		break;
        		
        	default:
        			
        		break;
        	}
        	e.fire('ageselect.show');
        }
        

        function init() {
            page = document.getElementById('trainingtype');
            bindEvents();
        }
        
        e.listeners({
            'trainingtype.show': show
        });
        
        return {
            init: init
        };
    }

});
