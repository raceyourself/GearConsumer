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

/*global define, $, console, window, history, document*/

/**
 * Main page module
 */

define({
    name: 'views/page/main',
    requires: [
        'core/event',
        'models/application',
        'views/page/setdistance',
        'views/page/settime',
        'views/page/games',
        'views/page/newmain'
    ],
    def: function viewsPageMain(req) {
        'use strict';

        var e = req.core.event,
            app = req.models.application,
            page = null;

        function show() {
            gear.ui.changePage('#main');            
        }
        
        function onPageShow() {
            setTimeout(onLoad, 1);
        }

        function onPageHide() {
        }
        
        function onBack() {
            app.closeApplication();
        }
        
        function onLoad() {
        	e.fire('newmain.show');
        }

        function bindEvents() {
            page.addEventListener('pageshow', onPageShow);
            page.addEventListener('pagehide', onPageHide);
        }

        function init() {
            page = document.getElementById('main');
            bindEvents();
            // Assume we always start in this view
            onPageShow();
        }
        
        e.listeners({
            'main.show': show
        });
        
        return {
            init: init
        };
    }

});
