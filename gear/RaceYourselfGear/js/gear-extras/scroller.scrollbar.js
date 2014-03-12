/*
  * Copyright (c) 2013 Samsung Electronics Co., Ltd
  *
  * Licensed under the Flora License, Version 1.1 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *     http://floralicense.org/license/
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

(function(window, Scroller, undefined) {
	'use strict';

	var extend = function() {
			var options, name,
				target = arguments[0] || {},
				i, length = arguments.length;

		for ( i = 1 ; i < length; i++ ) {
			if ( (options = arguments[ i ]) != null ) {
				for ( name in options ) {
					if ( options.hasOwnProperty(name) && !!options[name] ) {
						target[ name ] = options[ name ];
					}
				}
			}
		}
		return target;
	};

Scroller.Scrollbar = function( scrollElement, options ) {

	this.element = null;
	this.barElement = null;

	this.container = null;
	this.clip = null;

	this.options = {};
	this.type = null;

	this.started = false;
	this.displayDelayTimeoutId = null;

	this._create( scrollElement, options );
};

Scroller.Scrollbar.prototype = {
	_create: function( scrollElement, options ) {
		this.container = scrollElement;
		this.clip = scrollElement.children[0];

		this._initOptions(options);
		this._init();
	},

	_initOptions: function( options ) {
		options = extend({
			type: false,
			displayDelay: 700,
			sections: null
		}, options);

		this.setOptions( options );
	},

	_init: function() {
		var type = this.options.type,
			orientation = this.options.orientation;

		// TODO we must implement vertical mode.
		if ( !type || orientation == "vertical" ) {
			return;
		} 

		this.type = Scroller.Scrollbar.Type[type];
		if ( !this.type ) {
			throw "Bad options. [type : " + this.options.type + "]";
		}

		this.total = this.clip.offsetWidth;
		this.item = this.container.offsetWidth;

		this._createScrollbar();
	},

	_createScrollbar: function() {
		var sections = this.options.sections,
			wrapper = document.createElement("DIV"),
			bar = document.createElement("span"),
			containerWidth = this.container.offsetWidth,
			containerHeight = this.container.offsetHeight,
			clipWidth = this.clip.offsetWidth,
			clipHeight = this.clip.offsetHeight,
			height, i, len;

		wrapper.appendChild(bar);

		this.type.insertAndDecorate(wrapper, bar, this.container, this.clip, sections);

		this.element = wrapper;
		this.barElement = bar;
	},

	_removeScrollbar: function() {
		if (!this.element) {
			this.element.parentNode.removeChild(this.element);
		}

		this.element = null;
		this.barElement = null;
	},

	setOptions: function (options) {
		extend(this.options, options);
	},

	refresh: function () {
		this.clear();
		this.init();
	},

	translate: function( offset, duration ) {
		var translate, transition, barStyle, endDelay;

		if ( !this.element ) {
			return;
		}

		barStyle = this.barElement.style;

		if ( !duration ) {
			transition = "none";
		} else {
			transition = "-webkit-transform " + duration / 1000 + "s ease-out";
		}
		translate = "translate3d(" + offset + "px," + 0 + "px, 0)";

		barStyle["-webkit-transform"] = translate;
		barStyle["-webkit-transition"] = transition;

		if ( !this.started ) {
			if ( this.type ) {
				this.type.start(this.element, this.barElement);
			}
		}

		this.started = true;

		if ( this.displayDelayTimeoutId !== null ) {
			window.clearTimeout( this.displayDelayTimeoutId );
		}

		endDelay = ( duration || 0 ) + this.options.displayDelay;

		this.displayDelayTimeoutId = window.setTimeout(function() {
			this.started = false;
			this.displayDelayTimeoutId = null;

			if ( this.type ) {
				this.type.end(this.element, this.barElement);
			}
		}.bind(this), endDelay);
	},

	_end : function() {
	},

	_clear: function() {
		this._removeScrollbar();

		this.type = null;
		this.element = null;
	},

	destroy: function() {
		this._clear();

		this.options = null;
		this.container = null;
		this.clip = null;
		this.element = null;
		this.barElement = null;
		this.displayDelayTimeoutId = null;
	}
};

Scroller.Scrollbar.Type = {};

//interface Scroller.Indicator.Type 
Scroller.Scrollbar.Type.Interface = {
	decorate: function( wrapper, bar, container, clip ) {},
	start: function( scrollbarElement, barElement ) {},
	end: function( scrollbarElement, barElement ) {}
};

Scroller.Scrollbar.Type["bar"] = extend( {}, Scroller.Scrollbar.Type.Interface, {
	options: {
		wrapperClass: "scrollbar-over-type",
		barClass: "scrollbar-indicator",
		animationDuration: 500
	},

	insertAndDecorate: function(scrollbarElement, barElement, container, clip, sections) {
		var containerWidth = container.offsetWidth,
			containerHeight = container.offsetHeight,
			clipWidth = clip.offsetWidth,
			clipHeight = clip.offsetHeight,
			barStyle = barElement.style,
			height, i, len;

		scrollbarElement.className = this.options.wrapperClass;
		barElement.className = this.options.barClass;

		barStyle.width = window.parseInt( containerWidth / (clipWidth/containerWidth)  ) + "px";
		barStyle.left = "0px";

		container.appendChild(scrollbarElement);
	},

	start: function( scrollbarElement, barElement ) {
		var style = scrollbarElement.style,
		duration = this.options.animationDuration;
		style["-webkit-transition"] = "opacity " + duration / 1000 + "s ease";
		style["opacity"] = 1;
	},

	end: function( scrollbarElement, barElement ) {
		var style = scrollbarElement.style,
		duration = this.options.animationDuration;
		style["-webkit-transition"] = "opacity " + duration / 1000 + "s ease";
		style["opacity"] = 0;
	}
});

Scroller.Scrollbar.Type["tab"] = extend( {}, Scroller.Scrollbar.Type.Interface, {
	options: {
		wrapperClass: "scrollbar-bar-type",
		barClass: "scrollbar-indicator"
	},

	insertAndDecorate: function(scrollbarElement, barElement, container, clip, sections) {
		var containerWidth = container.offsetWidth,
			containerHeight = container.offsetHeight,
			clipWidth = clip.offsetWidth,
			clipHeight = clip.offsetHeight,
			height, i, len;

		scrollbarElement.className = this.options.wrapperClass;
		barElement.className = this.options.barClass;

		scrollbarElement.style.width = containerWidth;
		barElement.style.width = window.parseInt( containerWidth / (clipWidth/containerWidth)  ) + "px";
		barElement.style.left = "0px";

		container.insertBefore(scrollbarElement, clip);

		// reset page container and section layout.
		height = clipHeight - barElement.offsetHeight;
		clip.style.height = height + "px";
		if ( sections && sections.length ) {
			for ( i=0, len=sections.length; i <len; i++ ) {
				sections[i].style.height = height + "px";
			}
		}
	}
});

})(this, Scroller);
