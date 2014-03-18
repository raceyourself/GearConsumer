/*global define, $, console, window, history, gear, document*/

/**
 * Settings page module
 */

define({
    name: 'views/page/settings',
    requires: [
        'core/event',
        'models/settings'
    ],
    def: function viewsPageSettings(req) {
        'use strict';

        var e = req.core.event,
            settings = req.models.settings,
            page = null,
            elUnit = null;

        function show() {
            gear.ui.changePage('#settings');
        }

        function onPageShow() {
            elUnit.innerHTML = (settings.getUnit());
        }

        function bindEvents() {
            page.addEventListener('pageshow', onPageShow);
        }

        function init() {
            page = document.getElementById('settings');
            elUnit = page.querySelector('.settings-units-value');
            bindEvents();
        }

        e.listeners({
            'settings.show': show
        });

        return {
            init: init
        };
    }

});
