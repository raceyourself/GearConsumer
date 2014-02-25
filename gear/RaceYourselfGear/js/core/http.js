/*global define, console, XMLHttpRequest*/

/**
 * Ajax module
 */

define({
    name: 'core/http',
    def: function coreHttp() {
        'use strict';

        function request(options) {
            var req = new XMLHttpRequest(),
                async = null,
                url = null;

            options = options || {};
            async = typeof options.async === 'boolean' ? options.async : false;
            url = options.url !== undefined ? options.url : null;

            if (url === null) {
                console.error('Url is empty, please provide correct url.');
                return;
            }

            req.open('GET', url, async);
            req.addEventListener('load', function load() {
                if (typeof options.success === 'function') {
                    options.success(req.response);
                }
            }, false);
            req.addEventListener('error', function error(evt) {
                if (typeof options.error === 'function') {
                    options.error(evt.target.status);
                }
            }, false);
            req.send();
        }

        return {
            request: request
        };
    }
});
