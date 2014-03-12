/*global define, $, console, window, history, document*/

/**
 * Main page module
 */

define({
    name: 'views/page/hrzgame',
    requires: [
        'core/event',
        'views/page/statsleft',
        'views/page/statsright',
        'models/race'
    ],
    def: function viewsPageHeartRateZombiesGame(req) {
        'use strict';

        var e = req.core.event,
            race = req.models.race,
            page = null,
            canvas,
            context,
            TRACK_LENGTH = 100,
            renderTimeout = false,
            bannerTimeout = false,
            wave = 1,
            banner = false,
            countingdown = false,
            runnerImage = null,
            zombieImage = null,
            zombieDistance = false,
            zombieInterval = false,            
            visible = false,
            changer,
            sectionChanger;

        function show() {
            gear.ui.changePage('#race-game');
        }

        function onPageShow() {
            visible = true;
            e.listen('tizen.back', onBack);
            sectionChanger = new SectionChanger(changer, {
                circular: false,
                orientation: "horizontal"
            });
            
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
            sectionChanger.destroy();
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
            startZombies();
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
        
        function nextWave() {
            countingdown = true;
            wave++;
            banner = 'Wave ' + wave;
            render();
            clearTimeout(bannerTimeout);
            bannerTimeout = setTimeout(startCountdown, 1500);
        }
        
        function startZombies() {
            clearInterval(zombieInterval);
            zombieDistance = -25;
            zombieInterval = setInterval(zombieTick, Math.min(350, 750-(wave*50)));
        }
        
        function zombieTick() {
            zombieDistance++;
            render();
        }
        
        function stopZombies() {
            clearInterval(zombieInterval);
            zombieDistance = false;            
        }
        
        function step() {
            var r = race.getOngoingRace();
            if (r.getDistance() < zombieDistance) {
                navigator.vibrate([1000, 500, 250, 100]);
                r.stop();
                stopZombies();
                r = race.newRace();
                
                banner = 'R.I.P.';
                render();
                clearTimeout(bannerTimeout);
                bannerTimeout = setTimeout(nextWave, 1500);
                return;
            }
            if (r.getDistance() >= TRACK_LENGTH) {
                navigator.vibrate(1000);
                r.stop();
                stopZombies();
                r = race.newRace();
                
                banner = 'You won!';
                render();
                clearTimeout(bannerTimeout);
                bannerTimeout = setTimeout(nextWave, 1500);
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

            // Banner
            if (banner !== false) {
                context.font = '75px Samsung Sans';
                context.fillStyle = '#fff';
                context.textBaseline = "top";
                context.textAlign = "center";
                context.fillText(banner, canvas.width/2, 25);
            }
            
            if (banner === false && zombieDistance !== false) {
                var delta = r.getDistance() - zombieDistance;
                delta = ~~delta;
                var postfix = 'ahead';
                // TODO: Relative speed: 'catching up', 'breaking away'
                
                var columnCenter = canvas.width/2;
                columnCenter = ~~(columnCenter/2);
                
                if (true) {
                    context.font = '45px Samsung Sans';
                    context.fillStyle = '#fff';
                    context.textBaseline = "top";
                    context.textAlign = "center";
                    context.fillText(delta+'m', 0+columnCenter, 25);
                    context.font = '25px Samsung Sans';
                    context.fillText(postfix, 0+columnCenter, 25+45);
                }
                if (true) {
                    context.font = '25px Samsung Sans';
                    context.fillStyle = '#fff';
                    context.textBaseline = "top";
                    context.textAlign = "center";
                    context.fillText('Heart Rate', canvas.width-columnCenter, 25);
                    context.font = '45px Samsung Sans';
                    context.fillText('F', canvas.width-columnCenter, 25+25);
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
            
            // Zombies
            if (zombieDistance !== false) {
                for (var i=0;i<wave;i++) {
                    var x_offset = (i*(zombieImage.width/2))+(i%2)*10;
                    var y_offset = (-1+(i+1)%2) * 5;
                    if (i%2==1) context.globalAlpha = 0.5;
                    else context.globalAlpha = 1;
                    context.drawImage(zombieImage, 0 + (zombieDistance * trackWidth / TRACK_LENGTH) - x_offset, canvas.height - zombieImage.height - 30 + y_offset);    
                }
                context.globalAlpha = 1;
            }
            
            // Self
            context.drawImage(runnerImage, 0 + (r.getDistance() * trackWidth / TRACK_LENGTH), canvas.height - runnerImage.height - 30);
            
            context.save();            
        }
        
        function attachGame() {
            page.addEventListener('pageshow', onPageShow);
            page.addEventListener('pagehide', onPageHide);
        }
        function detachGame() {
            page.removeEventListener('pageshow', onPageShow);
            page.removeEventListener('pagehide', onPageHide);
        }
                
        function bindEvents() {
        }

        function init() {
            page = document.getElementById('race-game');
            changer = document.getElementById("race-game-sectionchanger");
            canvas = document.getElementById('race-canvas');
            context = canvas.getContext('2d');
            
            var image = new Image();
            image.src = 'images/runner.png';
            image.onload = function() {
                runnerImage = this;
            }
            image = new Image();
            image.src = 'images/zombie.png';
            image.onload = function() {
                zombieImage = this;
            }
            
            bindEvents();
        }

        e.listeners({
            'hrzgame.show': show,
            'hrzgame.attach': attachGame,
            'hrzgame.detach': detachGame
        });

        return {
            init: init
        };
    }

});
