/*global define, $, console, window, document, history, gear*/

/**
 * Delete page module
 */

define({
    name: 'views/page/delete',
    requires: [
        'core/event',
        'models/routes',
        'helpers/route'
    ],
    def: function viewsPageDelete(req) {
        'use strict';

        var e = req.core.event,
            routes = req.models.routes,
            r = req.helpers.route,
            page = null,
            routeName,
            yesButton,
            noButton,
            route;

        /**
         * Uses received params and shows delete page.
         * @param {object} params
         */
        function show(params) {
            route = params.detail.route;
            routeName.innerHTML = r.getRouteName(route);

            gear.ui.changePage('#delete', {fromHashChange: true});
        }

        /**
         * Handles tap event on Yes button.
         */
        function onDelete(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            if (routes.remove(route.id)) {
                e.fire('details.show', {id: route.id});
            }
        }

        /**
         * Handles tap event on No button.
         */
        function onBack(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            gear.ui.changePage('#details', {fromHashChange: true});
        }

        /**
         * Handles pageshow event.
         */
        function onPageShow() {
        }

        /**
         * Binds events.
         */
        function bindEvents() {
            page.addEventListener('pageshow', onPageShow);
            yesButton.addEventListener('click', onDelete);
            noButton.addEventListener('click', onBack);
        }

        /**
         * Initializes module.
         */
        function init() {
            page = document.getElementById('delete');
            routeName = page.getElementsByClassName('name')[0];
            yesButton = page.getElementsByClassName('yes')[0];
            noButton = page.getElementsByClassName('no')[0];
            bindEvents();
        }

        e.listeners({
            'delete.route': show
        });

        return {
            init: init
        };
    }

});
