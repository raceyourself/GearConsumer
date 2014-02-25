/*global define, setInterval, window*/

define({
    name: 'models/mocks/pedometer',
    def: function pedometerMock() {
        'use strict';

        var pedometerInfo = null,
            changeListeners = [],

        /**
         * 1. Type Definitions
         */

        /**
         * 1.1. PedometerStepStatus
         *
         * Defines a step status of a person to use pedometer.
         *
         * @type {PedometerStepStatus}
         */
            PedometerStepStatus = {
                NOT_MOVING: 'NOT_MOVING',
                MARKING: 'MARKING',
                STROLLING: 'STROLLING',
                WALKING: 'WALKING',
                RUNNING: 'RUNNING',
                RUSHING: 'RUSHING',
                WALKING_UP: 'WALKING_UP',
                WALKING_DOWN: 'WALKING_DOWN',
                RUNNING_UP: 'RUNNING_UP',
                RUNNING_DOWN: 'RUNNING_DOWN',
                UNKOWN: 'UNKOWN'
            };

        /**
         * 2. Interfaces
         */

        /**
         * 2.3. PedometerInfo
         *
         * @type {PedometerInfo}
         */
        function PedometerInfo() {
            // assuming:
            // speed in m/s
            // frequency in steps per minute
            // distance in meters

            this.stepStatus = PedometerStepStatus.UNKOWN;
            this.speed = 0;
            this.walkingFrequency = 0;
            this.cumulativeDistance = 0;
            this.cumulativeCalorie = 0;
            this.cumulativeTotalStepCount = 0;
            this.cumulativeWalkStepCount = 0;
            this.cumulativeWalkUpStepCount = 0;
            this.cumulativeWalkDownStepCount = 0;
            this.cumulativeRunStepCount = 0;
            this.cumulativeRunUpStepCount = 0;
            this.cumulativeRunDownStepCount = 0;
        }

        /**
         * 2.1. PedometerManagerObject
         *
         * This interface defines what is instantiated by the Tizen object from
         * the Tizen Platform. The sec.pedometer object allows access to the
         * pedometer data.
         *
         * @type {PedometerManager}
         */
        function PedometerManager() {
            var statuses = Object.keys(PedometerStepStatus);

            pedometerInfo = new PedometerInfo();

            statuses.pop(); // pop the 'UNKOWN' status

            function notifyListeners() {
                var changeListener = null, i = changeListeners.length;
                while (i--) {
                    changeListener = changeListeners[i];
                    if (typeof changeListener === 'function') {
                        changeListener(pedometerInfo);
                    }
                }
            }

            /**
             * Update status to a random one
             */
            function randomizeStatus() {
                var randomIndex, previousStatus = pedometerInfo.stepStatus;

                // 'NOT_MOVING' should be more common than only 10%
                if (Math.random() < 0.3) {
                    pedometerInfo.stepStatus = PedometerStepStatus.NOT_MOVING;
                } else {
                    randomIndex = Math.floor(Math.random() * statuses.length);

                    pedometerInfo.stepStatus = PedometerStepStatus[
                        statuses[randomIndex]
                    ];
                }

                if (pedometerInfo.stepStatus ===
                        PedometerStepStatus.NOT_MOVING &&
                        previousStatus !==
                        PedometerStepStatus.NOT_MOVING) {
                    pedometerInfo.speed = 0;
                    pedometerInfo.walkingFrequency = 0;
                    notifyListeners();
                }
                
                console.log('Mock pedometer state: ' + pedometerInfo.stepStatus);
            }

            /**
             * Generate current step length based on the status
             */
            function getStepLength() {
                switch (pedometerInfo.stepStatus) {
                case PedometerStepStatus.RUSHING:
                    return 2;
                case PedometerStepStatus.WALKING:
                case PedometerStepStatus.WALKING_DOWN:
                case PedometerStepStatus.WALKING_UP:
                    return 0.6;
                case PedometerStepStatus.STROLLING:
                    return 0.4;
                case PedometerStepStatus.NOT_MOVING:
                    return 0;
                }
                return 1; // running
            }

            function getStepCalories(speed) {
                var calories = 0;

                // magic formula for calories burnt
                calories += Math.pow(speed, 3);
                calories -= 2 * Math.pow(speed, 2);
                calories += 11 * speed;
                calories += 1;
                calories *= 70; // weight
                calories *= 0.43 / 3600; // time of the step in hours

                return calories;
            }

            /**
             * Pretend there was one step done - update data
             */
            function step() {
                var stepLength = getStepLength();

                switch (pedometerInfo.stepStatus) {
                case PedometerStepStatus.RUNNING:
                    pedometerInfo.cumulativeRunStepCount += 1;
                    break;
                case PedometerStepStatus.RUNNING_DOWN:
                    pedometerInfo.cumulativeRunStepCount += 1;
                    pedometerInfo.cumulativeRunDownStepCount += 1;
                    break;
                case PedometerStepStatus.RUNNING_UP:
                    pedometerInfo.cumulativeRunStepCount += 1;
                    pedometerInfo.cumulativeRunUpStepCount += 1;
                    break;
                case PedometerStepStatus.WALKING:
                    pedometerInfo.cumulativeWalkStepCount += 1;
                    break;
                case PedometerStepStatus.WALKING_DOWN:
                    pedometerInfo.cumulativeWalkStepCount += 1;
                    pedometerInfo.cumulativeWalkDownStepCount += 1;
                    break;
                case PedometerStepStatus.WALKING_UP:
                    pedometerInfo.cumulativeWalkStepCount += 1;
                    pedometerInfo.cumulativeWalkUpStepCount += 1;
                    break;
                case PedometerStepStatus.STROLLING:
                    pedometerInfo.cumulativeWalkStepCount += 1;
                    break;
                }
                pedometerInfo.cumulativeTotalStepCount++;

                pedometerInfo.cumulativeDistance += stepLength;
                pedometerInfo.speed = stepLength / 0.43; // length / 0.43s

                pedometerInfo.cumulativeCalorie +=
                        getStepCalories(pedometerInfo.speed);

                if (pedometerInfo.stepStatus !==
                        PedometerStepStatus.NOT_MOVING) {
                    pedometerInfo.walkingFrequency = 1 / 0.43; // 1 / 0.43s
                    notifyListeners();
                } else {
                    pedometerInfo.walkingFrequency = 0;
                }
            }

            /**
             * @param {PedometerInfoSuccessCallback} successCallback
             * @param {ErrorCallback?} errorCallback
             */
            function getPedometerInfo(successCallback) {
                if (typeof successCallback !== 'function') {
                    throw new Error(
                        'getPedometerInfo param must be a function'
                    );
                }
                successCallback(pedometerInfo);
            }

            /**
             * Listener must accept PedometerInfo parameter
             *
             * @param {PedometerInfoSuccessCallback} listener
             * @return {int}
             */
            function setChangeListener(listener) {
                changeListeners.push(listener);
                return changeListeners.length - 1;
            }

            /**
             *
             * @param {int} id
             */
            function unsetChangeListener(id) {
                if (changeListeners[id]) {
                    changeListeners[id] = null;
                }
            }

            function init() {

                // every 10 seconds randomly update the status
                randomizeStatus();
                setInterval(randomizeStatus, 10000);
                // assume a step always lasts the same amount of time...
                setInterval(step, 430);
            }

            this.getPedometerInfo = getPedometerInfo;
            this.setChangeListener = setChangeListener;
            this.unsetChangeListener = unsetChangeListener;

            // Initialize PedometerManager
            init();
        }

        /**
         * Initializes the module
         */
        function init() {
            if (window.webapis === undefined) {
                window.webapis = {};
            }
            window.webapis.pedometer = new PedometerManager();
        }
        return {
            init: init
        };
    }
});
