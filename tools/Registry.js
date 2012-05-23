/**
 * Registry
 * Storage engine for temp value storage
 * 
 * Copyright (C) 2011-2012 Stefan Hahn
 */
var Registry = (function() {
	/**
	 * Actual storage object
	 * 
	 * @private
	 * @type	{Object}
	 */
	var data = {};
	
	/**
	 * Gets saved value from temp storage
	 * 
	 * @param	{String}	key
	 * @param	{mixed}		[defaultValue]
	 * @returns	{mixed}
	 */
	function getValue(key, defaultValue) {
		if (Object.isUndefined(data[key])) {
			var value = defaultValue;
			
			this.setValue(key, value);
		}
		
		return data[key];
	}
	
	/**
	 * Saves value temp
	 * 
	 * @param	{String}	key
	 * @param	{mixed}		value
	 * @returns	{undefined}
	 */
	function setValue(key, value) {
		return data[key] = value;
	}
	
	/**
	 * Deletes value from temp storage
	 * 
	 * @param	{String}	key
	 * @returns	{undefined}
	 */
	function unsetValue(key) {
		delete data[key];
	}
	
	/**
	 * Deletes all data from temp storage
	 * 
	 * @returns	{undefined}
	 */
	function clear() {
		this.data = {};
	}
	
	/**
	 * Returns n-th key
	 * 
	 * @param	{Number}	n
	 * @returns	{String}
	 */
	function key(n) {
		return Object.keys(this.data)[n];
	}
	
	return {
		getValue:	getValue,
		setValue:	setValue,
		unsetValue:	unsetValue,
		clear:		clear,
		key:		key,
		
		/**
		 * Amount of saved key value pairs
		 * 
		 * @type	{Number}
		 */
		get length() {
			return Object.keys(this.data)[n];
		}
	};
})();
