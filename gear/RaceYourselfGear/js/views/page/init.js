/*global define, $, console, window, history, document, gear*/

/**
 * Init page module
 */

define({
    name: 'views/page/init',
    requires: [
        'core/event',
        'core/template',
        'models/application',
        'models/achievements',
        'views/page/main'
    ],
    def: function viewsPageInit(req) {
        'use strict';

        var e = req.core.event,
            app = req.models.application,
            achievements = req.models.achievements,
            touch_start = null, 
            fling_limit = {};

        function onHardwareKeysTap(ev) {
            var keyName = ev.keyName;
            if (keyName === 'back') {
                e.fire('tizen.back');
            }
        }
        
        function onTouchStart(ev) {
        	touch_start = ev.changedTouches.item(0);
        }

        function onTouchMove(ev) {        
            ev.preventDefault();
        }

        function onTouchEnd(ev) {        
            if (touch_start === null) return;
            
            var dx = ev.changedTouches.item(0).pageX - touch_start.pageX;
        	var dy = ev.changedTouches.item(0).pageY - touch_start.pageY;
        	if (dx >= fling_limit.x) {
        	    e.fire('fling.right');
        	}
        	if (-dx >= fling_limit.x) {
        	    e.fire('fling.left');
        	}
        	if (dy >= fling_limit.y) {
        	    e.fire('tizen.back');
        	}
        	if (-dy >= fling_limit.y) {
        	    e.fire('fling.up');
        	}
        	
        	touch_start = null;
        }

        function onTouchCancel(ev) {        
        	touch_start = null;
        }
        
        function onError(msg, url, line) {
            document.getElementById('error-message').innerHTML = '<p><b>' + msg + '</b></p>' + url.substr(url.lastIndexOf('/')+1) + ':' + line;
            gear.ui.changePage('#error-page');
            document.addEventListener('click', function() {
                app.closeApplication();                
            });
        }

        function bindEvents() {
            window.addEventListener('tizenhwkey', onHardwareKeysTap);
            window.onkeydown = function(event) {
                if (event.keyCode == 40) e.fire('tizen.back'); // down arrow
            };
            window.onerror = onError;
        }

        function init() {
            // bind events to page elements
            bindEvents();
            fling_limit.x = document.querySelector('.ui-page-active').offsetWidth/3;
            fling_limit.y = document.querySelector('.ui-page-active').offsetHeight/3;
        }

        return {
            init: init
        };
    }

});
