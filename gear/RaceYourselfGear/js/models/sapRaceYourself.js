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

/*global define, console, setTimeout*/
/*jslint regexp: true*/

/**
 * SAP module
 */

define({
    name: 'models/sapRaceYourself',
    requires: [
        'core/event',
        'models/sap'
    ],
    def: function modelsSAPRaceYourself(e, sap) {
        'use strict';

        var SAP_CHANNEL = 104,
	        MESSAGE_TYPE = "message-type",
	    	GPS_STATUS_REQ = "gps-status-req",
	    	GPS_STATUS_RESP = "gps-status-resp",
	    	GPS_POSITION_DATA = "gps-position-data",
	    	START_TRACKING_REQ = "start_tracking-req",
	    	STOP_TRACKING_REQ = "stop-tracking-req",
	    	AUTHENTICATION_REQ = "authentication-req",
	    	LOG_ANALYTICS = "log-analytics",
	    	LOG_TO_ADB = "log-to-adb",
	    	WEB_LINK_REQ = "web-link-req",
	    	REMOTE_CONFIGURATION_REQ = "remote-configuration-req",
	    	REMOTE_CONFIGURATION_RESP = "remote-configuration-resp";

        /**
         * Send request to get the status of the GPS (enabled/disabled/ready)
         */
        function sendGpsStatusReq() {
            if (!sap.isAvailable()) {
                e.fire('gps.status', 'disabled');                
                return false;
            }
            return sap.sendData(
                SAP_CHANNEL,
                {
                    messageType: GPS_STATUS_REQ
                },
                {
                    silent: true
                }
            );
        }

        /**
         * Send request to get the remote configuration
         */
        function sendRemoteConfigurationReq() {
            if (!sap.isAvailable()) {
                return false;
            }
            return sap.sendData(
                SAP_CHANNEL,
                {
                    messageType: REMOTE_CONFIGURATION_REQ
                },
                {
                    silent: true
                }
            );
        }

        /**
         * Send a 'start tracking' message to the phone
         * If GPS is ready, it will send back a gps-position-data message roughly once a second
         * after this method is called and until sendStopTrackingReq is called. 
         */
        function sendStartTrackingReq() {
            return sap.sendData(
                SAP_CHANNEL,
                {
                    messageType: START_TRACKING_REQ
                },
                {
                    silent: true
                }
            );
        }
        
        /**
         * Send a 'stop tracking' message to the phone
         * This will stop recording the user's position and stop sending gps-position-data messages  
         */
        function sendStopTrackingReq() {
            return sap.sendData(
                SAP_CHANNEL,
                {
                    messageType: STOP_TRACKING_REQ
                },
                {
                    silent: true
                }
            );
        }
        
        /**
         * Send an authentication request - the phone may pop up and ask the
         * user to register / authenticate 
         */
        function sendAuthenticationReq() {
            return sap.sendData(
                SAP_CHANNEL,
                {
                    messageType: AUTHENTICATION_REQ
                },
                {
                    silent: true
                }
            );
        }
        
        /**
         * Send analytics to be logged and synced to server
         * Parameter is a JS object which will be serialised to JSON and stored. 
         */
        function sendAnalytics(value) {
            return sap.sendData(
                SAP_CHANNEL,
                {
                    messageType: LOG_ANALYTICS,
                    value: JSON.stringify(value)
                },
                {
                    silent: true
                }
            );
        }
        
        /**
         * Send message to be logged to ADB
         * level is one of "VERBOSE", "DEBUG", "INFO", "WARNING", "ERROR"
         * message is a string
         */
        function logToAdb(level, message) {
        	if (!sap.isAvailable()) {
                return false;
            }
        	return sap.sendData(
                SAP_CHANNEL,
                {
                    messageType: LOG_TO_ADB,
                    logLevel: level,
                    logMessage: "RaceYourselfGearConsumer: " + message
                },
                {
                    silent: true
                }
            );
        }
        
        /**
         * Send web link to be displayed on the phone
         * Parameter is a string URI 
         */
        function sendWebLinkReq(value) {
            sap.sendData(
                SAP_CHANNEL,
                {
                    messageType: WEB_LINK_REQ,
                    URI: value
                },
                {
                    silent: true
                }
            );
        }

        /**
         * Connect to SAP
         */
        function connect() {
            sap.connect();
            console.log('Connecting to provider..');
            logToAdb("DEBUG","Conecting to SAP now!");
        }

        /**
         * Module initializer.
         */
        function init() {
            setTimeout(connect, 100); // start connecting to SAP
            logToAdb("DEBUG","Conecting to SAP in 100ms");
        }

        /************** LISTENERS *************/
        /**
         * Handler for sap init event.
         */
        function onConnection(data) {
            if (data.detail.status) {
                console.log('Connected to provider!');
                sendRemoteConfigurationReq();
            }
        }

        /**
         * Fired on incoming GPS position data
         */
        function onGpsPositionChanged(data) {
            var message = data.detail.message;
            var distance = message.GPS_DISTANCE;  // cumulative distance covered whilst tracking
            var time = message.GPS_TIME;    // cumulative time spent tracking in milliseconds
            var speed = message.GPS_SPEED;  // current speed in metres per second
            var state = message.GPS_STATE;  // string describing stopped / accelerating / steady speed etc
            e.fire('gps.location', message);
        }
        
        /**
         * Fired on incoming GPS status
         */
        function onGpsStatusChanged(data) {
            var message = data.detail.message;            
            var status = message.GPS_STATUS_KEY;  // String ["enabled","disabled","ready"]
            e.fire('gps.status', status);
        }
        
        /**
         * Fired on incoming remote configuration
         */
        function onRemoteConfiguration(data) {
            var message = data.detail.message;
            var configuration = message.CONFIGURATION;
            e.fire('configuration.update', configuration);
        }
        
        function isAvailable() {
            return sap.isAvailable();
        }

        e.listeners({
            'models.sap.init': onConnection,
            'models.sap.gps-position-data': onGpsPositionChanged,
            'models.sap.gps-status-resp': onGpsStatusChanged,
            'models.sap.remote-configuration-resp': onRemoteConfiguration
        });

        return {
            init: init,
            sendGpsStatusReq: sendGpsStatusReq,
            sendStartTrackingReq: sendStartTrackingReq,
            sendStopTrackingReq: sendStopTrackingReq,
            sendAuthenticationReq: sendAuthenticationReq,
            sendWebLinkReq: sendWebLinkReq,
            sendAnalytics: sendAnalytics,
            logToAdb: logToAdb,
            isAvailable: isAvailable,
            connect: connect
        };
    }

});
