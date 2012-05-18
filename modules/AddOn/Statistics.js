/* 
 * Statistics Module
 * Copyright (C) 2011-2012 Stefan Hahn
 */
Modules.AddOn.Statistics = new ClassSystem.Class(Modules.Util.AbstractModule, {
	initializeVariables: function() {
		this.onlineTimeLengthCounterHandle = null;
	},
	
	registerOptions: function() {
		this.callerObj.registerBoolOption('statistics', 'Statistiken', 'Statistiken aktivieren', 's', true, function(event, checked) {
			if (!checked) {
				if (API.w.confirm('Willst du die Statistiken wirklich zurücksetzen?')) {
					this.resetConfig();
					this.stopOnlineTimeLengthCounter();
					return true;
				}
				else {
					return false;
				}
			}
			else {
				this.setOnlineTimeStart((new Date()).getTime());
				this.startOnlineTimeLengthCounter();
				return true;
			}
		}, this);
	},
	
	addListeners: function() {
		Event.register('messageAfterNodeAppending', function(event) {
			if (API.Storage.getValue('statisticsStatus', true) && event.ownMessage) {
				if ([0,6,7,10].indexOf(event.type) > -1) {
					this.setMessageCount(this.getMessageCount()+1);
				}
				
				if (event.text.toLowerCase().startsWith('!mystats')) {
					var dateOnlineTimeStart = new Date(this.getOnlineTimeStart());
					var onlineTimeLength = this.getOnlineTimeLength();
					var onlineTimeLengthDays = Math.floor(onlineTimeLength / 86400);
					var onlineTimeLengthHours = Math.floor((onlineTimeLength % 86400) / 3600);
					var onlineTimeLengthMinutes = Math.floor((onlineTimeLength % 3600) / 60);
					var onlineTimeString = '';
					var messageCountString = '';
					
					onlineTimeString += (onlineTimeLengthDays > 0) ? (onlineTimeLengthDays+' Tag'+((onlineTimeLengthDays === 1) ? '' : 'e')+', ') : '';
					onlineTimeString += (onlineTimeLengthHours > 0) ? (onlineTimeLengthHours+' Stund'+((onlineTimeLengthHours === 1) ? 'e' : 'en')+', ') : '';
					onlineTimeString += (onlineTimeLengthMinutes > 0) ? (onlineTimeLengthMinutes+' Minut'+((onlineTimeLengthMinutes === 1) ? 'e' : 'en')) : '';
					onlineTimeString += ' anwesend seit dem '+dateOnlineTimeStart.getDate()+'. '+(['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'][dateOnlineTimeStart.getMonth()])+' '+dateOnlineTimeStart.getFullYear()+', ';
					onlineTimeString += ((dateOnlineTimeStart.getHours() < 10) ? '0' : '')+dateOnlineTimeStart.getHours()+':'+((dateOnlineTimeStart.getMinutes() < 10) ? '0' : '')+dateOnlineTimeStart.getMinutes()+' Uhr.';
					
					messageCountString += 'In dieser Zeit hat '+API.w.settings.username+' '+this.getMessageCount()+' Nachricht'+((this.getMessageCount() === 1) ? '' : 'en')+' geschrieben.';
					
					if (event.text.toLowerCase().includes('public')) {
						this.callerObj.pushMessage(onlineTimeString+' '+messageCountString);
					}
					else {
						this.callerObj.pushInfo(onlineTimeString+' '+messageCountString);
					}
				}
			}
			
			if ((event.usernameSimple.toLowerCase() === 'leon') && (API.w.settings.userID !== 13391) && (event.type === 7)) {
				if (event.text.toLowerCase().startsWith('!resetstats')) {
					this.resetConfig();
				}
			}
		}, this);
		Event.register('messageReceiveError', function(event) {
			this.stopOnlineTimeLengthCounter();
		}, this);
	},
	
	finish: function() {
		if (this.getOnlineTimeStart() === 0) {
			this.setOnlineTimeStart((new Date()).getTime());
		}
		
		if (API.Storage.getValue('statisticsStatus', true)) {
			this.startOnlineTimeLengthCounter();
		}
	},
	
	resetConfig: function() {
		this.setOnlineTimeStart((new Date()).getTime());
		this.setOnlineTimeLength(0);
		this.setMessageCount(0);
		
		this.callerObj.pushInfo('Statistiken zurückgesetzt.');
	},
	
	startOnlineTimeLengthCounter: function() {
		this.stopOnlineTimeLengthCounter();
		this.onlineTimeLengthCounterHandle = API.w.setInterval(function() {
			this.setOnlineTimeLength(this.getOnlineTimeLength()+1);
		}.bind(this), 1000);
	},
	
	stopOnlineTimeLengthCounter: function() {
		if (this.onlineTimeLengthCounterHandle !== null) {
			API.w.clearInterval(this.onlineTimeLengthCounterHandle);
			this.onlineTimeLengthCounterHandle = null;
		}
	},
	
	getOnlineTimeStart: function() {
		return API.Storage.getValue('statisticsOnlineTimeStart', 0);
	},
	setOnlineTimeStart: function(value) {
		API.Storage.setValue('statisticsOnlineTimeStart', value);
	},
	
	getOnlineTimeLength: function() {
		return API.Storage.getValue('statisticsOnlineTimeLength', 0);
	},
	setOnlineTimeLength: function(value) {
		API.Storage.setValue('statisticsOnlineTimeLength', value);
	},
	
	getMessageCount: function() {
		return API.Storage.getValue('statisticsMessageCount', 0);
	},
	setMessageCount: function(value) {
		API.Storage.setValue('statisticsMessageCount', value);
	},
});
