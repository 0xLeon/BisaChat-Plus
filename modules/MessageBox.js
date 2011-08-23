/* 
 * Message Box Module
 * Copyright (c) 2011, Stefan Hahn
 */
Modules.MessageBox = {
	callerObj: null,
	prefilterHandle: null,
	inbox: API.w.$A([ ]),
	unread: 0,
	
	init: function(callerObj) {
		this.callerObj = callerObj;
		
		this.getData();
		this.registerPrefilter();
		this.buildOverlay();
		this.callerObj.watch('isAway', function(id, oldValue, newValue) {
			if ((oldValue === false) && (newValue === true)) this.clearInbox();
			
			return newValue;
		}.bind(this));
	},
	
	getData: function() {
		var data = JSON.parse(API.Storage.getValue('messageBoxData', '[]'));
		
		for (var i = 0; i < data.length; i++) {
			this.inbox.push(data[i]);
		}
	},
	
	registerPrefilter: function() {
		this.callerObj.registerSilentMessagePrefilter(function(event, nickname, message) {
			if ((this.callerObj.isAway) && (event.target.className.toLowerCase().indexOf('messagetype7') > -1)) {
				(new Audio(Media.bing.dataURI)).play();
				
				this.inbox.push({
					timestamp: this.parseDate(API.w.$$('#'+event.target.getAttribute('id')+' span')[0].firstChild.nodeValue.trim().slice(1, -1)),
					nickname: event.target.querySelector('span[onclick]').innerHTML.trim(),
					message: message.innerHTML.trim()
				});
				API.Storage.setValue('messageBoxData', this.inbox);
				this.unread++;
				
				if (!!API.w.$('messageBoxSmallButton')) {
					this.updateSpan();
				}
			}
		}, this);
	},
	
	buildOverlay: function() {
		this.callerObj.buildOverlay('messageBox', './wcf/icon/pmFullS.png', 'Message Box', function() {
			return this.overlayContentBuilder();
		}.bind(this),
		function() {
			API.w.$$('#messageBox .overlayContent')[0].replaceChild(this.overlayContentBuilder(), API.w.$$('#messageBox .overlayContent')[0].firstChild);
			this.unread = 0;
			this.updateSpan();
		}.bind(this));
	},
	
	clearInbox: function() {
		this.inbox.clear();
		API.Storage.setValue('messageBoxData', this.inbox);
		this.updateSpan();
	},
	
	updateSpan: function() {
		var text = 'Message Box';
		
		if (this.unread > 0) text += ' ('+this.unread+')';
		API.w.$$('#messageBoxSmallButton span')[0].firstChild.replaceData(0, API.w.$$('#messageBoxSmallButton span')[0].firstChild.nodeValue.length, text);
	},
	
	parseDate: function(timeString) {
		var timeArray = timeString.split(':');
		var today = new Date();
		
		if (timeArray.length !== 3) throw new Error('invalid timeString »'+timeString+'«');
		
		return ((new Date(today.getFullYear(), today.getMonth(), today.getDate(), Number(timeArray[0]), Number(timeArray[1]), Number(timeArray[2]))).getTime());
	},
	
	overlayContentBuilder: function() {
		var node = new API.w.Element('p');
		
		node.appendChild(document.createTextNode('Keine Nachrichten vorhanden.'));
		
		if (this.inbox.length > 0) {
			node = new API.w.Element('ul', { style: 'list-style-type:none;' });
			
			this.inbox.each(function(item, key) {
				var li = new API.w.Element('li', { id: 'whisperMessage'+key });
				var timeSpan = new API.w.Element('span', { style: 'font-size:0.8em' });
				var infoSpan = new API.w.Element('span', { style: 'font-weight:bold;' });
				var messageSpan = new API.w.Element('span', { 'class': 'chatMessageText' });
				
				var messageDateObj = new Date(item.timestamp);
				var messageTime = ((messageDateObj.getHours() < 10) ? '0'+messageDateObj.getHours() : messageDateObj.getHours())+':'+((messageDateObj.getMinutes() < 10) ? '0'+messageDateObj.getMinutes() : messageDateObj.getMinutes())+':'+((messageDateObj.getSeconds() < 10) ? '0'+messageDateObj.getSeconds() : messageDateObj.getSeconds());
				
				timeSpan.appendChild(document.createTextNode('('+messageTime+')'));
				infoSpan.innerHTML = item.nickname;
				messageSpan.innerHTML = item.message;
				li.appendChild(timeSpan);
				li.appendChild(document.createTextNode(' '));
				li.appendChild(infoSpan);
				li.appendChild(document.createTextNode(' '));
				li.appendChild(messageSpan);
				node.appendChild(li);
			}, this);
		}
		
		return node;
	}
};
