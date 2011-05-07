var Registery = {
	data: { },
	getValue: function(name) {
		if (typeof this.data[name] == 'undefined') this.data[name] = null;
		return this.data[name];
	},
	
	setValue: function(name, value) {
		this.data[name] = value;
	}
};
