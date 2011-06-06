/* 
 *  Statistics Module
 */
Modules.Statistics = {
	callerObj: null,
	
	init: function(callerObj) {
		this.callerObj = callerObj;
		this.onlineTimeStart = API.Storage.getValue('statisticsOnlineTimeStart', (new Date()).getTime());
		this.onlineTimeLength = API.Storage.getValue('statisticsOnlineTimeLength', 0)
		this.messageCount = API.Storage.getValue('statisticsMessageCount', 0);
		
		window.setInterval(function() {
			this.onlineTimeLength += 1;
		}.bind(this), 1000);
		
		this.addEventListeners();
	},
	
	addEventListeners: function() {
		this.callerObj.registerMessagePrefilter('statistics', 'Statistiken', 'Statistiken aktivieren', 's', true, function(event, checked, nickname, message) {
			if (checked && (nickname === API.w.settings['username'])) {
				if (!!event.target.getAttribute('class').match(/\bmessageType(?:0|3|6|7)\b/)) {
					this.messageCount += 1;
				}
				
				if (message.firstChild.nodeValue.indexOf('!mystats') === 0) {
					var dateOnlineTimeStart = new Date(this.onlineTimeStart);
					var onlineTimeLengthDays = Math.floor(this.onlineTimeLength / 86400);
					var onlineTimeLengthHours = Math.floor((this.onlineTimeLength % 86400) / 3600);
					var onlineTimeLengthMinutes = Math.floor((this.onlineTimeLength % 3600) / 60);
					var onlineTimeLengthSeconds = this.onlineTimeLength % 60;
					var onlineTimeString = '';
					var messageCountString = '';
					
					onlineTimeString += (onlineTimeLengthDays > 0) ? String(onlineTimeLengthDays)+' Tage, ' : '';
					onlineTimeString += (onlineTimeLengthHours > 0) ? String(onlineTimeLengthHours)+' Stunden, ' : '';
					onlineTimeString += (onlineTimeLengthMinutes > 0) ? String(onlineTimeLengthMinutes)+' Minuten, ' : '';
					onlineTimeString += String(onlineTimeLengthSeconds)+' Sekunden';
					onlineTimeString += ' anwesend seit dem '+String(dateOnlineTimeStart.getDate())+'.'+String(dateOnlineTimeStart.getMonth()+1)+'.'+String(dateOnlineTimeStart.getFullYear())+', ';
					onlineTimeString += ((dateOnlineTimeStart.getHours() < 10) ? '0' : '')+String(dateOnlineTimeStart.getHours())+':'+((dateOnlineTimeStart.getMinutes() < 10) ? '0' : '')+String(dateOnlineTimeStart.getMinutes())+' Uhr.';
					
					messageCountString += 'In dieser Zeit hat '+API.w.settings['username']+' '+this.messageCount+' Nachrichten geschrieben.';
					
					if (message.firstChild.nodeValue.indexOf('public') > -1) {
						API.w.chat.insert(onlineTimeString+' '+messageCountString, false, 0, 0, true);
					}
					else {
						this.callerObj.pushInfo(onlineTimeString+' '+messageCountString);
					}
				}
			}
		}, function(event, checked) {
			if (!checked) {
				this.resetConfig();
			}
			else {
				this.onlineTimeStart = (new Date()).getTime();
			}
		}, this);
		
		API.w.window.addEventListener('unload', function(event) {
			API.Storage.setValue('statisticsOnlineTimeStart', this.onlineTimeStart);
			API.Storage.setValue('statisticsOnlineTimeLength', this.onlineTimeLength);
			API.Storage.setValue('statisticsMessageCount', this.messageCount);
		}.bindAsEventListener(this), false);
	},
	
	resetConfig: function() {
		this.onlineTimeStart = (new Date()).getTime();
		this.onlineTimeLength = 0;
		this.messageCount = 0;
		
		API.Storage.setValue('statisticsOnlineTimeStart', this.onlineTimeStart);
		API.Storage.setValue('statisticsOnlineTimeLength', this.onlineTimeLength);
		API.Storage.setValue('statisticsMessageCount', this.messageCount);
		this.callerObj.pushInfo('Statistiken zurückgesetzt.');
	}
};
