/*global define, $, console, window, history, document*/

/**
 * Main page module
 */

define({
    name: 'views/page/racegame',
    requires: [
        'core/event',
        'views/page/statsleft',
        'views/page/statsright',
        'models/race'
    ],
    def: function viewsPageRaceGame(req) {
        'use strict';

        var e = req.core.event,
            race = req.models.race,
            page = null,
            canvas,
            context,
            TRACK_LENGTH = 100,
            renderTimeout = false,
            bannerTimeout = false,
            previousTrack = null,
            round = 1,
            streak = 0,
            banner = false,
            countingdown = false,
            runnerImage = null,
            opponentImage = null,
            visible = false;

        function show() {
            gear.ui.changePage('#race-game');
        }

        function onPageShow() {
            visible = true;
            e.listen('fling.left', flingLeft);
            e.listen('fling.right', flingRight);
            e.listen('tizen.back', onBack);
            
            var r = race.getOngoingRace();
            if (r === null || r.hasStopped()) {
                r = race.newRace();
                e.listen('pedometer.step', step);
                startCountdown();
            }
            
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;        
            
            render();
        }
        
        function onPageHide() {
            visible = false;
            clearTimeout(renderTimeout);
            e.die('fling.left', flingLeft);
            e.die('fling.right', flingRight);
            e.die('tizen.back', onBack);
        }        
        
        function onBack() {
            var r = race.getOngoingRace();
            if (r !== null) r.stop();
            clearTimeout(renderTimeout);
            clearTimeout(bannerTimeout)
            gear.ui.changePage('#games');
        }
        
        function startCountdown() {
            countingdown = true;
            clearTimeout(bannerTimeout);
            bannerTimeout = setTimeout(ready, 1000);
        }
        
        function ready() {
            banner = 'Ready';
            render();
            clearTimeout(bannerTimeout);
            bannerTimeout = setTimeout(set, 1000);
        }
        function set() {
            banner = 'Set';
            render();
            clearTimeout(bannerTimeout);
            bannerTimeout = setTimeout(go, 1000);
        }
        function go() {
            race.getOngoingRace().start();
            banner = 'Go!';
            render();
            countingdown = false;
            clearTimeout(bannerTimeout);
            bannerTimeout = setTimeout(clearbanner, 1000);
        }
        function clearbanner() {
            banner = false;
            render();
        }
        
        function nextRound() {
            countingdown = true;
            round++;
            banner = 'Round ' + round;
            render();
            clearTimeout(bannerTimeout);
            bannerTimeout = setTimeout(startCountdown, 1500);
        }
        
        function step() {
            var r = race.getOngoingRace();
            if (r.getDistance() >= TRACK_LENGTH) {
                navigator.vibrate(1000);
                r.stop();
                var oldTrack = previousTrack;
                previousTrack = r.track;
                r = race.newRace();
                
                if (oldTrack !== null) {
                    if (previousTrack[previousTrack.length-1].time <= oldTrack[oldTrack.length-1].time) {
                        banner = 'You win!';
                        streak++;
                        render();
                        clearTimeout(bannerTimeout);
                        bannerTimeout = setTimeout(nextRound, 1500);
                    } else {
                        banner = 'You lose';
                        streak = 0;
                        render();
                        clearTimeout(bannerTimeout);
                        bannerTimeout = setTimeout(nextRound, 1500);
                    }
                } else {
                    nextRound();
                }
                return;
            }
            render();
        }
        
        function render() {
            if (!visible) return;
            clearTimeout(renderTimeout);            
            
            context.clearRect(0, 0, canvas.width, canvas.height);            
            var trackWidth = canvas.width - 0 - runnerImage.width;
            var r = race.getOngoingRace();

            // Calculate stuff before rendering anything
            var opponentDistance = false;
            if (previousTrack !== null) {
                var t = r.getDuration();
                var distance = 0;
                for (var i=0;i<previousTrack.length;i++) {
                    if (previousTrack[i].time < t) {
                        distance = previousTrack[i].distance;
                    } else {
                        renderTimeout = setTimeout(render, previousTrack[i].time - t);
                        break;
                    }
                }
                opponentDistance = distance;
            }
            
            // Banner
            if (banner !== false) {
                context.font = '75px Samsung Sans';
                context.fillStyle = '#fff';
                context.textBaseline = "top";
                context.textAlign = "center";
                context.fillText(banner, canvas.width/2, 25);
            }
            
            if (banner === false && opponentDistance !== false) {
                var delta = r.getDistance() - opponentDistance;
                var postfix = false;
                if (delta > 0) {
                    delta = ~~delta;
                    postfix = 'ahead';
                } else {
                    delta = ~~-delta;
                    postfix = 'behind';
                }
                var columnCenter = canvas.width/2;
                if (true && streak > 0) columnCenter = ~~(columnCenter/2);
                
                if (true) {
                    context.font = '45px Samsung Sans';
                    context.fillStyle = '#fff';
                    context.textBaseline = "top";
                    context.textAlign = "center";
                    context.fillText(delta+'m', 0+columnCenter, 25);
                    context.font = '25px Samsung Sans';
                    context.fillText(postfix, 0+columnCenter, 25+45);
                }
                if (streak > 0) {
                    context.font = '25px Samsung Sans';
                    context.fillStyle = '#fff';
                    context.textBaseline = "top";
                    context.textAlign = "center";
                    context.fillText('streak', canvas.width-columnCenter, 25);
                    context.font = '45px Samsung Sans';
                    context.fillText(''+streak, canvas.width-columnCenter, 25+25);
                }
            }
            
            // Track
            context.moveTo(15, canvas.height - 25);
            context.lineTo(canvas.width - 15, canvas.height - 25);
            context.lineWidth = 3;
            context.strokeStyle = "#fff";
            context.stroke();
            
            // Track text
            context.font = '25px Samsung Sans';
            context.fillStyle = '#fff';
            context.textBaseline = "top";
            context.textAlign = "left";
            context.fillText('0', 10, canvas.height-25);
            context.textAlign = "right";
            context.fillText(''+TRACK_LENGTH, canvas.width - 10, canvas.height-25);
            
            // Opponent
            if (opponentDistance !== false) {
                context.drawImage(opponentImage, 0 + (opponentDistance * trackWidth / TRACK_LENGTH), canvas.height - runnerImage.height - 30);    
            }
            
            // Self
            context.drawImage(runnerImage, 0 + (r.getDistance() * trackWidth / TRACK_LENGTH), canvas.height - runnerImage.height - 30);
            
            context.save();            
        }
        
        function flingLeft() {
            e.fire('statsright.show');
        }
        
        function flingRight() {
            e.fire('statsleft.show');
        }
        
        function bindEvents() {
            page.addEventListener('pageshow', onPageShow);
            page.addEventListener('pagehide', onPageHide);
        }

        function init() {
            page = document.getElementById('race-game');
            canvas = document.getElementById('race-canvas');
            context = canvas.getContext('2d');
            
            var image = new Image();
            image.src = 'images/runner.png';
            image.onload = function() {
                runnerImage = this;
            }
            image = new Image();
            image.src = 'images/runner-other.png';
            image.onload = function() {
                opponentImage = this;
            }
            
            bindEvents();
        }

        e.listeners({
            'racegame.show': show
        });

        return {
            init: init
        };
    }

});
