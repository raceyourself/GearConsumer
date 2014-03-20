/*global define, $, console, window, tizen, webapis*/
/*jslint regexp: true, plusplus: true*/

/**
 * Analytics module
 */

define({
    name: 'models/analytics',
    requires: [
        'core/event',
        'models/sapRaceYourself'
    ],
    def: function modelsAnalytics(req) {
        'use strict';

        var e = req.core.event,
            provider = req.models.sapRaceYourself,
//            queue = {},
            launchTime = Date.now(),
            pageShowTime = Date.now(); // initial view
        
        
        function log(event) {
            provider.sendAnalytics(event);
        }        
        
        function onAnyPageShow(event) {
            pageShowTime = Date.now();
        }

        function onAnyPageHide(event) {
            var data = {
                    'Flow state': event.target.id,
                    'Time since launch': Date.now()-launchTime,
                    'State live': Date.now() - pageShowTime,
                    'Event type': 'Flow state changed'
                    
            };
            log(data);
        }
        
        /**
         * Initializes the module
         */
        function init() {
            window.addEventListener('pageshow', onAnyPageShow);
            window.addEventListener('pagehide', onAnyPageHide);
        }

        return {
            init:init,
            log: log
        };
    }

});
