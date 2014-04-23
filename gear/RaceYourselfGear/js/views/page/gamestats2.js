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
    name: 'views/page/gamestats2',
    requires: [
        'core/event',
        'models/game',
        'models/race',
        'models/timer'
    ],
    def: function viewsPageGameStats2(req) {
        'use strict';

        var e = req.core.event,
            race = req.models.race,
            game = req.models.game,
            Timer = req.models.timer.Timer,
            page = null,
            timer = null,
            ongoing = null,
//            bpm = 'N/A',
//            bpmEl,
			earnedEl,
            kcalEl,
            stepsEl;

        function show() {
        }

        function onPageShow() {
            e.listen('race.new', reloadRace);
            e.listen('pedometer.step', tick);
//            e.listen('hrm.change', hrmChange);
            e.listen('points.change', tick);

            
            ongoing = race.getOngoingRace();
            tick();
            timer.run();
        }
        
        function onPageHide() {
            e.die('race.new', reloadRace);
            e.die('pedometer.step', tick);
//            e.die('hrm.change', hrmChange);
            e.die('points.change', tick);

            timer.reset();
        }
            
        function numberWithCommas(x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }   
        
        function reloadRace() {
            ongoing = race.getOngoingRace();            
        }
        
//        function hrmChange(hrmInfo) {
//            bpm = hrmInfo.detail.heartRate;
//            if(bpm < 30)
//            {
//            	bpm = '--';
//            }
//            tick();
//        }
        
        function tick() {
            if (!ongoing) return;
//            bpmEl.innerHTML = bpm;
            earnedEl.innerHTML = numberWithCommas(~~ongoing.getPointsEarned());
            kcalEl.innerHTML = ~~(ongoing.getCalories());
            stepsEl.innerHTML = ongoing.getSteps();
        }
        
        function bindEvents() {
            page.addEventListener('pageshow', onPageShow);
            page.addEventListener('pagehide', onPageHide);
        }

        function init() {
            page = document.getElementById('race-game');
//            bpmEl = document.getElementById('bpm-stat');
			earnedEl = document.getElementById('points-stat');
            kcalEl = document.getElementById('kcal-stat');
            stepsEl = document.getElementById('steps-stat');
            timer = new Timer(1000, 'views.page.gamestats2.tick');
            bindEvents();
        }

        e.listeners({
            'statsright.show': show,
            'views.page.gamestats2.tick' : tick,
        });

        return {
            init: init
        };
    }

});
