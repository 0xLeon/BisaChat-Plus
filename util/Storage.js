/**
 * Storage engine for persistent value storage
 * Copyright (C) 2011-2015 Stefan Hahn
 */
Util.Storage = (function() {
	// TODO: make storageinterface a real class again
	var StorageInterface = ((function(initNamespace) {
		var namespace = initNamespace;
		
		function initialize() { }
		
		/**
		 * Gets saved value from persistent storage
		 * 
		 * @param	{String}	key
		 * @param	{mixed}		[defaultValue]
		 * @returns	{mixed}
		 */
		function getValue(key, defaultValue) {
			if (localStorage.getItem(namespace + key) === null) {
				if (typeof(defaultValue) !== 'undefined') {
					this.setValue(key, defaultValue);
				}
				
				return defaultValue;
			}
			
			return JSON.parse(localStorage.getItem(namespace + key));
		}
		
		/**
		 * Saves value persistent
		 * 
		 * @param	{String}	key
		 * @param	{mixed}		value
		 * @returns	{undefined}
		 */
		function setValue(key, value) {
			return localStorage.setItem(namespace + key, JSON.stringify(value));
		}
		
		/**
		 * Deletes value from persistent storage
		 * 
		 * @param	{String}	key
		 * @returns	{undefined}
		 */
		function unsetValue(key) {
			localStorage.removeItem(namespace + key);
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
				if (localStorage.key(length).startsWith(namespace)) {
					keysArray.push(localStorage.key(length).replace(namespace, ''));
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
				if (localStorage.key(length).startsWith(namespace)) {
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
			if (typeof obj !== 'object') {
				throw new TypeError('obj has to be an object type');
			}
			
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
			}, this);
			
			return obj;
		}
		
		initialize(namespace);
		
		return {
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
		var namespaceValidationPattern = /^[a-zA-Z_$][a-zA-Z\d_$]*$/;
		
		$.each(arguments, function(index, namespaceItem) {
			if (!namespaceItem.match(namespaceValidationPattern)) {
				throw new Error('Invalid namespace identifier »' + namespaceItem + '«');
			}
			
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
