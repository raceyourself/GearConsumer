/**
 * Copyright (c) 2014 RaceYourself Inc
 * All Rights Reserved
 *
 * No part of this application or any of its contents may be reproduced, copied, modified or 
 * adapted, without the prior written consent of the author, unless otherwise indicated.
 * 
 * Commercial use and distribution of the application or any part is not allowed without express 
 * and prior written consent of the author.
 * 
 * The application makes use of some publicly available libraries, some of which have their own 
 * copyright notices and licences. These notices are reproduced in the Open Source License 
 * Acknowledgement file included with this software.
 */

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
        'models/analytics',
        'models/motion',
        'views/page/main'
    ],
    def: function viewsPageInit(req) {
        'use strict';

        var e = req.core.event,
            app = req.models.application,
            motion = req.models.motion,
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
        
        function onError(msg, url, line, column, error) {
            var html = '<p><b>' + msg + '</b></p>' + url.substr(url.lastIndexOf('/')+1) + ':' + line;
            if (error !== undefined && error.stack !== undefined) html = '<p>' + error.stack + '</p>';
            document.getElementById('error-message').innerHTML = html;
            window.addEventListener('pageshow', function(ev) { ev.stopPropagation(); ev.preventDefault(); }, true);
            window.addEventListener('pagehide', function(ev) { ev.stopPropagation(); ev.preventDefault(); }, true);
            gear.ui.changePage('#error-page');
            document.getElementById('error-page').addEventListener('click', function() {
            	app.closeApplication();
            });
        }

        function onUserEvent() {
        	app.setScreenState('SCREEN_NORMAL');
        	return true;
        }
        
        function onDim() {
        	app.setScreenState('SCREEN_DIM');
        }
        
        function bindEvents() {
            window.addEventListener('tizenhwkey', onHardwareKeysTap);
            window.onkeydown = function(event) {
                if (event.keyCode == 40) e.fire('tizen.back'); // down arrow
            };
            window.onerror = onError;
            window.addEventListener('mousedown', onUserEvent);
            window.addEventListener('touchstart', onUserEvent);
        }

        function init() {
            // bind events to page elements
            bindEvents();
            fling_limit.x = document.querySelector('.ui-page-active').offsetWidth/3;
            fling_limit.y = document.querySelector('.ui-page-active').offsetHeight/3;
            e.addSingleton('tizen.back');
            if (motion.isAvailable()) motion.start();
            onUserEvent();
        }

        return {
            init: init
        };
    }

});
