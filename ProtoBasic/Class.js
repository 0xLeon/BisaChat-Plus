/* 
 * Basic Class implementation
 * 
 * Taken from Prototype
 * Copyright (c) 2005-2010 Sam Stephenson
 */
var Class = function() {
	var parent = null, properties = $A(arguments);
	
	if (Object.isFunction(properties[0])) parent = properties.shift();
	
	function klass() {
		this.initialize.apply(this, arguments);
	}
	
	Object.extend(klass, {
		addMethods: function(source) {
			var ancestor = this.superclass && this.superclass.prototype;
			var properties = Object.keys(source);
			
			for (var i = 0, length = properties.length; i < length; i++) {
				var property = properties[i];
				var value = source[property];
				
				if (ancestor && Object.isFunction(value) && (value.argumentNames()[0] === '$super')) {
					var method = value;
					
					value = (function(m) {
						return function() {
							return ancestor[m].apply(this, arguments);
						};
					})(property).wrap(method);
					
					value.valueOf = method.valueOf.bind(method);
					value.toString = method.toString.bind(method);
				}
				
				this.prototype[property] = value;
			}
			
			return this;
		}
	});
	klass.superclass = parent;
	klass.subclasses = [];
	
	if (parent) {
		var subclass = function() { };
		
		subclass.prototype = parent.prototype;
		klass.prototype = new subclass;
		parent.subclasses.push(klass);
	}
	
	for (var i = 0; i < properties.length; i++) {
		klass.addMethods(properties[i]);
	}
	
	if (!klass.prototype.initialize) {
		klass.prototype.initialize = Function.empty;
	}
	
	klass.prototype.constructor = klass;
	
	return klass;
};
