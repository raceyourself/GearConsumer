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
    name: 'views/page/lockedgame',
    requires: [
        'core/event',
        'models/game'
    ],
    def: function viewsPageLockedGame(req) {
        'use strict';

        var e = req.core.event,
            page = null,
            game = req.models.game;

        function show() {
            gear.ui.changePage('#lockedgame');
        }

        function onPageShow() {
            e.listen('tizen.back', onBack);
            var headerEl = document.getElementById('lockedgame-title'),
                contentEl = document.getElementById('lockedgame-content');
            
            headerEl.innerHTML = game.getTitle();
            contentEl.innerHTML = '<img src="' + game.getImage() + '"/><br/>' + game.getDescription();
        }
        
        function onPageHide() {
            e.die('tizen.back', onBack);
        }
        
        function onBack() {
            history.back();
        }
        
        function onPurchaseGameClick() {
            game.unlock();
            console.warn('Game unlocked')
        }
        
        function bindEvents() {
            var purchaseEl = document.getElementById('purchasegame');
            
            page.addEventListener('pageshow', onPageShow);
            page.addEventListener('pagehide', onPageHide);
            purchaseEl.addEventListener('click', onPurchaseGameClick);
        }

        function init() {
            page = document.getElementById('lockedgame');
            bindEvents();
        }

        e.listeners({
            'lockedgame.show': show
        });

        return {
            init: init
        };
    }

});
