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
    name: 'views/page/historypage',
    requires: [
        'core/event',
        'core/storage',
        'models/racedata',
        'models/settings',
        'models/sapRaceYourself'
    ],
    def: function viewsPageHistoryPage(req) {
        'use strict';

        var e = req.core.event,
        	s = req.core.storage,
            provider = req.models.sapRaceYourself,
            racedata = req.models.racedata,
            settings = req.models.settings,
            page = null,
            list = null;

        function show() {
            gear.ui.changePage('#historypage');            
        }
        
        function onPageShow() {
            e.listen('tizen.back', onBack);
            
            addHistory();
        }
        
        function addHistory() {
        	for(var i=0; i < settings.getCurrentHistoryCount(); i++) {
        		var currentHistory = s.get(racedata.getStorageKey() + i);
                if (currentHistory === null) {
                	console.log('error finding history');
                    break;
                }
                var entry = document.createElement('li');
                entry.appendChild(document.createTextNode(currentHistory.date));
                var linebreak = document.createElement('br');
                entry.appendChild(linebreak);
                entry.appendChild(document.createTextNode(currentHistory.timeofrace));
                var linebreak = document.createElement('br');
                entry.appendChild(linebreak);
                entry.appendChild(document.createTextNode(currentHistory.type));
                var linebreak = document.createElement('br');
                entry.appendChild(linebreak);
                entry.appendChild(document.createTextNode(currentHistory.overallpoints.toFixed('0') + ' SP'));
                entry.setAttribute('id', i);
                entry.setAttribute('class', 'li-has-multiline history-list');
                entry.addEventListener('click', onListItemClick);
                list.appendChild(entry);
        	}
        	
        	var i = list.childNodes.length;
        	while(i--) {
        		list.appendChild(list.childNodes[i]);
        	}
        }

        function onPageHide() {
            e.die('tizen.back', onBack);
            list.innerHTML = '';
        }
        
        function onBack() {
            history.back();
        }

        function bindEvents() {
            page.addEventListener('pageshow', onPageShow);
            page.addEventListener('pagehide', onPageHide);
           
            list = document.getElementById('historylist');
        }
        
        function onListItemClick(event) {
        	console.log(this.id);
        	
        	e.fire('racesummary.show', s.get(racedata.getStorageKey() + this.id));
        }

        function init() {
            page = document.getElementById('historypage');
            bindEvents();
        }
        
        e.listeners({
            'historypage.show': show
        });
        
        return {
            init: init
        };
    }

});
