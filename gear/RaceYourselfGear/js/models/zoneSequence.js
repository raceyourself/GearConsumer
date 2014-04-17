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
    name: 'models/zoneSequence',
    requires: [
        'core/event',
        'core/storage',
        'helpers/units'
    ],
    def: function modelsZoneSequence(req) {
        'use strict';

        var e = req.core.event,
            s = req.core.storage,
            units = req.helpers.units;
        
        function getOngoingRace() {
            return ongoingRace;
            this.looping = true;
        }        
        
//        function getRaceHistory() {
//            return s;
//        }
        
        /**
         * Constructor
         */
        function Sequence() {
        	
        	this.zones = [],
        	this.currentZoneIndex = 0
        }

        Sequence.prototype = {
			addZone: function addZone(zone) {
				this.zones.push(zone);
			},
			
			nextZone: function nextZone() {
				this.currentZoneIndex++;
				if(this.currentZoneIndex < this.zones.length)
				{
					return this.zones[this.currentZoneIndex];
				}
				else
				{
					if(this.looping)
					{
						this.currentZoneIndex = 0;
						return this.zones[this.currentZoneIndex];
					}
					else
					{
						return null;
					}
				}
			},
			
			addSubSequence: function addSubSequence(seq, repeats) {
				for(var i=0; i<repeats; i++)
				{
					this.zones = this.zones.concat(seq.zones);
				}
			},
			
			restart: function restart() {
				this.currentZoneIndex = -1;
			},
			
			setLooping: function setLooping(looping) {
				this.looping = looping;
			}
		
		}
            
        
        e.listeners({
        });
        
        return {
            Sequence: Sequence,
        };
        
        
    }

});
