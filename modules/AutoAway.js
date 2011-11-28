/* 
 * Auto Away Module
 * Copyright (C) 2011 Stefan Hahn
 */
Modules.AddOn.AutoAway = new ClassSystem.Class(Modules.Util.AbstractModule, {
	initializeVariables: function() {
		this.timerHandle = null;
	},
	
	registerOptions: function() {
		this.callerObj.registerTextOption('autoAwayTimeout', 'Zeit bis zum Away-Status in Minuten', 5, function(newValue) {
			if (API.Storage.getValue('autoAwayStatus', false)) this.startTimer();
		}, this);
		this.callerObj.registerBoolOption('autoAway', 'Auto Away', 'Auto Away aktivieren', 'a', false, function(event, checked) {
			if (checked) {
				this.startTimer();
			}
			else {
				this.stopTimer();
			}
			
			return true;
		}, this);
	},
	
	addListeners: function() {
		Event.register('messageAfterNodeAppending', function(event) {
			if (API.Storage.getValue('autoAwayStatus', false) && event.ownMessage) {
				this.startTimer();
			}
		}, this);
	},
	
	finish: function() {
		if (API.Storage.getValue('autoAwayStatus', false)) {
			this.startTimer();
		}
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
