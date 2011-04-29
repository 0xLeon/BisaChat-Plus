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
