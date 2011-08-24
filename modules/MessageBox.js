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
			if ((oldValue === false) && (newValue === true) && !!(API.w.$$('#messageBox .overlayContent ul')[0])) {
				if (API.w.$$('#messageBox .overlayContent ul')[0].lastChild.firstChild.nodeName.toLowerCase() !== 'hr') {
					var li = new API.w.Element('li');
					
					li.appendChild(new API.w.Element('hr', { style: 'display:block; width:80%;' }));
					API.w.$$('#messageBox .overlayContent ul')[0].appendChild(li);
				}
			}
			
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
					timestamp: this.callerObj.parseMessageDate(API.w.$$('#'+event.target.getAttribute('id')+' span')[0].firstChild.nodeValue.trim().slice(1, -1)),
					nickname: event.target.querySelector('span[onclick]').innerHTML.trim(),
					message: message.innerHTML.trim()
				});
				API.Storage.setValue('messageBoxData', this.inbox);
				this.unread++;
				
				if (this.inbox.length === 1) {
					API.w.$$('#messageBox .overlayContent')[0].replaceChild(this.overlayContentBuilder(), API.w.$$('#messageBox .overlayContent')[0].firstChild);
				}
				else {
					this.appendMessage(this.inbox.last(), this.inbox.length, API.w.$$('#messageBox .overlayContent ul')[0]);
				}
				
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
	
	overlayContentBuilder: function() {
		var node = new API.w.Element('p');
		
		node.appendChild(document.createTextNode('Keine Nachrichten vorhanden.'));
		
		if (this.inbox.length > 0) {
			node = new API.w.Element('div');
			var messageUl = new API.w.Element('ul', { style: 'list-style-type:none;' });
			
			var buttonWrapper = new API.w.Element('div', { 'class': 'smallButtons' });
			var buttonUl = new API.w.Element('ul');
			var li = new API.w.Element('li', { style: 'float:left;' });
			var a = new API.w.Element('a', { href: 'javascript:;' });
			
			this.inbox.each(function(item, key) {
				this.appendMessage(item, key, messageUl);
			}, this);
			
			a.addEventListener('click', function(event) {
				this.clearInbox();
				new API.w.Effect.Fade(API.w.$$('#messageBox .overlayContent')[0].firstChild, {
					afterFinish: function(effect) {
						effect.element.parentNode.removeChild(effect.element);
						API.w.$$('#messageBox .overlayContent')[0].style.display = 'none';
						API.w.$$('#messageBox .overlayContent')[0].appendChild(this.overlayContentBuilder());
						new API.w.Effect.Appear(API.w.$$('#messageBox .overlayContent')[0]);
					}.bind(this)
				});
			}.bindAsEventListener(this), true);
			
			a.appendChild(document.createTextNode('Alle Nachrichten löschen'));
			li.appendChild(a);
			buttonUl.appendChild(li);
			buttonWrapper.appendChild(buttonUl);
			node.appendChild(messageUl);
			node.appendChild(buttonWrapper);
		}
		
		return node;
	},
	
	appendMessage: function(messageObj, index, targetNode) {
		var li = new API.w.Element('li', { id: 'whisperMessage'+index });
		var timeSpan = new API.w.Element('span', { style: 'font-size:0.8em' });
		var infoSpan = new API.w.Element('span', { style: 'font-weight:bold;' });
		var messageSpan = new API.w.Element('span', { 'class': 'chatMessageText' });
		
		var messageDateObj = new Date(messageObj.timestamp);
		var messageTime = ((messageDateObj.getHours() < 10) ? '0'+messageDateObj.getHours() : messageDateObj.getHours())+':'+((messageDateObj.getMinutes() < 10) ? '0'+messageDateObj.getMinutes() : messageDateObj.getMinutes())+':'+((messageDateObj.getSeconds() < 10) ? '0'+messageDateObj.getSeconds() : messageDateObj.getSeconds());
		
		timeSpan.appendChild(document.createTextNode('('+messageTime+')'));
		infoSpan.innerHTML = messageObj.nickname;
		messageSpan.innerHTML = messageObj.message;
		li.appendChild(timeSpan);
		li.appendChild(document.createTextNode(' '));
		li.appendChild(infoSpan);
		li.appendChild(document.createTextNode(' '));
		li.appendChild(messageSpan);
		targetNode.appendChild(li);
	}
};
