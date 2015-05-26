/**
 * Storage engine for persistent value storage
 * Copyright (C) 2011-2015 Stefan Hahn
 */
var Storage = (function() {
	// TODO: make storageinterface a real class again
	var StorageInterface = ((function(namespace) {
		function initialize(namespace) {
			this.namespace = namespace;
		}
		
		/**
		 * Gets saved value from persistent storage
		 * 
		 * @param	{String}	key
		 * @param	{mixed}		[defaultValue]
		 * @returns	{mixed}
		 */
		function getValue(key, defaultValue) {
			if (localStorage.getItem(this.namespace + key) === null) {
				if (typeof(defaultValue) !== 'undefined') this.setValue(key, defaultValue);
				return defaultValue;
			}
			
			return JSON.parse(localStorage.getItem(this.namespace + key));
		}
		
		/**
		 * Saves value persistent
		 * 
		 * @param	{String}	key
		 * @param	{mixed}		value
		 * @returns	{undefined}
		 */
		function setValue(key, value) {
			return localStorage.setItem(this.namespace + key, JSON.stringify(value));
		}
		
		/**
		 * Deletes value from persistent storage
		 * 
		 * @param	{String}	key
		 * @returns	{undefined}
		 */
		function unsetValue(key) {
			localStorage.removeItem(this.namespace + key);
		}
		
		/**
		 * Returns an array of all keys within the given namespace
		 * 
		 * @returns	{Array}
		 */
		function keys() {
			var length = localStorage.length;
			var keysArray = [];
			
			while (length--) {
				if (localStorage.key(length).startsWith(this.namespace)) {
					keysArray.push(localStorage.key(length).replace(this.namespace, ''));
				}
			}
			
			return keysArray;
		}
		
		/**
		 * Amount of saved key value pairs within the given namespace
		 * 
		 * @returns	{Number}
		 */
		function size() {
			var length = localStorage.length;
			var i = 0;
			
			while (length--) {
				if (localStorage.key(length).startsWith(this.namespace)) {
					i++;
				}
			}
			
			return i;
		}
		
		/**
		 * Deletes all data from persistent storage within the given namespace
		 * 
		 * @returns	{undefined}
		 */
		function clear() {
			var keys = this.keys();
			
			keys.forEach(function(key) {
				this.unsetValue(key);
			}, this);
		}
		
		/**
		 * Replace all data in the given namespace with properties of passed object
		 * 
		 * @param	{Object}	Object	Hash-like object
		 * @returns	{undefined}	Returns nothing
		 */
		function importSettings(obj) {
			if (typeof obj !== 'object') throw new TypeError('obj has to be an object type');
			
			var keys = Object.keys(obj);
			
			this.clear();
			keys.forEach(function(key) {
				this.setValue(key, obj[key]);
			}, this);
		}
		
		/**
		 * Returns all key value pairs from the given namespace
		 * 
		 * @returns	{Object}	Hash-like object with every key as property
		 */
		function exportSettings() {
			var obj = {};
			var keys = this.keys();
			
			keys.forEach(function(key) {
				obj[key] = this.getValue(key);
			});
			
			return obj;
		}
		
		initialize(namespace);
		
		return {
			initialize:	initialize,
			getValue:	getValue,
			setValue:	setValue,
			unsetValue:	unsetValue,
			keys:		keys,
			size:		size,
			clear:		clear,
			importSettings:	importSettings,
			exportSettings:	exportSettings
		};
	}));
	
	var namespaces = { };
	
	function getInterface() {
		if (arguments.length < 1) {
			throw new Error('No namespace given');
		}
		
		var namespace = '';
		
		$.each(arguments, function(namespaceItem) {
			// TODO: validate namespace elements
			namespace += '.' + namespaceItem;
		});
		
		namespace += '.';
		
		if (typeof(namespaces[namespace]) === 'undefined') {
			namespaces[namespace] = new StorageInterface(namespace);
		}
		
		return namespaces[namespace];
	}
	
	return {
		getInterface:	getInterface
	};
})();
