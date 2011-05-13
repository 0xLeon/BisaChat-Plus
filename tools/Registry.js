/* 
 * Registry
 */
var Registry = {
	data: { },
	
	getValue: function(key, defaultValue) {
		if (typeof this.data[key] === 'undefined') {
			var value = defaultValue;
			
			this.setValue(key, value);
		}
		
		return this.data[key];
	},
	
	setValue: function(key, value) {
		return this.data[key] = value;
	},
	
	unsetValue: function(key) {
		delete this.data[key];
	},
	
	clear: function() {
		this.data = { };
	},
	
	key: function(n) {
		return Object.keys(this.data)[n];
	},
	
	get length() {
		return Object.keys(this.data).length;
	}
};
