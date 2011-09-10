/* 
 * Timeout Killer Module
 * Copyright (c) 2011, Stefan Hahn
 */
Modules.TimeoutKiller = {
	callerObj: null,
	antiTimeoutHandler: null,
	message: '',
	
	init: function(callerObj) {
		this.callerObj = callerObj;
		
		this.registerPrefilters();
	},
	
	registerPrefilters: function() {
		this.callerObj.registerMessagePrefilter('timeoutKiller', 'Timeout-Killer', 'Timeout-Killer aktivieren', 't', true, function(event, checked, nickname, message, messageType) {
			if (checked && (event.target.className.toLowerCase().indexOf('ownmessage') > -1)) {
				this.startKiller();
				
				if ((messageType === 7) && (message.firstChild.nodeValue === this.message)) {
					event.target.parentNode.removeChild(event.target);
				}
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
			this.message = this.generateMessage(15);
			this.callerObj.pushMessage('/f '+API.w.settings.username+', '+this.message);
		}.bind(this), 300000);
	},
	
	stopKiller: function() {
		if (this.antiTimeoutHandler !== null) {
			API.w.clearTimeout(this.antiTimeoutHandler);
			this.antiTimeoutHandler = null;
		}
	},
	
	generateMessage: function(length) {
		var message = '';
		
		while (length--) {
			message += String.fromCharCode(parseInt(Math.round(33 + Math.random() * 93)));
		}
		
		return message;
	}
};
