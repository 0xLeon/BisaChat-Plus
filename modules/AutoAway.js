/* 
 * Auto Away Module
 * Copyright (C) 2011 Stefan Hahn
 */
Modules.AutoAway = new Class(Modules.AbstractModule, {
	initialize: function($super, callerObj) {
		$super(callerObj);
		if (API.Storage.getValue('autoAwayStatus', true)) this.startTimer();
	},
	
	initializeVariables: function() {
		this.timerHandle = null;
	},
	
	registerOptions: function() {
		this.callerObj.registerTextOption('autoAwayTimeout', 'Zeit bis zum Away-Status in Minuten', 5, function(newValue) {
			if (API.Storage.getValue('autoAwayStatus', true)) this.startTimer();
		}, this);
		this.callerObj.registerMessagePrefilter('autoAway', 'Auto Away', 'Auto Away aktivieren', 'a', true, function(event, checked, nickname, message, messageType, ownMessage) {
			if (checked && ownMessage) {
				this.startTimer();
			}
		}, function(event, checked) {
			if (checked) {
				this.startTimer();
			}
			else {
				this.stopTimer();
			}
			
			return true;
		}, this);
	},
	
	startTimer: function() {
		this.stopTimer();
		this.timerHandle = API.w.setTimeout(function() {
			if (!this.callerObj.isAway) this.callerObj.pushMessage('/away');
		}.bind(this), API.Storage.getValue('autoAwayTimeoutValue', 5)*60000);
	},
	
	stopTimer: function() {
		if (this.timerHandle !== null) {
			API.w.clearTimeout(this.timerHandle);
			this.timerHandle = null;
		}
	}
});
