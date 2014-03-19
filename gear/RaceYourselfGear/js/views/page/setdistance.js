/*global define, $, console, window, history, document*/

/**
 * Main page module
 */

define({
    name: 'views/page/setdistance',
    requires: [
        'core/event',
        'models/race',
        'models/settings',
        'views/page/pregame'
    ],
    def: function viewsPageSetDistance(req) {
        'use strict';

        var e = req.core.event,
            race = req.models.race,
            settings = req.models.settings,
            page = null,
            d = 100,
            holdInterval = false,
            increment = 100,
            valueEl = null;

        function show() {
            gear.ui.changePage('#setdistance');
        }

        function onPageShow() {
            d = settings.getDistance();
            render();
        }
        
        function render() {
            d = Math.max(100, d);
            d = Math.min(99900, d);
            valueEl.innerHTML = Number(d/1000).toFixed(1).replace('.', ',');
        }
        
        function onMinus() {
            increment = 100;
            d -= increment;
            render();
            holdInterval = setInterval(function() {
                d -= increment;
                increment = Math.min(1000, increment + 100);
                render();
            }, 250);
        }

        function onPlus() {
            increment = 100;
            d += increment;
            render();
            holdInterval = setInterval(function() {
                d += increment;
                increment = Math.min(1000, increment + 100);
                render();
            }, 250);
        }
        
        function onHalt() {
            clearInterval(holdInterval);
        }
        
        function onOk() {
            settings.setDistance(d);
            e.fire('pregame.show');
        }

        function bindEvents() {
            var minusBtnEl = document.getElementById('distance-minus'),
                plusBtnEl = document.getElementById('distance-plus'),
                okBtnEl = document.getElementById('distance-ok');

            valueEl = document.getElementById('distance-value');
            
            page.addEventListener('pageshow', onPageShow);
            minusBtnEl.addEventListener('mousedown', onMinus);
            plusBtnEl.addEventListener('mousedown', onPlus);
            minusBtnEl.addEventListener('mouseup', onHalt);
            plusBtnEl.addEventListener('mouseup', onHalt);
            okBtnEl.addEventListener('click', onOk);
        }

        function init() {
            page = document.getElementById('setdistance');
            bindEvents();
        }

        e.listeners({
            'setdistance.show': show
        });

        return {
            init: init
        };
    }

});
