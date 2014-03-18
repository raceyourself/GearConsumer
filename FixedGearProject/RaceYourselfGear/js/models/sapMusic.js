/*global define, console, setTimeout*/
/*jslint regexp: true*/

/**
 * SAP module
 */

define({
    name: 'models/sapMusic',
    requires: [
        'core/event',
        'models/sap'
    ],
    def: function modelsSAPMusic(e, sap) {
        'use strict';

        var SAP_CHANNEL = 100,
            SAP_MUSIC_REMOTE_CONTROL_REQ = 'music-remotecontrol-req',
            SAP_MUSIC_REMOTE_CONTROL_REQ_STATUS_PRESSED = 'pressed',
            SAP_MUSIC_REMOTE_CONTROL_REQ_STATUS_RELEASED = 'released',
            SAP_MUSIC_REMOTE_CONTROL_REQ_STATUS_BOTH = 'both',
            SAP_MUSIC_SET_ATTR_REQ = 'music-setattribute-req',
            SAP_MUSIC_SET_ATTR_REQ_OBJECT = {
                msgId: SAP_MUSIC_SET_ATTR_REQ,
                volume: 'nochange',
                repeat: 'nochange',
                shuffle: 'nochange',
                mute: 'nochange'
            },
            SAP_MUSIC_GET_ATTR_REQ = 'music-getattribute-req',
            SAP_MUSIC_MEDIA_CHANGED_REQ = 'music-mediachanged-req',
            SAP_RESULT_FAILURE = 'failure';

        /**
         * Send request to enable/disable media change indicator.
         * @param {Boolean} value State of media change indicator
         */
        function sendMediaChangedRequest(value) {
            sap.sendData(
                SAP_CHANNEL,
                {
                    msgId: SAP_MUSIC_MEDIA_CHANGED_REQ,
                    value: value
                },
                {
                    silent: true
                }
            );
        }

        /**
         * Send get attribute request.
         */
        function sendGetAttrRequest() {
            sap.sendData(
                SAP_CHANNEL,
                {
                    msgId: SAP_MUSIC_GET_ATTR_REQ
                },
                {
                    silent: true
                }
            );
        }

        /**
         * Extends obj of extender properties if obj doesn't have that property.
         * @param {Object} obj
         * @param {Object} extender
         */
        function extend(obj, extender) {
            var key;
            for (key in extender) {
                if (
                    extender.hasOwnProperty(key) &&
                        !obj.hasOwnProperty(key)
                ) {
                    obj[key] = extender[key];
                }
            }
            return obj;
        }

        /**
         * Build request parameters for music set attribute.
         * @param {String} key
         * @param {String} value
         */
        function createSetAttrRequestObject(key, value) {
            var attrs = {};
            if (typeof key === 'object') {
                attrs = key;
            } else {
                attrs[key] = value;
            }
            return extend(attrs, SAP_MUSIC_SET_ATTR_REQ_OBJECT);
        }

        /**
         * Send set attribute request.
         * @param {String} attr Attribute name
         * @param {String} value
         */
        function sendSetAttrRequest(attr, value) {
            sap.sendData(
                SAP_CHANNEL,
                createSetAttrRequestObject(attr, value)
            );
        }

        /**
         * Build request parameters for music remote control.
         * @param {String} id Message ID
         * @param {String} action
         * @param {String} status
         */
        function createRemoteControlRequestObject(id, action, status) {
            return {
                msgId: id,
                action: action,
                status: status
            };
        }

        /**
         * Send request for music remote control.
         * @param {String} action
         * @param {String} status
         */
        function sendRemoteControlRequest(action, status) {
            status = status || SAP_MUSIC_REMOTE_CONTROL_REQ_STATUS_BOTH;
            if (
                status === SAP_MUSIC_REMOTE_CONTROL_REQ_STATUS_PRESSED ||
                    status === SAP_MUSIC_REMOTE_CONTROL_REQ_STATUS_BOTH
            ) {
                sap.sendData(
                    SAP_CHANNEL,
                    createRemoteControlRequestObject(
                        SAP_MUSIC_REMOTE_CONTROL_REQ,
                        action,
                        SAP_MUSIC_REMOTE_CONTROL_REQ_STATUS_PRESSED
                    ),
                    {
                        silent: true
                    }
                );
            }
            if (
                status === SAP_MUSIC_REMOTE_CONTROL_REQ_STATUS_RELEASED ||
                     status === SAP_MUSIC_REMOTE_CONTROL_REQ_STATUS_BOTH
            ) {
                sap.sendData(
                    SAP_CHANNEL,
                    createRemoteControlRequestObject(
                        SAP_MUSIC_REMOTE_CONTROL_REQ,
                        action,
                        SAP_MUSIC_REMOTE_CONTROL_REQ_STATUS_RELEASED
                    )
                );
            }
        }

        /************** PUBLIC METHODS *************/
        /**
         * Send play or pause request to host.
         */
        function playpause() {
            sendRemoteControlRequest(
                'playpause',
                SAP_MUSIC_REMOTE_CONTROL_REQ_STATUS_BOTH
            );
        }

        /**
         * Send stop request to host.
         */
        function stop() {
            sendRemoteControlRequest(
                'stop',
                SAP_MUSIC_REMOTE_CONTROL_REQ_STATUS_BOTH
            );
        }

        /**
         * Send forward request to host.
         */
        function forward() {
            sendRemoteControlRequest(
                'forward',
                SAP_MUSIC_REMOTE_CONTROL_REQ_STATUS_BOTH
            );
        }

        /**
         * Send backward request to host,
         * first call will rewind song to beginning,
         * second call will change song to previous one.
         */
        function backward() {
            sendRemoteControlRequest(
                'backward',
                SAP_MUSIC_REMOTE_CONTROL_REQ_STATUS_BOTH
            );
        }

        /**
         * Send fastforward press request to host.
         */
        function fastforwardPress() {
            sendRemoteControlRequest(
                'fastforward',
                SAP_MUSIC_REMOTE_CONTROL_REQ_STATUS_PRESSED
            );
        }

        /**
         * Send fastforward release request to host.
         */
        function fastforwardRelease() {
            sendRemoteControlRequest(
                'fastforward',
                SAP_MUSIC_REMOTE_CONTROL_REQ_STATUS_RELEASED
            );
        }

        /**
         * Send rewind press request to host.
         */
        function rewindPress() {
            sendRemoteControlRequest(
                'rewind',
                SAP_MUSIC_REMOTE_CONTROL_REQ_STATUS_PRESSED
            );
        }

        /**
         * Send rewind press request to host.
         */
        function rewindRelease() {
            sendRemoteControlRequest(
                'rewind',
                SAP_MUSIC_REMOTE_CONTROL_REQ_STATUS_RELEASED
            );
        }

        /**
         * Send get attributes info request to host.
         */
        function getAttributes() {
            sendGetAttrRequest();
        }

        /**
         * Send request to change volume up on host.
         */
        function volumeUp() {
            sendSetAttrRequest('volume', 'up');
        }

        /**
         * Send request to change volume down on host.
         */
        function volumeDown() {
            sendSetAttrRequest('volume', 'down');
        }

        /**
         * Send request to enable/disable media-change indicator on host.
         */
        function mediaChangeInfo(value) {
            sendMediaChangedRequest(value);
        }

        /**
         * Connect to SAP
         */
        function connect() {
            sap.connect();
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
                // if connection was established properly
                // request host to send media change information
                mediaChangeInfo(true);
            }
        }

        /**
         * Handler for media change response event.
         */
        function onMediaChanged(data) {
            var message = data.detail.message;
            if (message.result === SAP_RESULT_FAILURE) {
                console.error(
                    'Set media change indicator failed: ',
                    message.reason
                );
            }
        }

        /**
         * Handler for media set attributes response event.
         */
        function onSetAttribute(data) {
            var message = data.detail.message;
            if (message.result === SAP_RESULT_FAILURE) {
                console.error(
                    'Set media change attr failed: ',
                    message.reason
                );
            }
        }

        e.listeners({
            'models.sap.init': onConnection,
            'models.sap.music-mediachanged-rsp': onMediaChanged,
            'models.sap.music-setattribute-rsp': onSetAttribute
        });

        return {
            init: init,
            playpause: playpause,
            stop: stop,
            forward: forward,
            backward: backward,
            fastforwardPress: fastforwardPress,
            fastforwardRelease: fastforwardRelease,
            rewindPress: rewindPress,
            rewindRelease: rewindRelease,
            getAttributes: getAttributes,
            volumeUp: volumeUp,
            volumeDown: volumeDown,
            mediaChangeInfo: mediaChangeInfo
        };
    }

});
