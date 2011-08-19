/* 
 * Away Tools Module
 * Copyright (c) 2011, Stefan Hahn
 */
Modules.AwayTools = {
	callerObj: null,
	prefilterHandle: null,
	inbox: API.w.$A([ ]),
	
	init: function(callerObj) {
		this.callerObj = callerObj;
		
		this.registerPrefilter();
		this.callerObj.watch('isAway', function(id, oldValue, newValue) {
			if ((oldValue === false) && (newValue === true)) this.clearInbox();
			
			return newValue;
		}.bind(this));
	},
	
	registerPrefilter: function() {
		this.callerObj.registerSilentMessagePrefilter(function(event, nickname, message) {
			if ((this.callerObj.isAway) && (event.target.className.toLowerCase().indexOf('messagetype7') > -1)) {
				
			}
		}, this);
	},
	
	clearInbox: function() {
		delete this.inbox;
		this.inbox = API.w.$A([ ]);
	}
};
