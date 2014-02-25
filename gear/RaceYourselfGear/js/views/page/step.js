/*global define, $, console, window, document, history*/

/**
 * Step page module
 */

define({
    name: 'views/page/step',
    requires: [
        'core/event',
        'models/profile',
        'models/settings',
        'helpers/units'
    ],
    def: function viewsPageStep(req) {
        'use strict';

        var e = req.core.event,
            units = req.helpers.units,
            profile = req.models.profile,
            settings = req.models.settings,
            page = null,
            okButton = null,
            cancelButton = null,
            range = null,
            rangeValue = null,

            MIN = 0.1,
            MAX = 1.2,
            STEP = 0.01;

        function onSave() {
            var stepValue = page.querySelector('.range').value;

            if (profile.setStep(settings.getUnit(), stepValue)) {
                e.fire('profile.show');
            }
        }

        function onCancel() {
            history.back();
        }

        function setLabelValue() {
            rangeValue.innerHTML = range.value;
        }

        function onChange() {
            setLabelValue();
        }

        function setStepValue(step) {
            var stepValue = step.value;

            if (settings.getUnit() !== step.unit) {
                if (step.unit === units.UNIT_METER) {
                    stepValue = units.getFeet(step.value);
                }

                if (step.unit === units.UNIT_FEET) {
                    stepValue = units.getMeters(step.value);
                }
            }

            range.value = stepValue;
        }

        function setStepRange(unit) {
            var minValue = MIN,
                maxValue = MAX,
                step = STEP,
                stepRange;

            if (unit === units.UNIT_FEET) {
                minValue = units.getFeet(MIN);
                maxValue = units.getFeet(MAX);
                step = 0.01;
            }


            stepRange = page.querySelector('.range');
            stepRange.setAttribute('min', minValue);
            stepRange.setAttribute('max', maxValue);
            stepRange.setAttribute('step', step);
        }

        function onPageShow() {
            setStepRange(settings.getUnit());
            setStepValue(profile.getStep());
            setLabelValue();
        }

        function bindEvents() {
            page.addEventListener('pageshow', onPageShow);
            okButton.addEventListener('click', onSave);
            cancelButton.addEventListener('click', onCancel);
            range.addEventListener('change', onChange);
        }

        function init() {
            page = document.getElementById('step');
            okButton = page.querySelector('.ok');
            cancelButton = page.querySelector('.cancel');
            range = page.querySelector('.range');
            rangeValue = page.querySelector('.range-value');
            bindEvents();
        }

        return {
            init: init
        };
    }

});
