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
	    	LOG_ANALYTICS = "log-analytics";

        /**
         * Send request to get the status of the GPS (enabled/disabled/ready)
         */
        function sendGpsStatusReq() {
            if (!sap.isAvailable()) {
                e.fire('gps.status', 'disabled');                
                return;
            }
            sap.sendData(
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
         * Send a 'start tracking' message to the phone
         * If GPS is ready, it will send back a gps-position-data message roughly once a second
         * after this method is called and until sendStopTrackingReq is called. 
         */
        function sendStartTrackingReq() {
            sap.sendData(
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
            sap.sendData(
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
            sap.sendData(
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
            sap.sendData(
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
         * Connect to SAP
         */
        function connect() {
            sap.connect();
            console.log('Connecting to provider..');
        }

        /**
         * Module initializer.
         */
        function init() {
            setTimeout(connect, 100); // start connecting to SAP
        }

        /************** LISTENERS *************/
        /**
         * Handler for sap init event.
         */
        function onConnection(data) {
            if (data.detail.status) {
                console.log('Connected to provider!');
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
        
        function isAvailable() {
            return sap.isAvailable();
        }

        e.listeners({
            'models.sap.init': onConnection,
            'models.sap.gps-position-data': onGpsPositionChanged,
            'models.sap.gps-status-resp': onGpsStatusChanged
        });

        return {
            init: init,
            sendGpsStatusReq: sendGpsStatusReq,
            sendStartTrackingReq: sendStartTrackingReq,
            sendStopTrackingReq: sendStopTrackingReq,
            sendAuthenticationReq: sendAuthenticationReq,
            sendAnalytics: sendAnalytics,
            isAvailable: isAvailable
        };
    }

});
