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
    name: 'models/application',
    requires: [
        'core/event'
    ],
    def: function modelsApplication(e) {
        'use strict';

        var app = null,
            APP_CONTROL_URL = 'http://tizen.org/appcontrol/',
            dimTimeout = false,
            screenState = false;

        function getCurrentApplication() {
            return app.getCurrentApplication();
        }

        /**
         * @param {object} params Control data params.
         */
        function getAppControlUri(operation) {
            return APP_CONTROL_URL + operation;
        }

        function getId() {
            return getCurrentApplication().appInfo.id;
        }

        /**
         * @param {object} params Control data params.
         */
        function launchAppControl(params) {
            var controlData = params.detail,
                control = new tizen.ApplicationControl(
                    getAppControlUri(controlData.operation),
                    null,
                    controlData.mime
                ),
                callback = {
                    onsuccess: function onsuccess(data) {
                        var i = 0,
                            newData = [],
                            dataKey = getAppControlUri(controlData.key);

                        for (i; i < data.length; i = i + 1) {
                            if (data[i].key === dataKey) {
                                newData.push(data[i]);
                            }
                        }
                        e.fire(controlData.listener, newData);
                    }
                };

            try {
                app.launchAppControl(control, null, null, null, callback);
            } catch (e) {
                console.error(e.message);
            }
        }

        /**
         * Creates ApplicationControl object
         * @param {string} operation Action to be performed.
         */
        function createApplicationControl(operation) {
            return new tizen.ApplicationControl(getAppControlUri(operation));
        }

        /**
         * Close application
         */
        function closeApplication() {
        	e.fire('application.exit');
        	setTimeout(function() {
        		getCurrentApplication().exit();
        	}, 1);
        }

        function setScreenState(state) {
        	if (state !== 'SCREEN_DIM') {
        		clearTimeout(dimTimeout);
        		dimTimeout = setTimeout(onDim, 15000);
        	}
        	if (screenState === state) return;
        	console.log('Setting screen state to: ' + state);
            if (typeof tizen !== 'undefined' && typeof tizen.power !== 'undefined') {
            	if (screenState) tizen.power.release("SCREEN", screenState);
            	tizen.power.request("SCREEN", state);
            	screenState = state;
            }
        }
        
        function onDim() {
        	setScreenState('SCREEN_DIM');
        }
        
        function init() {}

        function noop() {}

        e.listeners({
            'models.application.launchAppControl': launchAppControl,
            'models.application.exit': closeApplication
        });

        if (typeof tizen !== 'undefined' &&
                typeof tizen.application !== 'undefined') {
            app = tizen.application;
        } else {
            console.warn(
                'tizen or tizen.application not available, using a mock instead'
            );
            app = {
                launchAppControl: noop,
                getCurrentApplication: function getApp() {
                    return {
                        getRequestedAppControl: noop,
                        close: noop,
                        hide: noop,
                        exit: function() {
                            console.error('Mock "closing" application..');
                            gear.ui.changePage('#closing');
                            setTimeout(function() {
                                window.location.reload(true);
                            }, 1000);
                        }
                    };
                }
            };
        }


        return {
            init: init,
            getId: getId,
            getCurrentApplication: getCurrentApplication,
            getAppControlUri: getAppControlUri,
            createApplicationControl: createApplicationControl,
            closeApplication: closeApplication,
            setScreenState: setScreenState
        };
    }

});
