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
        'models/race',
        'models/hrm',
        'models/sprite'
    ],
    def: function viewsPageHeartRateZombiesGame(req) {
        'use strict';

        var e = req.core.event,
            race = req.models.race,
            hrm = req.models.hrm,
            Sprite = req.models.sprite.Sprite,
            page = null,
            canvas,
            context,
            TRACK_LENGTH = 100,
            lastRender = null,
            bannerTimeout = false,
            raf = false,
            wave = 1,
            banner = false,
            countingdown = false,
            runner = null,
            runnerAnimations = {
                    idle: { name: 'idle', sprite: null, speedThreshold: 1},
                    running: { name: 'running', sprite: null, speedThreshold: 2},
                    sprinting: { name: 'sprinting', sprite: null, speedThreshold: 4}
            },
            zombies = [],
            zombieDistance = false,
            zombieInterval = false,
            zombieMoan = null,
            zombieGrowl = null,
            visible = false,
            changer,
            sectionChanger,
            fpsInterval = false,
            frames = 0,
            fps = 0;

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
            
            frames = 0;
            fpsInterval = setInterval(function() {
                fps = frames;
                frames = 0;
            }, 1000);
            
            animate();
            
            requestRender();
        }
        
        function onPageHide() {
            visible = false;
            clearInterval(fpsInterval);
            sectionChanger.destroy();
            e.die('tizen.back', onBack);
        }        
        
        function onBack() {
            var r = race.getOngoingRace();
            if (r !== null) {
                r.stop();
                lastRender = null;                
                e.die('pedometer.step', step);
            }
            if (!!raf) cancelAnimationFrame(raf);
            clearInterval(zombieInterval);
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
            requestRender();
            clearTimeout(bannerTimeout);
            bannerTimeout = setTimeout(set, 1000);
        }
        function set() {
            banner = 'Set';
            requestRender();
            clearTimeout(bannerTimeout);
            bannerTimeout = setTimeout(go, 1000);
        }
        function go() {
            race.getOngoingRace().start();
            startZombies();
            lastRender = Date.now();
            banner = 'Go!';
            requestRender();
            countingdown = false;
            clearTimeout(bannerTimeout);
            bannerTimeout = setTimeout(clearbanner, 1000);
        }
        function clearbanner() {
            banner = false;
            requestRender();
        }
        
        function nextWave() {
            countingdown = true;
            wave++;
            banner = 'Wave ' + wave;
            requestRender();
            clearTimeout(bannerTimeout);
            bannerTimeout = setTimeout(startCountdown, 1500);
        }
        
        function startZombies() {
            clearInterval(zombieInterval);
            while (zombies.length < wave) zombies.push(zombies[0].clone());
            for (var i=0;i<zombies.length;i++) zombies[i].reset();
            zombieDistance = -25;
            zombieInterval = setInterval(zombieTick, Math.min(350, 750-(wave*50)));
        }
        
        function zombieTick() {
            zombieDistance++;
            requestRender();
            step();
        }
        
        function stopZombies() {
            clearInterval(zombieInterval);
            zombieDistance = false;            
        }
        
        function step() {
            var r = race.getOngoingRace();
            if (r.getDistance() < zombieDistance) {
                zombieGrowl.play();
                navigator.vibrate([1000, 500, 250, 100]);
                r.stop();
                lastRender = null;
                stopZombies();
                r = race.newRace();
                
                banner = 'R.I.P.';
                requestRender();
                clearTimeout(bannerTimeout);
                bannerTimeout = setTimeout(nextWave, 1500);
                return;
            }
            if (r.getDistance() >= TRACK_LENGTH) {
                zombieMoan.play();
                navigator.vibrate(1000);
                r.stop();
                lastRender = null;
                stopZombies();
                r = race.newRace();
                
                banner = 'You won!';
                requestRender();
                clearTimeout(bannerTimeout);
                bannerTimeout = setTimeout(nextWave, 1500);
                return;
            }
            
            if (runner.next !== null && r.getSpeed() >= runner.next.speedThreshold) {
                runner.sprite.onEnd(function(dt) {
                    runner.sprite.onEnd(null);
                    runner = runner.next;
                    runner.sprite.time = dt;
                });
            }
            if (r.getSpeed() < runner.speedThreshold && runner.previous !== null) {
                runner.sprite.onEnd(function(dt) {
                    runner.sprite.onEnd(null);
                    runner = runner.previous;
                    runner.sprite.time = dt;
                });
            }
            
            requestRender();
        }

        function animate(time) {
            raf = requestAnimationFrame(animate);
            render();
        }
        
        function requestRender() {
            if (!raf) render();
        }
        
        function render() {
            if (!visible) return;
            var dt = 0;
            if (lastRender !== null) {
                dt = Date.now() - lastRender;
                lastRender = Date.now();
            }
            
            context.clearRect(0, 0, canvas.width, canvas.height);            
            var trackWidth = canvas.width - 0 - runner.sprite.width;
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
                for (var i=0;i<zombies.length;i++) {
                    var zombie = zombies[i];
                    var x_offset = (i*(zombie.width/2))+(i%2)*10;
                    var y_offset = (-1+(i+1)%2) * 5;
                    if (i%2==1) context.globalAlpha = 0.5;
                    else context.globalAlpha = 1;
                    zombie.draw(context, 0 + (zombieDistance * trackWidth / TRACK_LENGTH) - x_offset, canvas.height - zombie.height - 30 + y_offset, dt)
                }
                context.globalAlpha = 1;
            }
            
            // Self
            runner.sprite.draw(context, 0 + (r.getDistance() * trackWidth / TRACK_LENGTH), canvas.height - runner.sprite.height - 30, dt);
            
            /// DEBUG
            // fps
            context.font = '20px Samsung Sans';
            context.fillStyle = '#fff';
            context.textBaseline = "top";
            context.textAlign = "center";
            context.fillText('fps: '+fps, canvas.width/2, 0);
            
            /// DEBUG
            
            context.save();
            frames++;
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
            
            // Set up animation transitions
            runnerAnimations.idle.previous = null;
            runnerAnimations.idle.next = runnerAnimations.running;
            runnerAnimations.running.previous = runnerAnimations.idle;
            runnerAnimations.running.next = runnerAnimations.sprinting;
            runnerAnimations.sprinting.previous = runnerAnimations.running;
            runnerAnimations.sprinting.next = null;
            
            var image = new Image();
            image.onload = function() {
                runnerAnimations.idle.sprite = new Sprite(this, this.width, 1000);
                runner = runnerAnimations.idle;
            }
            image.onerror = function() {
                throw "Could not load " + this.src;
            }
            image.src = 'images/runner-idle-anim.png';
            image = new Image();
            image.onload = function() {
                runnerAnimations.running.sprite = new Sprite(this, this.width, 1000);
            }
            image.onerror = function() {
                throw "Could not load " + this.src;
            }
            image.src = 'images/runner-running-anim.png';
            image = new Image();
            image.onload = function() {
                runnerAnimations.sprinting.sprite = new Sprite(this, this.width, 1000);
            }
            image.onerror = function() {
                throw "Could not load " + this.src;
            }
            image.src = 'images/runner-sprinting-anim.png';
            image = new Image();
            image.onload = function() {
                zombies.push(new Sprite(this, this.width/10, 2500));
            }
            image.onerror = function() {
                throw "Could not load " + this.src;
            }
            image.src = 'images/zombie-shuffle-anim.png';
            
            zombieMoan = new Audio('audio/zombie_moan.wav');
            zombieMoan.onerror = function() {
                throw "Could not load " + this.src;
            }
            zombieGrowl = new Audio('audio/zombie_growl.wav');
            zombieGrowl.onerror = function() {
                throw "Could not load " + this.src;
            }
                        
            if (hrm.isAvailable()) {
                hrm.start();
            } else {
                // TODO: Disable game?
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
