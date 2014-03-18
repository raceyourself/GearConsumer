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

function extend( newObject, base, prototype ) {
	var basePrototype = new base(),
		prop, value;
	for ( prop in prototype ) {
		if ( prototype.hasOwnProperty(prop) ) {
			value = prototype[ prop ];
			if ( typeof value === "function" ) {
				basePrototype[ prop ] = (function( prop, value ) {
					var _super = function() {
							return base.prototype[ prop ].apply( this, arguments );
						};
					return function() {
						var __super = this._super,
							returnValue;

						this._super = _super;
						returnValue = value.apply( this, arguments );
						this._super = __super;
						return returnValue;
					};
				})( prop, value );
			} else {
				basePrototype[ prop ] = value;
			}
		}
	}

	newObject.prototype = basePrototype;
	newObject.prototype.constructor = newObject;
}

var eventType = {
	CHANGE: "sectionchange"
};

function SectionChanger( elem, options ) {
	this._create( elem, options );
	return this;
}

extend(SectionChanger, Scroller, {
	_create: function( elem, options ) {

		this.sections = null;
		this.sectionPositions = [];
		this.activeIndex = 0;
		this.lastDirection = 0;
		this.direction = 0;

		this._super( elem, options );
	},

	_initOptions : function( options ) {
		options = options || {};
		options.items = options.items || "section";
		options.activeClass = options.activeClass || "section-active";
		options.circular = options.circular || false;
		options.animate = options.animate || true;
		options.animateDuration = options.animateDuration || 100;
		options.orientation = options.orientation || "horizontal";
		options.changeThreshold = options.changeThreshold || -1;

		this._super( options );
	},

	_init: function() {
		var sectionLength, i, className;

		this.sections = typeof this.options.items === "string" ?
			this.scroller.querySelectorAll( this.options.items ) :
			this.options.items;

		sectionLength = this.sections.length;

		if (  this.options.circular && sectionLength < 3 ) {
			throw "if you use circular option, you must have at least three sections.";
		}

		if ( this.activeIndex >= sectionLength ) {
			this.activeIndex = sectionLength - 1;
		}

		for( i = 0; i < sectionLength; i++ ) {
			className = this.sections[i].className;
			if ( className && className.indexOf( this.options.activeClass ) > -1 ) {
				this.activeIndex = i;
			}

			this.sectionPositions[i] = i;
		}

		this.setActiveSection( this.activeIndex );
		this._prepareLayout();
		this._super();
		this._repositionSections( true );

		// set corret options values.
		if ( !this.options.animate ) {
			this.options.animateDuration = 0;
		}
		if ( this.options.changeThreshold < 0 ) {
			this.options.changeThreshold = this.width / 5;
		}

		if ( sectionLength > 1 ) {
			this.enable();
		} else {
			this.disable();
		}
	},

	_prepareLayout: function() {
		var sectionLength = this.sections.length,
			width = this.element.offsetWidth,
			height = this.element.offsetHeight,
			orientation = this.options.orientation === "horizontal" ? Scroller.Orientation.HORIZONTAL : Scroller.Orientation.VERTICAL,
			scrollerStyle = this.scroller.style;

		// circular option is false.
		if ( orientation === Scroller.Orientation.HORIZONTAL ) {
			scrollerStyle["width"] = width * sectionLength + "px"; //set Scroller width
			scrollerStyle["height"] = height + "px"; //set Scroller width
		} else {
			scrollerStyle["width"] = width + "px"; //set Scroller width
			scrollerStyle["height"] = height * sectionLength + "px"; //set Scroller width
		}
	},

	_initLayout: function() {
		var sectionStyle = this.sections.style,
			i, sectionLength, top, left, right, bottom;

		//section element has absolute position
		for( i = 0, sectionLength = this.sections.length; i < sectionLength; i++ ){
			//Each section set initialize left position
			sectionStyle = this.sections[i].style;

			sectionStyle["position"] = "absolute";
			sectionStyle["width"] = this.width + "px";
			sectionStyle["height"] = this.height + "px";
			if ( this.orientation === Scroller.Orientation.HORIZONTAL ) {
				top = 0;
				left = this.width * i;
			} else {
				top = this.height * i;
				left = 0;
			}

			sectionStyle["top"] = top + "px";
			sectionStyle["left"] = left + "px";
		}

		this._super();
	},

	_initScrollbar: function() {
		var scrollbarType = this.options.scrollbar,
			orientation = this.options.orientation;

		if ( scrollbarType ) {
			this.scrollbar = new Scroller.Scrollbar(this.element, {
				type: scrollbarType,
				orientation: orientation,
				sections: this.sections
			});
		}
	},

	_translateScrollbar: function( x, y, duration ) {
		var offset, preOffset, fixedOffset;

		if ( !this.scrollbar ) {
			return;
		}

		if ( this.orientation === Scroller.Orientation.HORIZONTAL ) {
			preOffset = this.sectionPositions[this.activeIndex] * this.width;
			offset = this.activeIndex * this.width;
			fixedOffset = offset - preOffset;
			offset = (-x + fixedOffset) * this.width / this.scrollerWidth;
		} else {
			offset = -y * this.height / this.scrollerHeight;
		}

		this.scrollbar.translate( offset, duration );
	},

	_translateScrollbarWithPageIndex: function(pageIndex) {
		var offset;

		if ( !this.scrollbar ) {
			return;
		}

		offset = pageIndex * this.width * this.width / this.scrollerWidth;
		this.scrollbar.translate( offset );
	},

	_resetLayout: function() {
		var scrollerStyle = this.scroller.style,
			sectionStyle = this.sections.style,
			i, sectionLength;

		scrollerStyle["width"] = "";
		scrollerStyle["height"] = "";

		for( i = 0, sectionLength = this.sections.length; i < sectionLength; i++ ){
			sectionStyle = this.sections[i].style;

			sectionStyle["position"] = "";
			sectionStyle["width"] = "";
			sectionStyle["height"] = "";
			sectionStyle["top"] = "";
			sectionStyle["left"] = "";
		}

		this._super();
	},

	_bindEvents: function() {
		this._super();
		this.scroller.addEventListener( "webkitTransitionEnd", this);
	},

	_unbindEvents: function() {
		this._super();
		this.scroller.removeEventListener( "webkitTransitionEnd", this);
	},

	handleEvent: function( event ) {
		this._super( event );
		switch (event.type) {
		case "webkitTransitionEnd":
			this._endScroll();
			break;
		}
	},

	setActiveSection: function( index, duration ) {
		var activeClass = this.options.activeClass,
			section, sectionLength, position, newX, newY, i;

		sectionLength = this.sections.length;
		position = this.sectionPositions[ index ];

		if ( this.orientation === Scroller.Orientation.HORIZONTAL ) {
			newY = 0;
			newX = -this.width * position;
		} else {
			newY = -this.height * position;
			newX = 0;
		}

		this.activeIndex = index;

		for ( i=0; i < sectionLength; i++) {
			section = this.sections[i];
			section.classList.remove(activeClass);
			if (i === this.activeIndex) {
				section.classList.add(activeClass);
			}
		}

		if ( newX != this.scrollerOffsetX || newY != this.scrollerOffsetY ) {
			this._translate( newX, newY, duration);
			this._translateScrollbar( newX, newY, duration );
		} else {
			this._endScroll();
		}
	},

	getActiveSectionIndex: function() {
		return this.activeIndex;
	},

	_start: function( e, pos ) {
		this._super( e, pos );

		this.direction = 0;
		this.lastDirection = 0;
	},

	_move: function( e, pos ) {
		var beforeMoved = this.moved;

		if ( this.orientation === Scroller.Orientation.HORIZONTAL ) {
			this.lastDirection = pos.x - this.lastTouchPointX;
		} else {
			this.lastDirection = pos.y - this.lastTouchPointY;
		}

		this._super( e, pos );

		if ( beforeMoved !== this.moved) {
			if ( this.orientation === Scroller.Orientation.HORIZONTAL ) {
				this.direction = pos.x - this.startTouchPointX;
			} else {
				this.direction = pos.y - this.startTouchPointY;
			}
		}
	},

	_end: function( e ) {
		var lastX = Math.round(this.lastTouchPointX),
			lastY = Math.round(this.lastTouchPointX),
			distX = this.lastTouchPointX - this.startTouchPointX,
			distY = this.lastTouchPointX - this.startTouchPointY,
			dist = this.orientation === Scroller.Orientation.HORIZONTAL ? distX : distY,
			distanceX = Math.abs(lastX - this.startTouchPointX),
			distanceY = Math.abs(lastY - this.startTouchPointY),
			distance = this.orientation === Scroller.Orientation.HORIZONTAL ? distanceX : distanceY,
			maxDistance = this.orientation === Scroller.Orientation.HORIZONTAL ? this.maxScrollX : this.maxScrollY,
			endOffset = this.orientation === Scroller.Orientation.HORIZONTAL ? this.scrollerOffsetX : this.scrollerOffsetY,
			endTime = (new Date()).getTime(),
			duration = endTime - this.startTime,
			flick = duration < 300 && endOffset < 0 && endOffset > maxDistance && distance > this.options.flickThreshold,
			requestScrollEnd = this.initiated && ( this.moved || flick ),
			sectionLength = this.sections.length,
			changeThreshold = this.options.changeThreshold,
			cancel = !flick && changeThreshold > distance,
			newIndex=0;

		this.touching = false;

		if ( !requestScrollEnd ) {
			this._endScroll();
			return;
		}

		if ( !cancel && dist < 0 && this.direction < 0 && this.lastDirection < 0 ) {
			newIndex = this.activeIndex + 1;
		} else if ( !cancel && dist > 0 && this.direction > 0 && this.lastDirection > 0 ){
			newIndex = this.activeIndex - 1;
		} else {
			// canceled
			newIndex = this.activeIndex;
		}

		if (this.options.circular) {
			newIndex = (sectionLength + newIndex) % sectionLength;
		} else {
			newIndex = newIndex < 0 ? 0 : (newIndex > sectionLength - 1 ? sectionLength - 1 : newIndex);
		}

		this.setActiveSection( newIndex, this.options.animateDuration );
	},

	_endScroll: function() {
		this._repositionSections();
		this._fireEvent( eventType.CHANGE, {
			active: this.activeIndex
		});
		this._super();
	},

	_repositionSections: function( init ) {
		// if developer set circular option is true, this method used when webkitTransitionEnd event fired
		var sectionLength = this.sections.length,
			curPosition = this.sectionPositions[this.activeIndex],
			centerPosition = window.parseInt(sectionLength/2, 10),
			circular = this.options.circular,
			i, sectionStyle, sIdx, top, left, newX, newY;

		if ( this.orientation === Scroller.Orientation.HORIZONTAL ) {
			newX = -(this.width * ( circular ? centerPosition : this.activeIndex) );
			newY = 0;
		} else {
			newX = 0;
			newY = -(this.height * ( circular ? centerPosition : this.activeIndex) );
		}

		if ( init || ( curPosition === 0 || curPosition === sectionLength - 1) ) {

			this._translate( newX, newY );
			this._translateScrollbarWithPageIndex(this.activeIndex);

			if ( circular ) {
				for ( i = 0; i < sectionLength; i++ ) {
					sIdx = ( sectionLength + this.activeIndex - centerPosition + i ) % sectionLength;
					sectionStyle = this.sections[ sIdx ].style;

					this.sectionPositions[sIdx] = i;

					if ( this.orientation === Scroller.Orientation.HORIZONTAL ) {
						top = 0;
						left = this.width * i;
					} else {
						top = this.height * i;
						left = 0;
					}

					sectionStyle["top"] = top + "px";
					sectionStyle["left"] = left + "px";
				}
			}
		}
	},

	_clear: function() {
		this._super();
		this.sectionPositions.length = 0;
	}
});

window.SectionChanger = SectionChanger;

})(this);
