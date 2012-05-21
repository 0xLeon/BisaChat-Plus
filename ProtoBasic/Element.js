/* 
 * Extended Element functions
 * Copyright (C) 2011-2012 Stefan Hahn
 * 
 * Based on Prototype
 * Copyright (c) 2005-2010 Sam Stephenson
 */
(function() {
	var Offset = new ClassSystem.Class({
		initialize: function(left, top) {
			this.left = Math.round(left);
			this.top = Math.round(top);

			this[0] = this.left;
			this[1] = this.top;
		},

		relativeTo: function(offset) {
			return new Element.Offset(this.left - offset.left, this.top - offset.top);
		},

		inspect: function() {
			return '<Element.Offset left: ' + this.left.toString() + ' top: ' + this.top.toString() + '>';
		},

		toString: function() {
			return '[' + this.left.toString() + ', ' + this.top.toString() + ']';
		},

		toArray: function() {
			return [this.left, this.top];
		}
	});
	
	function Element(tagName, attributes) {
		attributes = attributes || {};
		tagName = tagName.toLowerCase();
		
		if (!ELEMENT_CACHE[tagName]) ELEMENT_CACHE[tagName] = document.createElement(tagName);
		
		var node = ELEMENT_CACHE[tagName].cloneNode(false);
		
		return Element.writeAttribute(node, attributes);
	}
	
	function writeAttribute(element, name, value) {
		// element = $(element);
		var attributes = {};
		var table = ATTRIBUTE_TRANSLATIONS.write;
		
		if (typeof name === 'object') {
			attributes = name;
		}
		else {
			attributes[name] = Object.isUndefined(value) ? true : value;
		}
		
		for (var attr in attributes) {
			name = table.names[attr] || attr;
			value = attributes[attr];
			
			if (table.values[attr]) {
				name = table.values[attr](element, value);
			}
			else if ((value === false) || (value === null)) {
				element.removeAttribute(name);
			}
			else if (value === true) {
				element.setAttribute(name, name);
			}
			else {
				element.setAttribute(name, value);
			}
		}
		
		return element;
	}
	
	function descendantOf(element, ancestor) {
		// element = $(element);
		// ancestor = $(ancestor);
		
		return ((element.compareDocumentPosition(ancestor) & 8) === 8);
	}
	
	function getStyle(element, style) {
		// element = $(element);
		style = normalizeStyleName(style);
		var value = element.style[style];
		
		if (!value || (value === 'auto')) {
			var css = document.defaultView.getComputedStyle(element, null);
			
			value = ((css) ? (css[style]) : (null));
		}

		if (style === 'opacity') {
			return ((value) ? (parseFloat(value)) : (1.0));
		}
		
		return ((value === 'auto') ? (null) : (value));

	}
	
	function cumulativeOffset(element) {
		// element = $(element);
		var valueT = 0;
		var valueL = 0;
		
		if (element.parentNode) {
			do {
				valueT += element.offsetTop || 0;
				valueL += element.offsetLeft || 0;
				element = element.offsetParent;
			} while (element);
		}
		
		return new Element.Offset(valueL, valueT);
	}
	
	function cumulativeScrollOffset(element) {
		// element = $(element);
		var valueT = 0;
		var valueL = 0;
		
		do {
			valueT += element.scrollTop || 0;
			valueL += element.scrollLeft || 0;
			element = element.parentNode;
		} while (element);
		
		return new Element.Offset(valueL, valueT);
	}
	
	function viewportOffset(forElement) {
		var valueT = 0;
		var valueL = 0;
		var docBody = document.body;
		var element = /*$(*/forElement/*)*/;
		
		do {
			valueT += element.offsetTop || 0;
			valueL += element.offsetLeft || 0;
			
			if ((element.offsetParent == docBody) && (Element.getStyle(element, 'position') == 'absolute')) {
				break;
			}
		} while (element = element.offsetParent);
		
		element = forElement;
		do {
			if (element != docBody) {
				valueT -= element.scrollTop || 0;
				valueL -= element.scrollLeft || 0;
			}
		} while (element = element.parentNode);
		
		return new Element.Offset(valueL, valueT);
	}
	
	function normalizeStyleName(style) {
		if ((style === 'float') || (style === 'styleFloat')) {
			return 'cssFloat';
		}
		
		return style.camelize();
	}
	
	var ELEMENT_CACHE = {};
	var ATTRIBUTE_TRANSLATIONS = {
		write: {
			names: {
				'class':	'class',
				className:	'class',
				'for':		'for',
				htmlFor:	'for',
				cellpadding:	'cellPadding',
				cellspacing:	'cellSpacing',
				colspan:	'colSpan',
				rowspan:	'rowSpan',
				valign:		'vAlign',
				datetime:	'dateTime',
				accesskey:	'accessKey',
				tabindex:	'tabIndex',
				enctype:	'encType',
				maxlength:	'maxLength',
				readonly:	'readOnly',
				longdesc:	'longDesc',
				frameborder:	'frameBorder'
			},
			
			values: {
				checked: function(element, value) {
					element.checked = !!value;
				},
				
				style: function(element, value) {
					element.style.cssText = value ? value : '';
				}
			}
		}
	};
	
	Object.extend(Element, {
		Offset:			Offset,
		
		writeAttribute:		writeAttribute,
		getStyle:		getStyle,
		cumulativeOffset:	cumulativeOffset,
		cumulativeScrollOffset:	cumulativeScrollOffset,
		viewportOffset:		viewportOffset
	});
	
	var oldElement = window.Element;
	window.Element = Element;
	
	Object.extend(window.Element, oldElement || {});
	if (oldElement) window.Element.prototype = oldElement.prototype;
})();
