/* 
 * Away Tools Module
 * Copyright (c) 2011, Stefan Hahn
 */
Modules.AwayTools = {
	callerObj: null,
	prefilterHandle: null,
	
	init: function(callerObj) {
		this.callerObj = callerObj;
		
		this.registerPrefilter();
	},
	
	registerPrefilter: function() {
		this.callerObj.registerSilentMessagePrefilter(function(event, nickname, message) {
			if ((this.callerObj.isAway) && (event.target.className.toLowerCase().indexOf('messagetype7') > -1)) {
				
			}
		}, this);
	}
};
