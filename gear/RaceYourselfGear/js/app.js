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

/*global require, define, console, $*/

/**
 * App module
 */

define({
    name: 'app',
    requires: [
        'core/event',
        'views/page/init'
    ],
    def: function appInit(req) {
        'use strict';

        console.log('app::def');

        console.log('Hello, or as they say in your region: ' + _['hello']);
        
        var e = req.core.event;

        function init() {
            console.log('app::init');
        }

        return {
            init: init
        };
    }
});

