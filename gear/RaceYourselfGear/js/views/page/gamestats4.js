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
    name: 'views/page/gamestats4',
    requires: [
        'core/event',
        'models/game',
        'models/race',
        'models/timer'
    ],
    def: function viewsPageGameStats4(req) {
        'use strict';

        var e = req.core.event,
            race = req.models.race,
            game = req.models.game,
            Timer = req.models.timer.Timer,
            page = null,
            timer = null,
            ongoing = null,
            earnedEl,
            lostEl,
            totalEl;

        function show() {
        }

        function onPageShow() {
            e.listen('race.new', reloadRace);
            e.listen('points.change', tick);
            
            ongoing = race.getOngoingRace();
            tick();
            timer.run();
        }
        
        function onPageHide() {
            e.die('race.new', reloadRace);
            e.die('points.change', tick);
            timer.reset();
        }
        
        function reloadRace() {
            ongoing = race.getOngoingRace();            
        }
        
        function tick() {
            if (!ongoing) return;
            earnedEl.innerHTML = numberWithCommas(~~ongoing.getPointsEarned());
            lostEl.innerHTML = numberWithCommas(~~ongoing.getPointsLost());
            totalEl.innerHTML = numberWithCommas(~~ongoing.getPoints());
        }
        
        function numberWithCommas(x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }        
        
        function bindEvents() {
            page.addEventListener('pageshow', onPageShow);
            page.addEventListener('pagehide', onPageHide);
        }

        function init() {
//            page = document.getElementById('race-game');
//            earnedEl = document.getElementById('sweat-earned-stat');
//            lostEl = document.getElementById('sweat-lost-stat');
//            totalEl = document.getElementById('sweat-total-stat');
//            timer = new Timer(1000, 'views.page.gamestats4.tick');
//            bindEvents();
        }

        e.listeners({
            'statsright.show': show,
            'views.page.gamestats4.tick' : tick,
        });

        return {
// View disabled        	
//            init: init
        };
    }

});
