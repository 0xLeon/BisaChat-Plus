// ==UserScript==
// @name           BisaChat Plus
// @description    Add's a few more comfortable functions to BisaChat
// @version        {version}
// @author         Stefan Hahn
// @copyright      2011, Stefan Hahn
// @licence        GNU Lesser General Public License, version 2
// @namespace      http://projects.swallow-all-lies.com/greasemonkey/namsespaces/bisachat.plus
// @include        http://www.bisaboard.de/index.php?page=Chat*
// @include        http://www.bisaboard.de/?page=Chat*
// ==/UserScript==
/*
 * Copyright (C) 2011 Stefan Hahn
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

/*
 * Taken from Prototype
 * Copyright (c) 2005-2010 Sam Stephenson
 */
Object.extend = function(destination, source) {
	for (var property in source) {
		destination[property] = source[property];
	}
	
	return destination;
}


/*
 * Taken from Prototype
 * Copyright (c) 2005-2010 Sam Stephenson
 */
Object.extend(Function.prototype, (function() {
	var slice = Array.prototype.slice;
	
	function update(array, args) {
		var arrayLength = array.length;
		var length = args.length;
		
		while (length--) {
			array[arrayLength + length] = args[length];
		}
		
		return array;
	}
	
	function merge(array, args) {
		array = slice.call(array, 0);
		
		return update(array, args);
	}
	
	// --- exported functions ---
	function argumentNames() {
		var names = this.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1].replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '').replace(/\s+/g, '').split(',');
		
		return (((names.length == 1) && !names[0]) ? [] : names);
	}
	
	function bind(context) {
		if (arguments.length < 2 && (typeof arguments[0] === 'undefined')) return this;
		
		var __method = this;
		var args = slice.call(arguments, 1);
		
		return function() {
		  var a = merge(args, arguments);
		  
		  return __method.apply(context, a);
		}
	}
	
	function bindAsEventListener(context) {
		var __method = this;
		var args = slice.call(arguments, 1);
		
		return function(event) {
			var a = update([event || window.event], args);
			
			return __method.apply(context, a);
		}
	}
	
	function wrap(wrapper) {
		var __method = this;
		
		return function() {
			var a = update([__method.bind(this)], arguments);
			
			return wrapper.apply(this, a);
		}
	}
	
	function methodize() {
		if (this._methodized) return this._methodized;
		
		var __method = this;
		
		return this._methodized = function() {
			var a = update([this], arguments);
			
			return __method.apply(null, a);
		};
	}
	
	
	var returnObj = {
		argumentNames:       argumentNames,
		bindAsEventListener: bindAsEventListener,
		wrap:                wrap,
		methodize:           methodize
	};
	
	if (typeof Function.prototype.bind === 'undefined') returnObj.bind = bind;
	
	return returnObj;
})());

Object.extend(String.prototype, (function() {
	function parseAsColor() {
		var hexColor = '#';
		
		if (this.trim().indexOf('rgb') === 0) {
			this.match(/(\d){1,3}/g).forEach(function(number, index) {
				if (index > 2) return null;
				
				hexColor += ((parseInt(number, 10) < 16) ? '0' : '') + parseInt(number, 10).toString(16);
			});
			
			return hexColor;
		}
		else {
			var basic = this.toLowerCase().replace(/[^0-9a-f]/g, '');
			
			if (basic.length === 6) {
				return hexColor+basic;
			}
			else if (basic.length === 3) {
				return hexColor+basic[0]+basic[0]+basic[1]+basic[1]+basic[2]+basic[2];
			}
			else {
				return '';
			}
		}
	}
	
	return {
		parseAsColor: parseAsColor
	}
})());
