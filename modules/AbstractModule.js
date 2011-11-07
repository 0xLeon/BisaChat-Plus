/* 
 * Abstract Module class
 * All modules should inhert from this class
 * 
 * Copyright (C) 2011 Stefan Hahn
 */
Modules.AbstractModule = new Class({
	initialize: function(callerObj) {
		this.callerObj = callerObj;
		
		this.addStyleRules();
		this.registerOptions();
		this.addListeners();
		this.finish();
	},
	addStyleRules: function() {},
	registerOptions: function() {},
	addListeners: function() {},
	finish: function() {},
}, true);
