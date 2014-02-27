/*global define, $, console, tizen, webapis*/
/*jslint regexp: true*/

/**
 * Application module
 */

define({
    name: 'models/game',
    requires: [
        'core/storage'
    ],
    def: function modelsGame(storage) {
        'use strict';

        var s = storage;

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
            getDescription: getDescription
        };
    }

});
