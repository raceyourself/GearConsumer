/*global define, tizen, console*/

/**
 * Power module
 */

define({
    name: 'core/power',
    def: function corePower() {
        'use strict';
        var power = null,

            RESOURCE = 'SCREEN',
            STATE = 'SCREEN_NORMAL';

        function noop() {
            return;
        }

        /**
         * Set screen power to normal
         */
        function awake() {
            power.request(RESOURCE, STATE);
        }

        /**
         * Set screen power to default
         */
        function normal() {
            power.release(RESOURCE);
        }

        function init() {
            if (typeof tizen === 'object' && typeof tizen.power === 'object') {
                power = tizen.power;
            } else {
                console.warn(
                    'tizen.power not available'
                );
                power = {
                    request: noop,
                    release: noop
                };
            }
        }

        return {
            normal: normal,
            awake: awake,
            init: init
        };
    }
});
