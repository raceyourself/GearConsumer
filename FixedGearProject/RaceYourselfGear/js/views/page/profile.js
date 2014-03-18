/*global define, $, console, window, document, history, gear*/

/**
 * Profile page module
 */

define({
    name: 'views/page/profile',
    requires: [
        'core/event',
        'models/profile',
        'models/settings',
        'helpers/units'
    ],
    def: function viewsPageProfile(req) {
        'use strict';

        var e = req.core.event,
            units = req.helpers.units,
            profile = req.models.profile,
            settings = req.models.settings,
            page = null,
            stepLength = null,
            stepUnit = null;

        function show() {
            gear.ui.changePage('#profile');
        }

        /**
         * Display step length.
         *
         * @param {object} step Step object, must contain unit and value.
         */
        function setStepValue(step) {
            var stepValue = step.value,
                unit = settings.getUnit();

            stepValue = units.getStepValueForUnit(step, unit, 2);
            stepLength.innerHTML = stepValue;
        }

        /**
         * Display unit label.
         *
         * @param {object} unit
         */
        function setStepUnit(unit) {
            var unitData = units.getUnit(unit);
            stepUnit.innerHTML = unitData.label;
        }

        /**
         * Display current step length in current units (with unit label).
         */
        function setStep() {
            setStepValue(profile.getStep());
            setStepUnit(settings.getUnit());
        }

        function onPageShow() {
            setStep();
        }

        function bindEvents() {
            page.addEventListener('pageshow', onPageShow);
        }

        function init() {
            page = document.getElementById('profile');
            stepLength = page.querySelector('.profile-step-length-value');
            stepUnit = page.querySelector('.profile-step-length-unit');
            bindEvents();
        }

        e.listeners({
            'profile.show': show
        });

        return {
            init: init
        };
    }

});
