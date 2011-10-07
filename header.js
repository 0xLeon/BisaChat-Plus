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
 * bind and bindAsEventListener taken from Prototype
 * Copyright (c) 2005-2010 Sam Stephenson
 */
if (typeof Function.prototype.bind === 'undefined') {
	Function.prototype.bind = function(context) {
		if (arguments.length < 2 && typeof arguments[0] === 'undefined') return this;
		var __method = this, args = Array.prototype.slice.call(arguments, 1);
		
		return function() {
			args = Array.prototype.slice.call(args, 0);
			var argsLength = args.length, argumentsLength = arguments.length;
			while (argumentsLength--)  args[argsLength + argumentsLength] = arguments[argumentsLength];
			return __method.apply(context, args);
		};
	};
}

Function.prototype.bindAsEventListener = function(context) {
	var __method = this, args = Array.prototype.slice.call(arguments, 1);
	
	return function(event) {
		var array = [event || window.event];
		var arrayLength = array.length, length = args.length;
		while (length--) array[arrayLength + length] = args[length];
		return __method.apply(context, array);
	};
};

String.prototype.parseAsColor = function() {
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
};
