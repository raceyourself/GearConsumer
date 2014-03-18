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

(function(window, undefined) {
	'use strict';

// scroller.start event trigger when user try to move scroller
var eventType = {
	// scroller.move event trigger when scroller start
	START: "scrollstart",
	// scroller.move event trigger when scroller move
	//MOVE: "scroller.move",
	// scroller.move event trigger when scroller end
	END: "scrollend",
	// scroller.move event trigger when scroller canceled
	CANCEL: "scrollcancel",
};

var	Scroller = function ( elem, options ) {
	if ( arguments.length ) {
		this._create( elem, options );
	}
	return this;
};

Scroller.Orientation = {
	VERTICAL: 1,
	HORIZONTAL: 2
};

Scroller.prototype = {
	_create: function( elem, options ) {
		this.element = elem;
		this.options = {};

		if ( this.element.children.length !== 1 ) {
			throw "scroller has only one child.";
		}

		this.scroller = this.element.children[0];
		this.scrollerStyle = this.scroller.style;

		this.scrollbar = null;

		this.width = 0;
		this.height = 0;

		this.scrollerWidth = 0;
		this.scrollerHeight = 0;
		this.scrollerOffsetX = 0;
		this.scrollerOffsetY = 0;

		this.maxScrollX = 0;
		this.maxScrollY = 0;

		this.startTouchPointX = 0;
		this.startTouchPointY = 0;
		this.startScrollerOffsetX = 0;
		this.startScrollerOffsetY = 0;

		this.lastVelocity = 0;
		this.lastEstimatedPoint = 0;

		this.lastTouchPointX = -1;
		this.lastTouchPointY = -1;

		this.orientation;

		this.initiated = false;
		this.enabled = true;
		this.scrolled = false;
		this.moved = false;
		this.scrollCanceled = false;

		this.startTime;

		this._initOptions( options );
		this._bindEvents();
		this._init();
	},

	_initOptions: function( options ) {
		this.options = {
			scrollDelay: 300,
			threshold: 10,
			minThreshold: 5,
			flickThreshold: 30,
			scrollbar: false,
			orientation: "vertical",		// vertical or horizontal,
			// TODO implement scroll momentum.
			momentum: true
		};

		this.setOptions( options );
	},

	_init: function() {
		this.width = this.element.offsetWidth;
		this.height = this.element.offsetHeight;

		this.scrollerWidth = this.scroller.offsetWidth;
		this.scrollerHeight = this.scroller.offsetHeight;

		this.maxScrollX = this.width - this.scrollerWidth;
		this.maxScrollY = this.height - this.scrollerHeight;

		this.orientation = this.options.orientation === "horizontal" ? Scroller.Orientation.HORIZONTAL : Scroller.Orientation.VERTICAL;

		this.initiated = false;
		this.scrolled = false;
		this.moved = false;
		this.touching = true;
		this.scrollCanceled = false;

		if ( this.orientation === Scroller.Orientation.HORIZONTAL ) {
			this.maxScrollY = 0;
			this.scrollerHeight = this.height;
		} else {
			this.maxScrollX = 0;
			this.scrollerWidth = this.width;
		}

		this._initLayout();
		this._initScrollbar();
	},

	_initLayout: function() {
		var elementStyle = this.element.style;

		elementStyle.overflow = "hidden";
		elementStyle.position = "relative";
	},

	_initScrollbar: function() {
		var scrollbarType = this.options.scrollbar,
			orientation = this.options.orientation;

		if ( scrollbarType ) {
			this.scrollbar = new Scroller.Scrollbar(this.element, {
				type: scrollbarType,
				orientation : orientation
			});
		}
	},

	_resetLayout: function() {
		var elementStyle = this.element.style;

		elementStyle.overflow = "";
		elementStyle.position = "";
	},

	_bindEvents: function( ) {
		if ('ontouchstart' in window) {
			this.scroller.addEventListener( "touchstart", this);
			this.scroller.addEventListener( "touchmove", this);
			this.scroller.addEventListener( "touchend", this);
			this.scroller.addEventListener( "touchcancel", this);
		} else {
			this.scroller.addEventListener( "mousedown", this);
			document.addEventListener( "mousemove", this);
			document.addEventListener( "mouseup", this);
			document.addEventListener( "mousecancel", this);
		}

		window.addEventListener( "resize", this);
	},

	_unbindEvents: function() {
		if ('ontouchstart' in window) {
			this.scroller.removeEventListener( "touchstart", this);
			this.scroller.removeEventListener( "touchmove", this);
			this.scroller.removeEventListener( "touchend", this);
			this.scroller.removeEventListener( "touchcancel", this);
		} else {
			this.scroller.removeEventListener( "mousedown", this);
			document.removeEventListener( "mousemove", this);
			document.removeEventListener( "mouseup", this);
			document.removeEventListener( "mousecancel", this);
		}

		window.removeEventListener( "resize", this);
	},

	handleEvent: function( event ) {
		var pos = this._getPointPositionFromEvent( event );

		switch (event.type) {
		case "mousedown":
		case "touchstart":
			this._start( event, pos );
			break;
		case "mousemove":
		case "touchmove":
			this._move( event, pos );
			break;
		case "mouseup":
		case "touchend":
			this._end( event, pos );
			break;
		case "mousecancel":
		case "touchcancel":
			this.cancel( event );
			break;
		case "resize":
			this.refresh();
		}
	},

	setOptions: function (options) {
		var name;
		for ( name in options ) {
			if ( options.hasOwnProperty(name) && !!options[name] ) {
				this.options[name] = options[name];
			}
		}
	},

	refresh: function () {
		this._clear();
		this._init();
	},

	scrollTo: function( x, y, duration ) {
		this._translate( x, y, duration );
		this._translateScrollbar( x, y, duration );
	},

	_translate: function( x, y, duration ) {
		var translate,
			transition,
			scrollerStyle = this.scrollerStyle;

		if ( !duration ) {
			transition = "none";
		} else {
			transition = "-webkit-transform " + duration / 1000 + "s ease-out";
		}
		translate = "translate3d(" + x + "px," + y + "px, 0)";

		this.scrollerOffsetX = window.parseInt(x, 10);
		this.scrollerOffsetY = window.parseInt(y, 10);

		scrollerStyle["-webkit-transform"] = translate;
		scrollerStyle["-webkit-transition"] = transition;
	},

	_translateScrollbar: function( x, y, duration ) {
		var offset;

		if ( !this.scrollbar ) {
			return;
		}

		if ( this.orientation === Scroller.Orientation.HORIZONTAL ) {
			offset = -x * this.width / this.scrollerWidth;
		} else {
			offset = -y * this.height / this.scrollerHeight;
		}

		this.scrollbar.translate( offset, duration );
	},

	_getEstimatedCurrentPoint: function( current, last ) {
		var velocity,
			timeDifference = 15, /* pause time threshold.. tune the number to up if it is slow */
			estimated;

		if (last === current) {
			this.lastVelocity = 0;
			this.lastEstimatedPoint = current;
			return current;
		}

		velocity = ( current - last ) / 22; /*46.8 s_moveEventPerSecond*/
		estimated = current + ( timeDifference * velocity );

		// Prevent that point goes back even though direction of velocity is not changed.
		if ( (this.lastVelocity  * velocity >= 0)
				&& (!velocity || (velocity < 0 && estimated > this.lastEstimatedPoint)
				|| (velocity > 0 && estimated < this.lastEstimatedPoint)) ) {
			estimated = this.lastEstimatedPoint;
		}

		this.lastVelocity = velocity;
		this.lastEstimatedPoint = estimated;

		return estimated;
	},

	_getPointPositionFromEvent: function ( ev ) {
		return ev.type.search(/^touch/) !== -1 && ev.touches && ev.touches.length ?
				{x: ev.touches[0].clientX, y: ev.touches[0].clientY} :
				{x: ev.clientX, y: ev.clientY};
	},

	_start: function( e, pos ) {
		if ( this.initiated || !this.enabled ) {
			return;
		}

		this.startTime = (new Date()).getTime();

		this.startTouchPointX = pos.x;
		this.startTouchPointY = pos.y;
		this.startScrollerOffsetX = this.scrollerOffsetX;
		this.startScrollerOffsetY = this.scrollerOffsetY;
		this.lastTouchPointX = pos.x;
		this.lastTouchPointY = pos.y;

		this.initiated = true;
		this.scrollCanceled = false;
		this.scrolled = false;
		this.moved = false;
		this.touching = true;
	},

	_move: function( e, pos ) {
		var timestamp	= (new Date()).getTime(),
			scrollDelay = this.options.scrollDelay || 0,
			threshold = this.options.threshold || 0,
			minThreshold = this.options.minThreshold || 0,
			distX = this.startTouchPointX - pos.x,
			distY = this.startTouchPointY - pos.y,
			absDistX = Math.abs( distX ),
			absDistY = Math.abs( distY ),
			maxDist = Math.max( absDistX, absDistY ),
			absDist = this.orientation === Scroller.Orientation.HORIZONTAL ? absDistX : absDistY,
			newX, newY;

		if ( !this.initiated || !this.touching || this.scrollCanceled ) {
			return;
		}

		this.lastTouchPointX = pos.x;
		this.lastTouchPointY = pos.y;

		// We need to move at least 10 pixels, delay 300ms for the scrolling to initiate
		if ( !this.scrolled &&
				( maxDist < minThreshold ||
						( maxDist < threshold && ( !scrollDelay || timestamp - this.startTime < scrollDelay ) ) ) ) {
			//e.preventDefault();
			return;
		}

		if ( !this.scrolled ) {
			switch ( this.orientation ) {
			case Scroller.Orientation.HORIZONTAL:
				if ( absDistX < absDistY ) {
					this.cancel();
					return;
				}
				break;
			case Scroller.Orientation.VERTICAL:
				if ( absDistY < absDistX ) {
					this.cancel();
					return;
				}
				break;
			}

			this._fireEvent( eventType.START );

			this.startTouchPointX = pos.x;
			this.startTouchPointY = pos.y;
		}

		this.scrolled = true;

		if ( this.orientation === Scroller.Orientation.HORIZONTAL ) {
			newX = this.startScrollerOffsetX + this._getEstimatedCurrentPoint( pos.x, this.lastTouchPointX ) - this.startTouchPointX;
			newY = this.startScrollerOffsetY;
		} else {
			newX = this.startScrollerOffsetX;
			newY = this.startScrollerOffsetY + this._getEstimatedCurrentPoint( pos.y, this.lastTouchPointY ) - this.startTouchPointY;
		}

		if ( newX > 0 || newX < this.maxScrollX ) {
			newX = newX > 0 ? 0 : this.maxScrollX;
		}
		if ( newY > 0 || newY < this.maxScrollY ) {
			newY = newY > 0 ? 0 : this.maxScrollY;
		}

		if ( newX != this.scrollerOffsetX || newY != this.scrollerOffsetY ) {
			this.moved = true;
			this._translate( newX, newY );
			this._translateScrollbar( newX, newY );
			// TODO to dispatch move event is too expansive. it is better to use callback.
			//this._fireEvent( eventType.MOVE );
		}
		e.preventDefault(); //this function make overflow scroll don't used
	},

	_end: function( e ) {
		var lastX = Math.round(this.lastTouchPointX),
			lastY = Math.round(this.lastTouchPointY),
			distanceX = Math.abs(lastX - this.startTouchPointX),
			distanceY = Math.abs(lastY - this.startTouchPointY),
			distance = this.orientation === Scroller.Orientation.HORIZONTAL ? distanceX : distanceY,
			maxDistance = this.orientation === Scroller.Orientation.HORIZONTAL ? this.maxScrollX : this.maxScrollY,
			endOffset = this.orientation === Scroller.Orientation.HORIZONTAL ? this.scrollerOffsetX : this.scrollerOffsetY,
			requestScrollEnd = this.initiated && this.scrolled,
			endTime, duration, momentumX, momentumY;

		this.touching = false;

		if ( !requestScrollEnd || this.scrollCanceled ) {
			this.initiated = false;
			return;
		}

		if ( !this.moved ) {
			this._endScroll();
			return;
		}

		endTime = (new Date()).getTime();
		duration = endTime - this.startTime;

		// start momentum animation if needed
		if ( this.options.momentum &&
				duration < 300 &&
				( endOffset < 0 && endOffset > maxDistance ) &&
				( distance > this.options.flickThreshold )) {
			this._startMomentumScroll();
		} else {
			this._endScroll();
		}

		e.preventDefault();
	},

	_endScroll: function() {
		if ( this.scrolled ) {
			this._fireEvent( eventType.END );
		}

		this.moved = false;
		this.scrolled = false;
		this.scrollCanceled = false;
		this.initiated = false;
	},

	cancel: function() {
		this.scrollCanceled = true;

		if ( this.initiated ) {
			this._translate( this.startScrollerOffsetX, this.startScrollerOffsetY );
			this._translateScrollbar( this.startScrollerOffsetX, this.startScrollerOffsetY );
			this._fireEvent( eventType.CANCEL );
		}

		this.initiated = false;
		this.scrolled = false;
		this.moved = false;
		this.touching = false;
	},

	// TODO implement _startMomentumScroll method
	_startMomentumScroll: function() {
		this._endMomentumScroll();
	},

	_endMomentumScroll: function() {
		this._endScroll();
	},

	_fireEvent: function(eventName, detail) {
		var evt = new CustomEvent(eventName, {
				"bubbles": true,
				"cancelable": true,
				"detail": detail
			});
		this.element.dispatchEvent(evt);
	},

	_clear: function() {
		this.initiated = false;
		this.scrolled = false;
		this.moved = false;
		this.scrollCanceled = false;
		this.touching = false;

		this._resetLayout();

		if ( this.scrollbar ) {
			this.scrollbar.destroy();
		}
		this.scrollbar = null;
	},

	disable: function () {
		this.enabled = false;
	},

	enable: function () {
		this.enabled = true;
	},

	destroy: function() {
		this._clear();
		this._unbindEvents();

		this.scrollerStyle = null;
		this.scroller = null;
	}
}

window.Scroller = Scroller;

})(this);
