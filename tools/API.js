/**
 * BisaChat API
 * Provides useful functions for userscripts
 *
 * Copyright (C) 2011-2012 Stefan Hahn
 */
var API = (function() {
	/**
	 * Storage engine for persistent value storage
	 * 
	 * @type	{Object}
	 */
	var Storage = (function() {
		/**
		 * Gets saved value from persistent storage
		 * 
		 * @param	{String}	key
		 * @param	{mixed}		[defaultValue]
		 * @returns	{mixed}
		 */
		function getValue(key, defaultValue) {
			var type, value;
			
			if (localStorage.getItem(key) === null) {
				if (!Object.isUndefined(defaultValue)) this.setValue(key, defaultValue);
				return defaultValue;
			}
			
			value = localStorage.getItem(key);
			type = value[0];
			value = value.slice(1);
			switch (type) {
				case 'b':
					return (value === 'true');
				case 'n':
					return Number(value);
				case 'o':
					return JSON.parse(value);
				default:
					return value;
			}
		}
		
		/**
		 * Saves value persistent
		 * 
		 * @param	{String}	key
		 * @param	{mixed}		value
		 * @returns	{undefined}
		 */
		function setValue(key, value) {
			value = (typeof value)[0] + ((typeof value === 'object') ? JSON.stringify(value) : value);
			return localStorage.setItem(key, value);
		}
		
		/**
		 * Deletes value from persistent storage
		 * 
		 * @param	{String}	key
		 * @returns	{undefined}
		 */
		function unsetValue(key) {
			localStorage.removeItem(key);
		}
		
		/**
		 * Deletes all data from persistent storage
		 * 
		 * @returns	{undefined}
		 */
		function clear() {
			localStorage.clear();
		}
		
		/**
		 * Returns n-th key
		 * 
		 * @param	{Number}	n
		 * @returns	{String}
		 */
		function key(n) {
			return localStorage.key(n);
		}
		
		/**
		 * Replace all data in persistent storage with properties of passed object
		 * 
		 * @param	{Object}	Object	Hash-like object
		 * @returns	{undefined}	Returns nothing
		 */
		function importSettings(obj) {
			if (typeof obj !== 'object') throw new TypeError('obj has to be an object type');
			
			var keys = Object.keys(obj);
			
			this.clear();
			keys.each(function(key) {
				this.setValue(key, obj[key]);
			}, this);
		}
		
		/**
		 * Returns all key value pairs from persistent storage
		 * 
		 * @returns	{Object}	Hash-like object with every key as property
		 */
		function exportSettings() {
			var obj = {};
			
			for (var i = 0, length = this.length; i < length; i++) {
				obj[this.key(i)] = this.getValue(this.key(i));
			}
			
			return obj;
		}
		
		return {
			getValue:	getValue,
			setValue:	setValue,
			unsetValue:	unsetValue,
			clear:		clear,
			key:		key,
			importSettings:	importSettings,
			exportSettings:	exportSettings,
			
			/**
			 * Amount of saved key value pairs
			 * 
			 * @type	{Number}
			 */
			get length() {
				return localStorage.length;
			}
		};
	})();
	
	/**
	 * Add style rules to document
	 * 
	 * @param	{String}	CSSString			Valid CSS style rules
	 * @returns	{undefined}					Returns nothing
	 */
	function addStyle(CSSString) {
		var styleNode = new Element('style', { 'type': 'text/css' });
		
		styleNode.appendChild(document.createTextNode(CSSString));
		$$('head')[0].appendChild(styleNode);
	}
	
	return {
		Storage:	Storage,
		addStyle:	addStyle,
		
		/**
		 * Unrestricted window object
		 * 
		 * @type	{Object}
		 */
		get w() {
			return (unsafeWindow || window);
		}
	};
})();
