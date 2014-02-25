/*global window, document, console, $*/

(function core(window, document) {
    'use strict';

    /**
     * Public object.
     * @type {object}
     */
    var wa = {},

        /**
         * Head element.
         * @type {HTMLHeadElement}
         */
        head = document.getElementsByTagName('head')[0],

        /**
         * Internal object cache
         * @type {object}
         */
        modules = {};

    /**
     * Generic Module class.
     * @constructor
     */
    function Module(name) {
        this.name = name;
        return;
    }

    /**
     * Have all dependencies deps been sorted already?
     * @param {array} deps Dependencies.
     * @param {array} sorted Sorted dependencies.
     * @return {bool} result.
     */
    function areSorted(deps, sorted) {
        var i = 0,
            depsLen = deps.length,
            result = true;
        for (i = 0; i < depsLen; i += 1) {
            // Has mod been sorted already?
            result = result && (sorted.indexOf(deps[i]) !== -1);
        }
        return result;
    }

    /**
     * Sort modules by dependencies (dependents last),
     * returning sorted list of module names.
     * @param {object} modules Modules.
     */
    function sort(modules) {

        var name = null,
            // Modules to be sorted.
            pending = [],
            // Modules already sorted.
            sorted = [],
            // Remember length of pending list for each module.
            beenHere = {},
            m = null;

        for (name in modules) {
            if (modules.hasOwnProperty(name)) {
                if (modules[name].instance) {
                    // Already linked.
                    sorted.push(name);
                } else {
                    // Sort for linking.
                    pending.push(name);
                }
            }
        }

        // Repeat while there are modules pending.
        while (pending.length > 0) {

            // Consider the next pending module
            m = pending.shift();

            // If we've been here and have not made any progress, we are looping
            // (no support for cyclic module dependencies).
            if (beenHere[m] && beenHere[m] <= pending.length) {
                throw ('Can\'t sort dependencies: ' +
                    sorted + ' < ' + m + ' < ' + pending);
            }
            beenHere[m] = pending.length;

            // Consider the current module's import dependencies.
            if (areSorted(modules[m].requires, sorted)) {
                // Dependencies done, module done.
                sorted.push(m);
            } else {
                // Some dependencies still pending.
                pending.push(m);
            }
        }

        return sorted;
    }

    /**
     * Merge the contents of two objects into the first object.
     * @param {Object} target Target object (child).
     * @param {Object} source Source object (parent).
     * @return {Object} Target object.
     */
    function extend(target, source) {
        var prop = null;
        for (prop in source) {
            if (source.hasOwnProperty(prop)) {
                Object.defineProperty(
                    target,
                    prop,
                    {
                        value: source[prop]
                    }
                );
            }
        }
        return target;
    }

    /**
     * Creates an object using the passed constructor and parameters.
     *
     * @param {function} Def Constructing function.
     * @param {array} a Parameters for the constructing function.
     */
    function instantiate(Def, a) {
        var argsLen = a.length,
            obj = null;

        /**
         * Create the object using Def as a constructor.
         * In this case the object inherits Def.prototype.
         * Switch/case is used for performance reasons.
         */
        switch (argsLen) {
        case 0:
            obj = new Def();
            break;
        case 1:
            obj = new Def(a[0]);
            break;
        case 2:
            obj = new Def(a[0], a[1]);
            break;
        case 3:
            obj = new Def(a[0], a[1], a[2]);
            break;
        case 4:
            obj = new Def(a[0], a[1], a[2], a[3]);
            break;
        case 5:
            obj = new Def(a[0], a[1], a[2], a[3], a[4]);
            break;
        case 6:
            obj = new Def(a[0], a[1], a[2], a[3], a[4], a[5]);
            break;
        case 7:
            obj = new Def(a[0], a[1], a[2], a[3], a[4], a[5], a[6]);
            break;
        default:
            obj = Object.create(Def.prototype);
            // Here we get a plain object anyway.
            obj = Def.apply(obj, a);
        }

        // Constructors don't have to return anything.
        if (!obj) {
            obj = {};
        }
        // Modules return plain objects, we need to fix this.
        // Create an object with a valid prototype
        // and extend it by copying properties from the original object.
        obj = extend(
            Object.create(Def.prototype),
            obj
        );

        return obj;
    }

    /**
     * Assigns nested attributes.
     * @param {object} obj Object.
     * @param {array} pathElements Elements array.
     * @param {object} value Object.
     */
    function assignNested(obj, pathElements, value) {
        var i, key = pathElements.pop();
        // Check the path.
        for (i = 0; i < pathElements.length; i += 1) {
            // If empty create an empty object here.
            obj = obj[pathElements[i]] = obj[pathElements[i]] || {};
        }
        obj[key] = value;
    }

    /**
     * Creates paramateres (from required modules).
     * Parameteres are passed to the constructor.
     * @param {function} Def Module definition (constructor).
     * @param {array} requires Modules requires.
     * @return {array} params.
     */
    function createParams(Def, requires) {
        var params = [],
            req = {},
            instance = null,
            i = 0;

        if (Def.length === 1 && requires.length > 1) {
            // Collect requires as object.
            for (i = requires.length - 1; i >= 0; i -= 1) {
                instance = modules[requires[i]].instance;

                // Full name keys for array-like indexing.
                req[requires[i]] = instance;

                // Nested objects for cleaner syntax.
                assignNested(req, requires[i].split('/'), instance);
            }
            params.push(req);

        } else if (Def.length === requires.length) {
            // Collect requires as modules.
            for (i = requires.length - 1; i >= 0; i -= 1) {
                params[i] = modules[requires[i]].instance;
            }

        } else if (Def.length !== 0) {
            // Invalid number of params.
            // Definition module params length is greater than zero
            // and different than requires params length.
            throw new Error(
                'Invalid number of params in ' + Def.name +
                    '- expected ' + requires.length + ' but is ' + Def.length
            );
        }

        return params;
    }

    /* build:app */
    function initDebug() {
        if (typeof window.debug === 'object') {
            window.debug.init(modules);
        }
    }
    /* endbuild:app */

    /**
     * Links and runs modules in the order in which they were loaded.
     */
    function link() {
        console.log('Linking modules');
        var i = 0,
            sorted = [],
            sortedLen = 0,
            name = '',
            module = null;

        // Sort modules in dependency order.
        sorted = sort(modules);
        sortedLen = sorted.length;

        // Link modules in dependency order.
        for (i = 0; i < sortedLen; i += 1) {
            name = sorted[i];
            module = modules[name];

            if (module.instance === undefined) {

                // Each module should inherit from a generic Module object.
                module.def.prototype = new Module(name);

                // Execute module code, pass requires, record exports.
                modules[name].instance = instantiate(
                    module.def,
                    createParams(module.def, module.requires)
                );

                // Set module name
                modules[name].instance.name = name;

                if (typeof modules[name].instance.init === 'function') {
                    modules[name].instance.init();
                }
            }
        }
        /* build:app */
        initDebug();
        /* endbuild:app */
    }

    /**
     * Loads module
     * @param {string} moduleName Module name.
     */
    function load(moduleName) {
        var script = null;

        if (modules[moduleName] !== undefined) {
            return false;
        }

        modules[moduleName] = {};

        script = document.createElement('script');
        script.setAttribute('src', 'js/' + moduleName + '.js');
        script.addEventListener('error', function error() {
            throw new Error(
                'Failed to load "' + moduleName + '" module'
            );
        });
        script.addEventListener('load', function error() {
            console.log('Module loaded: ' + moduleName);
        });
        head.appendChild(script);

        return true;
    }

    /**
     * Check whether this was the last module to be loaded
     * in a given dependency group.
     * If yes, start linking and running modules.
     */
    function loaded() {
        var m = null,
            pending = [];

        for (m in modules) {
            if (modules.hasOwnProperty(m) && modules[m].name === undefined) {
                pending.push(m);
            }
        }

        if (pending.length === 0) {
            console.log('All modules loaded');
            link();
        }
    }

    /**
     * The function that handles definitions of modules.
     *
     * @param {object} module Module object.
     * @param {string} module.name Module name.
     * @param {array?} module.requires Module requires.
     * @param {function} module.def Module definititon.
     *
     * Examples:
     *
     * Define `foo` module:
     * define({
     *     name: 'foo',
     *     def: function () {}
     * });
     *
     * Define `foo` module which require `bar` module:
     * define({
     *     name: 'foo',
     *     requires: ['bar1', 'bar2'],
     *     def: function (b1, b2) {}
     * });
     *
     * Define `foo` module which require `bar1` and `bar2` module:
     * define({
     *     name: 'foo',
     *     requires: ['bar1', 'bar2'],
     *     def: function (require) {
     *         var bar1 = require['bar1'],
     *             bar2 = require['bar2'];
     *     }
     * });
     *
     */
    function define(module) {
        var i = 0,
            j = 0;

        module = module || {};
        console.log('Define ' + module.name);

        if (module.name === undefined || module.def === undefined) {
            throw new Error(
                'Module must have name and definititon'
            );
        }

        if (modules[module.name] !== undefined &&
                modules[module.name].name !== undefined) {
            throw new Error(
                'Module "' + module.name + '" is already defined'
            );
        }

        module.requires = module.requires || [];
        modules[module.name] = module;

        // Load required modules.
        for (i = 0, j = module.requires.length; i < j; i += 1) {
            load(module.requires[i]);
        }

        // Check for loaded modules.
        loaded();

        return true;
    }

    wa = {
        define: define
    };

    extend(window, wa);

}(window, document));
