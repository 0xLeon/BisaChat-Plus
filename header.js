// ==UserScript==
// @name           BisaChat Plus
// @description    Add's a few more comfortable functions to BisaChat
// @version        {version}
// @author         Stefan Hahn
// @copyright      2011, Stefan Hahn
// @licence        Simplified BSD License
// @namespace      http://projects.swallow-all-lies.com/greasemonkey/namsespaces/bisachat.plus
// @include        http://www.bisaboard.de/index.php?page=Chat*
// @include        http://www.bisaboard.de/?page=Chat*
// ==/UserScript==
/*
 * Copyright (c) 2011, Stefan Hahn
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, are permitted 
 * provided that the following conditions are met:
 * 
 *   - Redistributions of source code must retain the above copyright notice, this list of conditions  and the 
 *     following disclaimer.
 *   - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the 
 *     following disclaimer in the documentation and/or other materials provided with the distribution.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, 
 * INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, 
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR 
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, 
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE 
 * USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
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
		(unsafeWindow || window).$A(this.match(/(\d){1,3}/g)).each(function(number, index) {
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
