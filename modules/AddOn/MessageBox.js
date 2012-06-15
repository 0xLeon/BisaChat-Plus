/* 
 * Message Box Module
 * Copyright (C) 2011-2012 Stefan Hahn
 */
Modules.AddOn.MessageBox = new ClassSystem.Class(Modules.Util.AbstractModule, (function() {
	function initializeVariables() {
		this.unread = 0;
		this.inbox = this.storage.getValue('messageBoxData', []);
		
		if (!(this.inbox instanceof Array)) {
			this.inbox = JSON.parse(this.inbox);
			
			try {
				this.inbox = $A(this.inbox);
			}
			catch (e) {
				this.inbox = [];
			}
		}
	}
	
	function addListeners() {
		Event.register('messageAfterNodeSetup', function(event) {
			if ((this.callerObj.isAway || !document.hasFocus()) && (event.type === 7) && (!event.ownMessage)) {
				this.pushMessage(event);
			}
		}, this);
		Event.register('awayStatusChange', function(event) {
			if (event.isAway) {
				appendHr.call(this);
			}
		}, this);
		document.addEventListener('blur', function() {
			appendHr.call(this);
		}.bindAsEventListener(this), false);
	}
	
	function buildUI() {
		this.callerObj.buildOverlay('messageBox', './wcf/icon/pmFullS.png', 'Message Box', function() {
			return overlayContentBuilder.call(this);
		},
		function() {
			this.unread = 0;
			updateSpan.call(this);
		}, this);
	}
	
	function overlayContentBuilder() {
		var node = new Element('p');
		
		node.appendChild(document.createTextNode('Keine Nachrichten vorhanden.'));
		
		if (this.inbox.length > 0) {
			node = new Element('div');
			var messageUl = new Element('ul', { style: 'list-style-type: none;' });
			
			var buttonWrapper = new Element('div', { 'class': 'smallButtons' });
			var buttonUl = new Element('ul');
			var li = new Element('li', { style: 'float: left;' });
			var a = new Element('a', { href: 'javascript:;' });
			var img = new Element('img', { src: './wcf/icon/deleteS.png', style: 'width: 16px; height: 16px;', alt: '' });
			var span = new Element('span');
			
			this.inbox.each(function(item, key) {
				appendMessage.call(this, item, key, messageUl);
			});
			
			a.addEventListener('click', function(event) {
				this.clearInbox(true);
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
	}
	
	function appendMessage(messageObj, index, targetNode) {
		var li = new Element('li', { id: 'whisperMessage'+index });
		var timeSpan = new Element('span', { style: 'font-size: 0.8em' });
		var infoSpan = new Element('span', { style: 'font-weight: bold;' });
		var messageSpan = new Element('span', { 'class': 'chatMessageText' });
		var messageTime = (new Date(messageObj.timestamp)).getMessageDate();
		
		timeSpan.appendChild(document.createTextNode('('+messageTime+')'));
		infoSpan.innerHTML = messageObj.nickname;
		messageSpan.innerHTML = messageObj.message;
		li.appendChild(timeSpan);
		li.appendChild(document.createTextNode(' '));
		li.appendChild(infoSpan);
		li.appendChild(document.createTextNode(': '));
		li.appendChild(messageSpan);
		targetNode.appendChild(li);
	}
	
	function appendHr() {
		if (!!($$('#messageBox .overlayContent ul')[1]) && ($$('#messageBox .overlayContent ul')[1].lastChild.firstChild.nodeName.toLowerCase() !== 'hr')) {
			var li = new Element('li');
			
			li.appendChild(new Element('hr', { style: 'display: block; width: 80%;' }));
			$$('#messageBox .overlayContent ul')[1].appendChild(li);
		}
	}
	
	function updateSpan() {
		var text = 'Message Box';
		
		if (this.unread > 0) text += ' ('+this.unread+')';
		$$('#messageBoxSmallButton span')[0].firstChild.replaceData(0, $$('#messageBoxSmallButton span')[0].firstChild.nodeValue.length, text);
	}
	
	/**
	 * Appends a message to the message box.
	 * 
	 * @param	{Object}	event		event object of the fired message event
	 * @returns	{undefined}
	 */
	function pushMessage(event) {
		var length = this.inbox.push({
			timestamp: Date.fromMessageTime(event.time).getTime(),
			nickname: event.username,
			message: event.text
		});
		this.storage.setValue('messageBoxData', this.inbox);
		this.unread++;
		
		if (length === 1) {
			$$('#messageBox .overlayContent')[0].replaceChild(overlayContentBuilder.call(this), $$('#messageBox .overlayContent')[0].firstChild);
		}
		else {
			appendMessage.call(this, this.inbox[length-1], length, $$('#messageBox .overlayContent ul')[1]);
		}
		
		if (!!$('messageBoxSmallButton')) {
			updateSpan.call(this);
		}
	}
	
	/**
	 * Deletes all saved messages.
	 * 
	 * @param	{Boolean}	updateUI	true if the visual interface should be deleted too
	 */
	function clearInbox(updateUI) {
		this.inbox.clear();
		this.storage.setValue('messageBoxData', this.inbox);
		updateSpan.call(this);
		
		if (updateUI) {
			new Animations.FadeOut($$('#messageBox .overlayContent')[0].firstChild, {
				onAnimationEnd: function(event) {
					event.target.parentNode.removeChild(event.target);
					$$('#messageBox .overlayContent')[0].style.display = 'none';
					$$('#messageBox .overlayContent')[0].appendChild(overlayContentBuilder.call(this));
					new Animations.FadeIn($$('#messageBox .overlayContent')[0]);
				}.bind(this)
			});
		}
	}
	
	return {
		initializeVariables:	initializeVariables,
		addListeners:		addListeners,
		buildUI:		buildUI,
		
		pushMessage:		pushMessage,
		clearInbox:		clearInbox
	};
})());
