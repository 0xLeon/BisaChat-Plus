/* 
 * Extended Element functions
 * Copyright (C) 2011-2012 Stefan Hahn
 * 
 * Based on Prototype
 * Copyright (c) 2005-2010 Sam Stephenson
 */
(function() {
	var ELEMENT_CACHE = {};
	function Element(tagName, attributes) {
		attributes = attributes || {};
		tagName = tagName.toLowerCase();
		
		if (!ELEMENT_CACHE[tagName]) ELEMENT_CACHE[tagName] = document.createElement(tagName);
		
		var node = ELEMENT_CACHE[tagName].cloneNode(false);
		
		return Element.writeAttribute(node, attributes);
	}
	
	function writeAttribute(element, name, value) {
		//element = $(element);
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
		writeAttribute:	writeAttribute
	});
	
	var oldElement = window.Element;
	window.Element = Element;
	
	Object.extend(window.Element, oldElement || {});
	if (oldElement) window.Element.prototype = oldElement.prototype;
})();
