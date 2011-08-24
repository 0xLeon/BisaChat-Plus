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
		this.callerObj.registerMessagePrefilter('timeoutKiller', 'Timeout-Killer', 'Timeout-Killer aktivieren', 't', true, function(event, checked, nickname, message) {
			if (checked && (event.target.className.toLowerCase().indexOf('ownmessage') > -1)) {
				this.startKiller();
			}
		}, 
		function(event, checked) {
			if (checked) {
				this.startKiller();
			}
			else {
				this.stopKiller();
			}
			
			return true;
		}, this);
	},
	
	startKiller: function() {
		this.stopKiller();
		this.antiTimeoutHandler = API.w.setTimeout(function() {
			this.callerObj.pushMessage('/f '+API.w.settings.username+', Timeout-Killer-Message');
		}.bind(this), 300000);
	},
	
	stopKiller: function() {
		if (this.antiTimeoutHandler !== null) {
			API.w.clearTimeout(this.antiTimeoutHandler);
			this.antiTimeoutHandler = null;
		}
	}
};
