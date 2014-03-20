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
        'views/page/distanceunits',
        'views/page/paceunits'
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
            
            document.getElementById('distance-units-btn').addEventListener('click', onDistanceUnitsBtnClick);
            document.getElementById('pace-units-btn').addEventListener('click', onPaceUnitsBtnClick);
            document.getElementById('age-btn').addEventListener('click', onAgeBtnClick);
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
