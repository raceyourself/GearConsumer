/*global define, $, console, tizen*/
/*jslint regexp: true*/

/**
 * Application module
 */

define({
    name: 'models/routes',
    requires: [
        'core/storage'
    ],
    def: function modelsRoutes(s) {
        'use strict';

        var STORAGE_KEY = 'routes',
            STORAGE_COUNTER_KEY = 'routesCounter',
            routesData = [];

        /**
         * Saves user routes to local storage
         * @return {bool}
         */
        function save() {
            if (s.add(STORAGE_KEY, routesData)) {
                return true;
            }
            return false;
        }

        /**
         * Gets next id
         * @return {number}
         */
        function getNextId() {
            var currId = s.get(STORAGE_COUNTER_KEY) || routesData.length || 0,
                nextId = currId + 1;

            s.add(STORAGE_COUNTER_KEY, nextId);

            return nextId;
        }

        /**
         * Returns index for given route
         * @param {number} routeId Route id.
         * @return {number} index Index.
         */
        function getIndex(routeId) {
            var dataLen = routesData.length,
                index = -1,
                i = 0;

            for (i; i < dataLen; i += 1) {
                if (routesData[i].id === routeId) {
                    index = i;
                }
            }

            return index;
        }

        /**
         * Gets route from routes
         * @param {number} routeId Route id.
         * @return {object}
         */
        function get(routeId) {
            var index = getIndex(routeId);
            return routesData[index] || null;
        }

        /**
         * Adds route to routes
         * @param {object} timezone Timezone object.
         * @return {bool}
         */
        function add(route) {
            var dataLen = routesData.length,
                i = 0;

            for (i; i < dataLen; i += 1) {
                if (routesData[i].id === route.id) {
                    return false;
                }
            }

            route.id = getNextId();
            routesData.push(route);

            return save();
        }

        /**
         * Removes route from routes
         * @param {number} routeId Route id.
         * @return {bool}
         */
        function remove(routeId) {
            var index = getIndex(routeId);

            if (index !== -1) {
                routesData.splice(index, 1);
                return save();
            }

            return false;
        }

        /**
         * Returns list of registered routes.
         * @param {bool} [useCache=false] Indicates the use of cache.
         * @param {bool} [descending=false] Set sort order.
         */
        function getAll(useCache, descending) {
            useCache = useCache || false;
            if (useCache === false) {
                routesData = s.get(STORAGE_KEY) || [];
            }
            if (descending) {
                routesData.reverse();
            }
            return routesData;
        }

        /**
         * Gets last inserted route
         * @return {object}
         */
        function getLastInserted() {
            return routesData[routesData.length - 1] || {};
        }

        function init() {
            getAll(false);
        }

        return {
            init: init,
            add: add,
            remove: remove,
            get: get,
            getAll: getAll,
            getLastInserted: getLastInserted
        };
    }

});
