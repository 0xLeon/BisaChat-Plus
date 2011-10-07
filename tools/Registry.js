/**
 * Registry
 * Storage engine for temp value storage
 * 
 * Copyright (C) 2011 Stefan Hahn
 */
var Registry = {
	/**
	 * Actual storage object
	 * 
	 * @private
	 * @type	{Object}
	 */
	data: { },
	
	/**
	 * Gets saved value from temp storage
	 * 
	 * @param	{String}	key
	 * @param	{mixed}		[defaultValue]
	 * @returns	{mixed}
	 */
	getValue: function(key, defaultValue) {
		if (typeof this.data[key] === 'undefined') {
			var value = defaultValue;
			
			this.setValue(key, value);
		}
		
		return this.data[key];
	},
	
	/**
	 * Saves value temp
	 * 
	 * @param	{String}	key
	 * @param	{mixed}		value
	 * @returns	{undefined}
	 */
	setValue: function(key, value) {
		return this.data[key] = value;
	},
	
	/**
	 * Deletes value from temp storage
	 * 
	 * @param	{String}	key
	 * @returns	{undefined}
	 */
	unsetValue: function(key) {
		delete this.data[key];
	},
	
	/**
	 * Deletes all data from temp storage
	 * 
	 * @returns	{undefined}
	 */
	clear: function() {
		this.data = { };
	},
	
	/**
	 * Returns n-th key
	 * 
	 * @param	{Number}	n
	 * @returns	{String}
	 */
	key: function(n) {
		return Object.keys(this.data)[n];
	},
	
	/**
	 * Amount of saved key value pairs
	 * 
	 * @type	{Number}
	 */
	get length() {
		return Object.keys(this.data).length;
	}
};
