/*global define, $, console, window, tizen, webapis*/
/*jslint regexp: true, plusplus: true*/

/**
 * Heart rate monitor module
 */

define({
    name: 'models/hrm',
    requires: [
        'core/event'
    ],
    def: function modelsHeartRateMonitor(req) {
        'use strict';

        var e = req,
            hrm = null,
            lastData = {},

            CONTEXT_TYPE = 'HRM';

        /**
         * Return last received motion data
         * @return {object}
         */
        function getLastData() {
            return lastData;
        }

        /**
         * @param {MotionHRMInfo} hrmInfo
         */
        function handleHrmInfo(hrmInfo) {
            eventName = 'hrm.change';
            lastdata = hrmInfo;
            e.fire(eventName, hrmInfo);
        }

        /**
         * Registers a change listener
         * @public
         */
        function start() {
            hrm.start(
                CONTEXT_TYPE,
                handleHrmInfo
            );
        }

        /**
         * Unregisters a change listener
         * @public
         */
        function stop() {
            hrm.stop(CONTEXT_TYPE);
        }

        function isAvailable() {
            return !!hrm;
        }
        
        /**
         * Initializes the module
         */
        function init() {
            if (window.webapis && window.webapis.motion !== undefined) {
                hrm = window.webapis.motion;
            }
        }

        return {
            init: init,
            start: start,
            stop: stop,
            getLastData: getLastData,
            isAvailable: isAvailable,
            _handleHrmInfo: handleHrmInfo // private, used by mock
        };
    }

});
