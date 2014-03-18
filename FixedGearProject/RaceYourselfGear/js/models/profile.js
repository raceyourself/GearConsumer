/*global define, $, console, tizen, webapis*/
/*jslint regexp: true*/

/**
 * Application module
 */

define({
    name: 'models/profile',
    requires: [
        'core/storage',
        'helpers/units'
    ],
    def: function modelsProfile(req) {
        'use strict';

        var s = req.core.storage,
            units = req.helpers.units,
            defaults = {
                step: {
                    unit: units.UNIT_METER,
                    value: 0.6
                }
            },
            profile = null,
            STORAGE_KEY = 'profile';

        /**
         * Returns step.
         * @return {object}
         */
        function getStep() {
            return profile.step;
        }

        function saveProfile() {
            if (s.add(STORAGE_KEY, profile)) {
                return true;
            }
            return false;
        }

        /**
         * Sets step length.
         * @param {string} id Unit id.
         * @param {number} value Value.
         */
        function setStep(id, value) {
            profile.step.unit = id;
            profile.step.value = value;
            return saveProfile();
        }

        /**
         * Initializes module.
         */
        function init() {
            profile = s.get(STORAGE_KEY);
            if (profile === null) {
                profile = defaults;
                saveProfile();
            }
        }

        return {
            init: init,
            getStep: getStep,
            setStep: setStep
        };
    }

});
