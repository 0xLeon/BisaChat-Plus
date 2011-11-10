/* 
 * Message Box Module
 * Copyright (C) 2011 Stefan Hahn
 */
Modules.MessageBox = new ClassSystem.Class(Modules.AbstractModule, {
	initializeVariables: function() {
		this.inbox = $A(API.Storage.getValue('messageBoxData', []));
		this.prefilterHandle = null;
		this.unread = 0;
	},
	
	registerOptions: function() {
		this.callerObj.registerSilentMessagePrefilter(function(event, nickname, message, messageType) {
			if ((this.callerObj.isAway || !document.hasFocus()) && (messageType === 7)) {
				this.pushMessage(event, message);
			}
		}, this);
	},
	
	addListeners: function() {
		Event.register('awayStatusChange', function(event) {
			if (event.isAway) {
				this.appendHr();
			}
		}, this);
		document.addEventListener('blur', function() {
			this.appendHr();
		}.bindAsEventListener(this), false);
	},
	
	buildUI: function() {
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
		$$('#messageBoxSmallButton span')[0].firstChild.replaceData(0, $$('#messageBoxSmallButton span')[0].firstChild.nodeValue.length, text);
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
			var img = new API.w.Element('img', { src: './wcf/icon/deleteS.png', style: 'width: 16px; height: 16px;', alt: '' });
			var span = new API.w.Element('span');
			
			this.inbox.each(function(item, key) {
				this.appendMessage(item, key, messageUl);
			}, this);
			
			a.addEventListener('click', function(event) {
				this.clearInbox();
				new API.w.Effect.Fade($$('#messageBox .overlayContent')[0].firstChild, {
					afterFinish: function(effect) {
						effect.element.parentNode.removeChild(effect.element);
						$$('#messageBox .overlayContent')[0].style.display = 'none';
						$$('#messageBox .overlayContent')[0].appendChild(this.overlayContentBuilder());
						new API.w.Effect.Appear($$('#messageBox .overlayContent')[0]);
					}.bind(this)
				});
			}.bindAsEventListener(this), true);
			
			span.appendChild(document.createTextNode('Alle Nachrichten löschen'));
			a.appendChild(img);
			a.appendChild(document.createTextNode(' '));
			a.appendChild(span);
			li.appendChild(a);
			buttonUl.appendChild(li);
			buttonWrapper.appendChild(buttonUl);
			node.appendChild(buttonWrapper);
			node.appendChild(messageUl);
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
		li.appendChild(document.createTextNode(': '));
		li.appendChild(messageSpan);
		targetNode.appendChild(li);
	},
	
	/**
	 * Appends a message to the message box.
	 * Other modules should call this function, not the internal appendMessage
	 * 
	 * @param	{Object}	event		event object of the inserted message node
	 * @param	{Object}	message		message node, which points directly to the actual message
	 * @returns	{undefined}
	 */
	pushMessage: function(event, message) {
		if (!!this.callerObj.moduleInstances.get('SmiliesPlus') && !!this.callerObj.moduleInstances.get('SmiliesPlus').replaceImageSmilies && !API.Storage.getValue('smiliesActive')) this.callerObj.moduleInstances.get('SmiliesPlus').replaceImageSmilies(message);
		
		var name = event.target.querySelector('span[onclick]').innerHTML.trim();
		var length = this.inbox.push({
			timestamp: this.callerObj.parseMessageDate($$('#'+event.target.getAttribute('id')+' span')[0].firstChild.nodeValue.trim().slice(1, -1)),
			nickname: ((name.lastIndexOf(':') === (name.length - 1)) ? name.slice(0, -1) : name),
			message: message.innerHTML.trim()
		});
		API.Storage.setValue('messageBoxData', this.inbox);
		this.unread++;
		
		if (length === 1) {
			$$('#messageBox .overlayContent')[0].replaceChild(this.overlayContentBuilder(), $$('#messageBox .overlayContent')[0].firstChild);
		}
		else {
			this.appendMessage(this.inbox[length-1], length, $$('#messageBox .overlayContent ul')[1]);
		}
		
		if (!!$('messageBoxSmallButton')) {
			this.updateSpan();
		}
	},
	
	appendHr: function() {
		if (!!($$('#messageBox .overlayContent ul')[1]) && ($$('#messageBox .overlayContent ul')[1].lastChild.firstChild.nodeName.toLowerCase() !== 'hr')) {
			var li = new API.w.Element('li');
			
			li.appendChild(new API.w.Element('hr', { style: 'display:block; width:80%;' }));
			$$('#messageBox .overlayContent ul')[1].appendChild(li);
		}
	}
});
