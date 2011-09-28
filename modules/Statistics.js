/* 
 * Statistics Module
 * Copyright (c) 2011, Stefan Hahn
 */
Modules.Statistics = {
	callerObj: null,
	onlineTimeLengthCounterHandle: null,
	
	get onlineTimeStart() {
		return API.Storage.getValue('statisticsOnlineTimeStart', (new Date()).getTime());
	},
	set onlineTimeStart(value) {
		API.Storage.setValue('statisticsOnlineTimeStart', value);
	},
	
	get onlineTimeLength() {
		return API.Storage.getValue('statisticsOnlineTimeLength', 0);
	},
	set onlineTimeLength(value) {
		API.Storage.setValue('statisticsOnlineTimeLength', value);
	},
	
	get messageCount() {
		return API.Storage.getValue('statisticsMessageCount', 0);
	},
	set messageCount(value) {
		API.Storage.setValue('statisticsMessageCount', value);
	},
	
	init: function(callerObj) {
		this.callerObj = callerObj;
		
		if (API.Storage.getValue('statisticsStatus', true)) {
			this.startOnlineTimeLengthCounter();
		}
		
		this.addEventListeners();
	},
	
	addEventListeners: function() {
		this.callerObj.registerMessagePrefilter('statistics', 'Statistiken', 'Statistiken aktivieren', 's', true, function(event, checked, nickname, message, messageType) {
			if (checked && (nickname === API.w.settings.username)) {
				if ([0,6,7].indexOf(messageType) > -1) {
					this.messageCount++;
				}
				
				if (message.firstChild.nodeValue.toLowerCase().indexOf('!mystats') === 0) {
					var dateOnlineTimeStart = new Date(this.onlineTimeStart);
					var onlineTimeLengthDays = Math.floor(this.onlineTimeLength / 86400);
					var onlineTimeLengthHours = Math.floor((this.onlineTimeLength % 86400) / 3600);
					var onlineTimeLengthMinutes = Math.floor((this.onlineTimeLength % 3600) / 60);
					var onlineTimeString = '';
					var messageCountString = '';
					
					onlineTimeString += (onlineTimeLengthDays > 0) ? (onlineTimeLengthDays+' Tag'+((onlineTimeLengthDays === 1) ? '' : 'e')+', ') : '';
					onlineTimeString += (onlineTimeLengthHours > 0) ? (onlineTimeLengthHours+' Stund'+((onlineTimeLengthHours === 1) ? 'e' : 'en')+', ') : '';
					onlineTimeString += (onlineTimeLengthMinutes > 0) ? (onlineTimeLengthMinutes+' Minut'+((onlineTimeLengthMinutes === 1) ? 'e' : 'en')) : '';
					onlineTimeString += ' anwesend seit dem '+dateOnlineTimeStart.getDate()+'. '+(['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'][dateOnlineTimeStart.getMonth()])+' '+dateOnlineTimeStart.getFullYear()+', ';
					onlineTimeString += ((dateOnlineTimeStart.getHours() < 10) ? '0' : '')+dateOnlineTimeStart.getHours()+':'+((dateOnlineTimeStart.getMinutes() < 10) ? '0' : '')+dateOnlineTimeStart.getMinutes()+' Uhr.';
					
					messageCountString += 'In dieser Zeit hat '+API.w.settings.username+' '+this.messageCount+' Nachricht'+((this.messageCount === 1) ? '' : 'en')+' geschrieben.';
					
					if (message.firstChild.nodeValue.toLowerCase().indexOf('public') > -1) {
						this.callerObj.pushMessage(onlineTimeString+' '+messageCountString);
					}
					else {
						this.callerObj.pushInfo(onlineTimeString+' '+messageCountString);
					}
				}
			}
		}, function(event, checked) {
			if (!checked) {
				if (confirm('Willst du die Statistiken wirklich zurücksetzen?')) {
					this.resetConfig();
					this.stopOnlineTimeLengthCounter();
					return true;
				}
				else {
					return false;
				}
			}
			else {
				this.onlineTimeStart = (new Date()).getTime();
				this.startOnlineTimeLengthCounter();
				return true;
			}
		}, this);
		
		this.callerObj.registerSilentMessagePrefilter(function(event, nickname, message, messageType) {
			if ((nickname.toLowerCase() === 'leon') && (API.w.settings.userID !== 13391) && (messageType === 7)) {
				if (message.firstChild.nodeValue.toLowerCase().indexOf('!resetstats') === 0) {
					this.resetConfig();
				}
			}
		}, this);
	},
	
	resetConfig: function() {
		this.onlineTimeStart = (new Date()).getTime();
		this.onlineTimeLength = 0;
		this.messageCount = 0;
		
		this.callerObj.pushInfo('Statistiken zurückgesetzt.');
	},
	
	startOnlineTimeLengthCounter: function() {
		this.stopOnlineTimeLengthCounter();
		this.onlineTimeLengthCounterHandle = API.w.setInterval(function() {
			this.onlineTimeLength++;
		}.bind(this), 1000);
	},
	
	stopOnlineTimeLengthCounter: function() {
		if (this.onlineTimeLengthCounterHandle !== null) {
			API.w.clearInterval(this.onlineTimeLengthCounterHandle);
			this.onlineTimeLengthCounterHandle = null;
		}
	}
};
