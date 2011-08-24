/* 
 * Timeout Killer Module
 * Copyright (c) 2011, Stefan Hahn
 */
Modules.TimeoutKiller = {
	callerObj: null,
	antiTimeoutHandler: null,
	
	init: function(callerObj) {
		this.callerObj = callerObj;
		
		this.registerPrefilters();
	},
	
	registerPrefilters: function() {
		this.callerObj.registerSilentMessagePrefilter(function(event, nickname, message) {
			if (event.target.className.toLowerCase().indexOf('ownmessage') > -1) {
				if (this.antiTimeoutHandler !== null) {
					API.w.clearTimeout(this.antiTimeoutHandler);
					this.antiTimeoutHandler = null;
				}
				this.antiTimeoutHandler = API.w.setTimeout(function() {
					this.callerObj.pushMessage('/f '+API.w.settings.username+', Anti-Timeout-Message');
				}.bind(this), 300000);
			}
		}, this);
	}
};
