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
        		version: 1,
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
                },
                'meteor': {
                	locked: true
                },
                'eliminator' : {
                	locked: true
                },
                'WeightLoss' : {
                	locked: true
                },
                'Endurance' : {
                	locked: true
                },
                'Strength' : {
                	locked: true
                }
            },
            STORAGE_KEY = 'games',
            currentGame,
            currentOpponent;

        function isLocked(game) {
        	var g = games[game] || defaults[game];
            return g.locked;
        }
        
        function unlock(game) {
			var g = games[game] || defaults[game];
			if (g.locked === false) return;
            games[game] = g;
            games[game].locked = false;
            e.fire('game.unlock.' + game);
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
        
        function setCurrentOpponentType(opponent) {
        	currentOpponent = opponent;
        }
        
        function getCurrentOpponentType() {
        	return currentOpponent;
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
            getCurrentGame: getCurrentGame,
            setCurrentOpponentType: setCurrentOpponentType,
            getCurrentOpponentType: getCurrentOpponentType
        };
    }

});
