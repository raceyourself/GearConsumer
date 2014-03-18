/*global define, $, console, window, document, history, gear, event*/

/**
 * History page module
 */

define({
    name: 'views/page/history',
    requires: [
        'core/event',
        'core/template',
        'models/routes',
        'helpers/date',
        'helpers/route'
    ],
    def: function viewsPageHistory(req) {
        'use strict';

        var e = req.core.event,
            t = req.core.template,
            d = req.helpers.date,
            r = req.helpers.route,
            routes = req.models.routes,
            page = null,
            list = null;

        function show() {
            gear.ui.changePage('#history');
        }

        function getListElements() {
            var routeList = routes.getAll(false, true),
                i,
                len = routeList.length,
                listElements = [],
                element,
                routeName = '';

            for (i = 0; i < len; i += 1) {
                element = routeList[i];
                routeName = r.getRouteName(element);

                listElements.push(
                    t.get('routeRow', {
                        id: element.id,
                        steps: element.steps,
                        time: element.time,
                        name: routeName
                    })
                );
            }

            return listElements;
        }

        function listElements() {
            var elements = getListElements();
            list.innerHTML = elements.join('');
        }

        function onPageShow() {
            listElements();
        }

        function onElementTap(ev) {
            var li;
            ev.preventDefault();
            ev.stopPropagation();
            li = event.target;
            while (li && li.tagName &&
                    !(li.tagName.toLowerCase() === 'li' ||
                    li.tagName.toLowerCase() === 'ul')) {
                li = li.parentElement;
            }
            if (li.tagName.toLowerCase() === 'li') {
                e.fire('details.show', {
                    id: li.getAttribute('data-id'),
                    steps: li.getAttribute('data-steps'),
                    time: li.getAttribute('data-time'),
                    fromHashChange: false
                });
            }
        }

        function bindEvents() {
            page.addEventListener('pageshow', onPageShow);
            list.addEventListener('click', onElementTap);
        }

        function init() {
            page = document.getElementById('history');
            list = document.getElementById('history-list');
            bindEvents();
        }

        e.listeners({
            'history.show': show
        });

        return {
            init: init
        };
    }

});
