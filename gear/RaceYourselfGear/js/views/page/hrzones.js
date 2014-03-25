/*global define, $, console, window, history, document*/

/**
 * Main page module
 */

define({
    name: 'views/page/hrzones',
    requires: [
        'core/event',
        'models/sapRaceYourself'
    ],
    def: function viewsPageHeartRateZones(req) {
        'use strict';

        var e = req.core.event,
            page = null,
            changer,
            canvas,
            context,
            raf = false,
            
			hrm = req.models.hrm;

        function show() {
        }
        
        function onPageShow() {
            e.listen('hrm.change', onHeartRateChange);
			canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;   
            animate();
        }

        function onPageHide() {
            e.die('hrm.change', onHeartRateChange);
        }
        
        function onBack() {
            history.back();
        }

        function bindEvents() {
            page.addEventListener('pageshow', onPageShow);
            page.addEventListener('pagehide', onPageHide);
        }

        function init() {
            page = document.getElementById('race-game');
            changer = document.getElementById("race-game-sectionchanger");
            canvas = document.getElementById('hr-canvas');
            context = canvas.getContext('2d');
            bindEvents();
        }
        
        function onHeartRateChange() {
        
        }
        
        function animate(time) {
            raf = requestAnimationFrame(animate);
            render();
        }
        
        function requestRender() {
            if (!raf) render();
        }

        
        function render() {
			context.clearRect(0, 0, canvas.width, canvas.height);            

        	context.fillStyle = '#fff';
        	context.fillRect(0,0,canvas.height,canvas.width);
        }
        
        e.listeners({
			'statsleft.show': show
        });
        
        return {
            init: init
        };
    }

});
