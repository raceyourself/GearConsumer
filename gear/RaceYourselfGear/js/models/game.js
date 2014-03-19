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
            games = {},
            defaults = {
                'yourself' : {
                    locked: true
                },
                'zombies' : {
                    locked: false
                },
                'boulder' : {
                    locked: true
                },
                'dino' : {
                    locked: true
                }
            },
            STORAGE_KEY = 'games',
            currentGame;

        function isLocked(game) {
            return games[game].locked;
        }
        
        function unlock(game) {
            if (games[game].locked === false) return;
            games[game].locked = false;
            return saveGames();
        }
        
        /**
         * Sets the current game.
         * Detaches any old game using the canvas and attaches the new game.
         * @param game
         */
        function setCurrentGame(game) {
            if (currentGame != null) e.fire(currentGame+'.detach');
            currentGame = game;
            if (currentGame != null) e.fire(currentGame+'.attach');
        }
        
        function getCurrentGame() {
            return currentGame;
        }
        
        function saveGames() {
            if (s.add(STORAGE_KEY, games)) {
                return true;
            }
            return false;
        }
        
        /**
         * Initializes module.
         */
        function init() {
            games = s.get(STORAGE_KEY);
            if (games === null) {
                games = defaults;
                saveGames();
            }            
        }

        return {
            init: init,
            isLocked: isLocked,
            unlock: unlock,
            setCurrentGame: setCurrentGame,
            getCurrentGame: getCurrentGame
        };
    }

});
