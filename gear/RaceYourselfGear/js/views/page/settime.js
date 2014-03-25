/*global define, $, console, window, history, document*/

/**
 * Main page module
 */

define({
    name: 'views/page/settime',
    requires: [
        'core/event',
        'models/race',
        'models/sap',
        'models/settings',
        'views/page/pregame'
    ],
    def: function viewsPageSetTime(req) {
        'use strict';

        var e = req.core.event,
            race = req.models.race,
            settings = req.models.settings,
            sap = req.models.sap,
            page = null,
            t = 30,
            holdInterval = false,
            increment = 1,
            valueEl = null;

        function show() {
            gear.ui.changePage('#settime');
        }

        function onPageShow() {
            t = settings.getTime();
            render();
            e.listen('tizen.back', onBack);
        }
        
        function onPageHide() {
        	e.die('tizen.back', onBack);
        }
        
        function onBack() {
            history.back();
        }
        
        function render() {
            t = Math.max(1, t);
            t = Math.min(99*60, t);
            valueEl.innerHTML = hhmm(t);
        }
        
        function hhmm(minutes) {
            var hours = ~~(minutes/60);
            var mins = minutes - hours*60;
            
            if (hours < 10) hours = '0' + hours;
            if (mins < 10) mins = '0' + mins;
            
            return hours + ' ' + mins;
        }
        
        function onMinus() {
            increment = 1;
            t -= increment;
            render();
            clearInterval(holdInterval);
            holdInterval = setInterval(function() {
                t -= increment;
                increment = Math.min(15, increment + 1);
                render();
            }, 250);
        }

        function onPlus() {
            increment = 1;
            t += increment;
            render();
            clearInterval(holdInterval);
            holdInterval = setInterval(function() {
                t += increment;
                increment = Math.min(15, increment + 1);
                render();
            }, 250);
        }
        
        function onHalt() {
            clearInterval(holdInterval);
        }
        
        function onOk() {
            settings.setTime(t);
            if(sap.isConnected() || !sap.isAvailable()) {
            	e.fire('pregame.show');
            } else {
            	e.fire('no-bluetooth.show');
            }
        }

        function bindEvents() {
            var minusBtnEl = document.getElementById('time-minus'),
                plusBtnEl = document.getElementById('time-plus'),
                okBtnEl = document.getElementById('time-ok');

            valueEl = document.getElementById('time-value');
            
            page.addEventListener('pageshow', onPageShow);
            page.addEventListener('pagehide', onPageHide);
            minusBtnEl.addEventListener('mousedown', onMinus);
            plusBtnEl.addEventListener('mousedown', onPlus);
            minusBtnEl.addEventListener('mouseup', onHalt);
            plusBtnEl.addEventListener('mouseup', onHalt);
            minusBtnEl.addEventListener('touchstart', function(ev) { onMinus(ev); ev.stopPropagation(); ev.preventDefault(); });
            plusBtnEl.addEventListener('touchstart', function(ev) { onPlus(ev); ev.stopPropagation(); ev.preventDefault(); });
            minusBtnEl.addEventListener('touchend', onHalt);
            plusBtnEl.addEventListener('touchend', onHalt);
            minusBtnEl.addEventListener('touchcancel', onHalt);
            plusBtnEl.addEventListener('touchcancel', onHalt);
            okBtnEl.addEventListener('click', onOk);
        }

        function init() {
            page = document.getElementById('settime');
            bindEvents();
        }

        e.listeners({
            'settime.show': show
        });

        return {
            init: init
        };
    }

});
