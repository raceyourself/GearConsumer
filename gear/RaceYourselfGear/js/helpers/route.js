/*global define, tizen*/
/*jslint plusplus: true */

/**
 * Route helper module
 */

define({
    name: 'helpers/route',
    requires: [
        'helpers/date'
    ],
    def: function helpersRoute(date) {
        'use strict';

        /**
         * Returns route name.
         * @param {object} route
         * @return {string}
         */
        function getRouteName(route) {
            var routeName = null,
                routeDate = null;

            if (route.date) {
                routeDate = new Date(route.date);
                routeName = date.format(routeDate, 'HH:MM ddd, d mmm');
            } else {
                routeName = route.id;
            }

            return routeName;
        }

        return {
            getRouteName: getRouteName
        };
    }
});
