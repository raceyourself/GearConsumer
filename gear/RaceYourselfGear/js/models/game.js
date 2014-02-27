/*global define, $, console, tizen, webapis*/
/*jslint regexp: true*/

/**
 * Application module
 */

define({
    name: 'models/game',
    requires: [
        'core/event',
        'core/storage'
    ],
    def: function modelsGame(req) {
        'use strict';

        var e = req.core.event,
            s = req.core.storage,
            locked = true,
            currentGame;

        function getName() {
            return "Heart Rate Zombies";
        }
        
        function getTitle() {
            return "Escape Zombies";
        }
        
        function getImage() {
            return "images/heartratemonitor.png";
        }
        
        function getDescription() {
            return "Your heart rate determines your speed.";
        }
        
        function isLocked() {
            return locked;
        }
        
        function unlock() {
            locked = false;
        }
        
        function setCurrentGame(game) {
            if (currentGame != null) e.fire(currentGame+'.detach');
            currentGame = game;
            if (currentGame != null) e.fire(currentGame+'.attach');
        }
        
        function getCurrentGame() {
            return currentGame;
        }
        
        /**
         * Initializes module.
         */
        function init() {
        }

        return {
            init: init,
            getName: getName,
            getTitle: getTitle,
            getImage: getImage,
            getDescription: getDescription,
            isLocked: isLocked,
            unlock: unlock,
            setCurrentGame: setCurrentGame,
            getCurrentGame: getCurrentGame
        };
    }

});
