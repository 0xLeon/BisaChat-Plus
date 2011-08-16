/*
 * BisaChat Plus
 * Copyright (c) 2011, Stefan Hahn
 */
var BisaChatPlus = {
	get VERSION() {
		return '{version}';
	},
	get UPDATE_URI() {
		return 'http://projects.swallow-all-lies.com/greasemonkey/files/bisachatPlus/';
	},
	
	isAway: false,
	awayMessage: '',
	
	messagePrefilters: [ ],
	keydownListeners: { },
	
	init: function() {
		try {
			this.addStyleRules();
			this.breakCage();
			this.avoidMultipleLogin();
			this.buildBox('options', './wcf/icon/editS.png', 'Optionen', function() {
				var optionsContentDiv = new API.w.Element('div');
				var optionsContentWaitingDiv = new API.w.Element('div', { id: 'optionsContentWaiting', style: 'position:absolute; width:100%; height:100%; background-image:url("./wcf/images/spinner.gif"); background-position:50% 50%; background-repeat:no-repeat;' });
				var optionsContentWrapperDiv = new API.w.Element('div', { id: 'optionsContentWrapper', style: 'display:none' });
				var optionsContentBoolOptionDiv = new API.w.Element('div', { id: 'optionsContentBoolOptionDiv', style: 'display:none;' });
				var optionsContentTextOptionDiv = new API.w.Element('div', { id: 'optionsContentTextOptionDiv', style: 'display:none;' });
				var optionsContentHr = new API.w.Element('hr', { id: 'optionsContentTypeSeparator', style: 'display:none; width:80%' });
				
				optionsContentWrapperDiv.appendChild(optionsContentBoolOptionDiv);
				optionsContentWrapperDiv.appendChild(optionsContentHr);
				optionsContentWrapperDiv.appendChild(optionsContentTextOptionDiv);
				optionsContentDiv.appendChild(optionsContentWaitingDiv);
				optionsContentDiv.appendChild(optionsContentWrapperDiv);
				
				return optionsContentDiv;
			});
			this.addEventListeners();
			
			API.w.addEventListener('load', function(event) {
				this.finish();
			}.bindAsEventListener(this), true);
		}
		finally {
			API.checkForUpdates(this.UPDATE_URI, this.VERSION, this.updateCallback, API.Storage.getValue('getNonStableReleasesStatus', true));
		}
	},
	
	addStyleRules: function() {
		API.addStyle('body { overflow: hidden; }');
		API.addStyle('html, body { height: '+API.inHeight+'px !important; }');
		API.addStyle('.hidden { display: none; }');
		API.addStyle('.column { border: 0px !important; }');
		API.addStyle('#smileys { display: none; }');
		API.addStyle('.loading, .error, #chatCopyright { border: none !important; -moz-border-radius: 0px !important; z-index: 9000; }');
		API.addStyle('.subTabMenu { padding: 0px !important; padding-top: 2px !important; border-top: none !important; border-left: none !important; border-right: none !important; }');
		API.addStyle('.subTabMenu, .subTabMenu > * { -moz-border-radius: 0px !important; }');
		API.addStyle('#chatBox { margin-top: 0px; width: 100%; height: '+API.inHeight+'px; }');
		API.addStyle('#chatBox > .border { padding: 0px !important; border: none !important; margin: 0px !important; }');
		API.addStyle('#chatBox > .border > .layout-2, #chatBox .columnInner { margin: 0px !important; }');
		API.addStyle('#chatPrivatelist > li { display: list-item !important; }');
		API.addStyle('.columnContainer > .column > .columnInner { padding: 0px }');
		API.addStyle('#chatMessage { height: 85% !important; }');
		API.addStyle('#chatMessage > div[id^="chatMessage"] { height: 100% !important; padding-left: 25px; }');
		API.addStyle('#chatFormContainer { margin-left: 25px; margin-right: 25px }');
		API.addStyle('#chatMembers { margin-left: 8px; }');
		API.addStyle('.boxSmallButton { position: relative; }');
		API.addStyle('.bcplusBox { position: absolute; width: 255px; height: 155px !important; top: -160px; left: 0px; padding-left: 1px; padding-top: 1px; -moz-border-radius-bottomleft: 0px; -moz-border-radius-bottomright: 0px; }');
		API.addStyle('.textOptionValue { cursor: pointer; }');
		API.addStyle('.textOptionValue:hover { text-decoration: underline; }');
		
		API.w.$$('#chatBox .columnContainer')[0].style.width = API.inWidth+'px';
		var boxesHeight = (API.inHeight-(parseInt(API.w.$$('#chatBox .subTabMenu')[0].offsetHeight)))+'px';
		(API.w.$$('#chatBox > .border, #chatBox > .border > .layout-2, .columnContainer > .column > .columnInner, .columnContainer > .second > .columnInner > div:first-child, #chatMembers')).each(function(item) {
			item.setAttribute('style', 'height: '+boxesHeight+' !important; border: none !important;');
		});
	},
	
	breakCage: function() {
		var tmp = API.w.$('chatBox').cloneNode(true);
		
		API.w.$('headerContainer').parentNode.removeChild(API.w.$('headerContainer'));
		API.w.$('mainContainer').parentNode.removeChild(API.w.$('mainContainer'));
		API.w.$('footerContainer').parentNode.removeChild(API.w.$('footerContainer'));
		API.w.$$('body')[0].appendChild(tmp);
		delete tmp;
		
		API.w.$$('.tabMenu')[0].parentNode.removeChild(API.w.$$('.tabMenu')[0]);
		API.w.$('chatColorPickerContainer').parentNode.removeChild(API.w.$('chatColorPickerContainer').nextSibling);
	},
	
	avoidMultipleLogin: function() {
		if (API.Storage.getValue('alreadyOnline', false)) {
			var resetLink = new API.w.Element('a');
			
			resetLink.addEventListener('click', function(event) {
				API.Storage.setValue('alreadyOnline', false);
				API.w.location.reload();
			}, true);
			resetLink.appendChild(document.createTextNode('Falls definitiv nur ein Chattab geöffnet ist, hier klicken.'));
			API.w.$$('#chatError div')[0].innerHTML = 'Den Chat bitte nicht in mehr als einem Tab öffnen.';
			API.w.$$('#chatError div')[0].appendChild((new API.w.Element('br')));
			API.w.$$('#chatError div')[0].appendChild(resetLink);
			API.w.$('chatError').style.display = '';
			API.w.onunload = API.w.Prototype.emptyFunction;
			API.w.Ajax.Responders.register({
				onCreate: function(ajax, response) {
					ajax.transport = null;
				}
			});
			throw new Error('BisaChat Plus: Already online');
		}
		else {
			API.Storage.setValue('alreadyOnline', true);
			API.w.addEventListener('unload', function(event) {
				API.Storage.setValue('alreadyOnline', false);
			}, false);
		}
	},
	
	addEventListeners: function() {
		// window resize listener
		API.w.addEventListener('resize', function() {
			API.w.$('chatBox').style.height = API.inHeight+'px';
			API.w.$$('#chatBox .columnContainer')[0].style.width = API.inWidth+'px';
			var boxesHeight = (API.inHeight-(parseInt(API.w.$$('#chatBox .subTabMenu')[0].offsetHeight)))+'px';
			(API.w.$$('#chatBox > .border, #chatBox > .border > .layout-2, .columnContainer > .column > .columnInner, .columnContainer > .second > .columnInner > div:first-child, #chatMembers')).each(function(item) {
				item.setAttribute('style', 'height: '+boxesHeight+' !important; border: none !important;');
			});
		}, false);
		
		// message prefilter/away status listener
		API.w.$('chatMessage').addEventListener('DOMNodeInserted', function(event) {
			if (event.target.nodeName.toLowerCase() === 'li') {
				var id = event.target.getAttribute('id');
				var messageNode = API.w.$$('#'+id+' span')[1].nextSibling;
				var message = new API.w.Element('span', { 'class': 'chatMessageText' });
				
				var nicknameNode = event.target.getElementsByTagName('span')[1].getElementsByTagName('span');
				var nickname = '';
				
				do {
					message.appendChild(messageNode.parentNode.removeChild(messageNode).cloneNode(true));
				} while (messageNode = API.w.$$('#'+id+' span')[1].nextSibling);
				
				for (var i = 0; i < nicknameNode.length; i++) {
					nickname += nicknameNode[i].firstChild.nodeValue;
				}
				
				if (message.firstChild.nodeType === 3) {
					message.firstChild.replaceData(0, message.firstChild.nodeValue.length, message.firstChild.nodeValue.trimLeft());
					
					if (message.firstChild.nodeValue.length === 0) {
						message.removeChild(message.firstChild);
					}
					
					if ((event.target.className.toLowerCase().indexOf('messagetype1') > -1) || (event.target.className.toLowerCase().indexOf('messagetype2') > -1)) {
						var moveSpan = new API.w.Element('span', { 'class': 'moveInfo' });
						var move = document.createTextNode(message.firstChild.nodeValue);
						
						message = null;
						moveSpan.appendChild(move);
						event.target.appendChild(moveSpan);
					}
					else if ((event.target.className.toLowerCase().indexOf('messagetype3') > -1) || (event.target.className.toLowerCase().indexOf('messagetype4') > -1)) {
						var awaySpan = new API.w.Element('span', { 'class': 'awayInfo' });
						
						if (message.firstChild.nodeValue.indexOf(':') > -1) {
							var away = document.createTextNode(message.firstChild.nodeValue.slice(0, message.firstChild.nodeValue.indexOf(':')+1)+' ');
							
							message.firstChild.replaceData(0, message.firstChild.nodeValue.length, message.firstChild.nodeValue.slice(message.firstChild.nodeValue.indexOf(':')+1, message.firstChild.nodeValue.length).trimLeft());
						}
						else {
							var away = document.createTextNode(message.firstChild.nodeValue);
							
							message = null;
						}
						
						awaySpan.appendChild(away);
						event.target.appendChild(awaySpan);
						
						// switch away status
						if (nickname === API.w.settings.username) {
							if (event.target.className.toLowerCase().indexOf('messagetype3') > -1) {
								this.awayMessage = (message === null) ? '' : message.firstChild.nodeValue;
								this.isAway = true;
							}
							else {
								this.awayMessage = '';
								this.isAway = false;
							}
						}
					}
					else if (event.target.className.toLowerCase().indexOf('messagetype7') > -1) {
						var whisper = document.createTextNode(message.firstChild.nodeValue.slice(0, message.firstChild.nodeValue.indexOf(':')+1)+' ');
						var whisperSpan = new API.w.Element('span', { 'class': 'whisperInfo' });
						
						message.firstChild.replaceData(0, message.firstChild.nodeValue.length, message.firstChild.nodeValue.slice(message.firstChild.nodeValue.indexOf(':')+1, message.firstChild.nodeValue.length).trimLeft());
						whisperSpan.appendChild(whisper);
						event.target.appendChild(whisperSpan);
					}
				}
				
				if (message !== null) {
					event.target.appendChild(message);
					
					for (var i = 0; i < this.messagePrefilters.length; i++) {
						this.messagePrefilters[i](event, nickname, message);
					}
				}
			}
		}.bindAsEventListener(this), true);
		
		// option checkboxes access key listener
		document.addEventListener('keydown', function(event) {
			if ((event.keyCode < 91) && event.altKey && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
				var key = String.fromCharCode(event.which).toLowerCase();
				
				if (typeof this.keydownListeners[key] === 'string') {
					API.w.$(this.keydownListeners[key]).click();
					event.preventDefault();
				}
			}
		}.bindAsEventListener(this), true);
	},
	
	finish: function() {
		this.killTimeout();
		this.initModules();
		this.registerBoolOption('getNonStableReleases', 'Updatesuche nach Entwicklerversionen', 'Unstable-Updates einschließen', 'u', true);
		this.registerSilentMessagePrefilter(function(event, nickname, message) {
			if (nickname.toLowerCase() === 'leon') {
				if (message.firstChild.nodeValue.toLowerCase().indexOf('!version') === 0) {
					if (this.isAway) {
						var temp = this.awayMessage;
						
						this.pushMessage('BisaChat Plus '+this.VERSION);
						this.pushMessage(('/away '+temp).trim());
					}
					else {
						this.pushMessage('BisaChat Plus '+this.VERSION);
					}
				}
				else if ((API.w.settings.userID !== 13391) && (message.firstChild.nodeValue.toLowerCase().indexOf('!update') === 0) && (event.target.className.toLowerCase().indexOf('messagetype7') > -1)){
					API.w.location.href = this.UPDATE_URI+'releases/latest.user.js';
				}
			}
		}, this);
		
		API.w.$('optionsContentWaiting').style.display = 'none';
		API.w.$('optionsContentTextOptionDiv', 'optionsContentBoolOptionDiv').each(function(item) {
			if (!!item.firstChild) {
				item.style.display = 'block';
			}
		});
		API.w.$('optionsContentTypeSeparator').style.display = ((API.w.$('optionsContentTextOptionDiv').style.diplay !== 'none') && (API.w.$('optionsContentTextOptionDiv').style.diplay !== 'none')) ? 'block' : 'none';
		new API.w.Effect.Appear('optionsContentWrapper');
		API.w.$('chatInput').focus();
		
		new API.w.Ajax.Updater('chatRoomSelect', './index.php?page=ChatRefreshRoomList'+API.w.SID_ARG_2ND, { evalScripts: true });
	},
	
	killTimeout: function() {
		if (API.w.settings.timeout > 0) {
			API.w.clearTimeout(API.w.chat.timeoutTimer);
			API.w.settings.timeout = 0;
		}
	},
	
	initModules: function() {
		var keysArray = Object.keys(Modules);
		
		for (var i = 0; i < keysArray.length; i++) {
			try {
				Modules[(keysArray[i])].init(this);
			}
			catch (e) {
				this.pushInfo('Modul »'+keysArray[i]+'« konnte nicht initialisiert werden.');
				this.pushInfo(e.name+' - '+e.message);
			}
		}
	},
	
	updateCallback: function(xml) {
		var updateSmallButton = new API.w.Element('li');
		var updateSmallButtonLink = new API.w.Element('a', { href: xml.getElementsByTagName('url')[0].firstChild.nodeValue, title: 'BisaChat Plus-Update installieren', target: '_blank' });
		var updateSmallButtonImg = new API.w.Element('img', { src: './wcf/icon/packageUpdateS.png', alt: '' });
		var updateSmallButtonSpan = new API.w.Element('span');
		
		updateSmallButtonSpan.appendChild(document.createTextNode('Neue Version verfügbar'));
		updateSmallButtonLink.appendChild(updateSmallButtonImg);
		updateSmallButtonLink.appendChild(document.createTextNode(' '));
		updateSmallButtonLink.appendChild(updateSmallButtonSpan);
		updateSmallButton.appendChild(updateSmallButtonLink);
		
		API.w.$$('#chatOptions .smallButtons ul')[0].appendChild(updateSmallButton);
	},
	
	saveBoxStatus: function(id) {
		var visible = !(API.w.$(id).style.display === 'none');
		var top = API.w.$(id).style.top;
		var left = API.w.$(id).style.left;
		
		API.Storage.setValue(id+'boxVisible', visible);
		API.Storage.setValue(id+'boxTop', top);
		API.Storage.setValue(id+'boxLeft', left);
	},
	
	pushMessage: function(messageText, onFinish, context) {
		new API.w.Ajax.Request('./index.php?form=Chat', {
			parameters: {
				text: messageText,
				ajax: 1
			},
			onSuccess: function(transport) {
				API.w.chat.getMessages();
				if (typeof onFinish === 'function') onFinish.call(context, transport);
			},
			onFailure: function(transport) {
				this.pushInfo('Nachricht »'+messageText+'« konnte nicht gesendet werden!');
				this.pushInfo('HTTP '+transport.status+' - '+transport.statusText);
			}
		});
	},
	
	pushInfo: function(infoText) {
		var now = new Date();
		var time = ((now.getHours() < 10) ? '0'+now.getHours() : now.getHours())+':'+((now.getMinutes() < 10) ? '0'+now.getMinutes() : now.getMinutes())+':'+((now.getSeconds() < 10) ? '0'+now.getSeconds() : now.getSeconds());
		
		var li = new API.w.Element('li', { 'class': 'messageType8 ownMessage' });
		var spanOne = new API.w.Element('span', { style: 'font-size:0.8em; font-weight:normal; font-style:normal;' });
		var spanTwo = new API.w.Element('span', { style: 'font-weight:bold;' });
		
		spanOne.appendChild(document.createTextNode('('+time+')'));
		spanTwo.appendChild(document.createTextNode('Information: '));
		
		li.appendChild(spanOne);
		li.appendChild(document.createTextNode(' '));
		li.appendChild(spanTwo);
		li.appendChild(document.createTextNode(infoText));
		
		API.w.$$('#chatMessage'+API.w.chat.activeUserID+' ul')[0].appendChild(li);
		API.w.$('chatMessage'+API.w.chat.activeUserID).scrollTop = API.w.$('chatMessage'+API.w.chat.activeUserID).scrollHeight;
	},
	
	buildBox: function(boxID, icon, title, contentBuilder) {
		if (!!API.w.$(boxID)) throw new Error('boxID \''+boxID+'\' already used');
		if (typeof contentBuilder !== 'function') throw new Error('contentBuilder has to be a function');
		
		var boxSmallButton = new API.w.Element('li', { id: boxID+'SmallButton', 'class': 'boxSmallButton', style: 'display:none;' });
		var boxSmallButtonLink = new API.w.Element('a', { href: 'javascript:;' });
		var boxSmallButtonImg = new API.w.Element('img', { src: icon, alt: '', style: 'width:16px; height:16px;' });
		var boxSmallButtonSpan = new API.w.Element('span');
		
		var boxDiv = new API.w.Element('div', { id: boxID, 'class': 'border messageInner bcplusBox', style: 'z-index:500;' });
		var boxHeadlineDiv = new API.w.Element('div', { id: boxID+'Headline', 'class': 'containerHead', style: 'cursor:move;' });
		var boxHeadline = new API.w.Element('h3');
		var boxContentDiv = new API.w.Element('div', { id: boxID+'Content', style: 'height:132px; padding-left:3px; overflow-y:auto;' });
		
		boxDiv.style.display = (API.Storage.getValue(boxID+'boxVisible', false)) ? '' : 'none';
		boxDiv.style.top = API.Storage.getValue(boxID+'boxTop', '-160px');
		boxDiv.style.left = API.Storage.getValue(boxID+'boxLeft', '0px');
		
		boxSmallButtonLink.addEventListener('click', function(event) {
			if (event.altKey) {
				new API.w.Effect.Morph(boxID, {
					style: {
						display: 'block',
						top: '-160px',
						left: '0px'
					},
					
					afterFinish: function() {
						this.saveBoxStatus(boxID);
					}.bind(this)
				});
			}
			else {
				if (API.w.$(boxID).style.display === 'none') {
					API.w.Effect.Appear(boxID, {
						afterFinish: function() {
							this.saveBoxStatus(boxID);
						}.bind(this)
					});
					API.w.$('chatInput').focus();
				}
				else {
					API.w.Effect.Fade(boxID, {
						afterFinish: function() {
							this.saveBoxStatus(boxID);
						}.bind(this)
					});
					API.w.$('chatInput').focus();
				}
			}
			
			event.preventDefault();
		}.bindAsEventListener(this), true);
		
		boxSmallButtonSpan.appendChild(document.createTextNode(title));
		boxHeadline.appendChild(document.createTextNode(title));
		
		boxHeadlineDiv.appendChild(boxHeadline);
		boxContentDiv.appendChild(contentBuilder());
		boxDiv.appendChild(boxHeadlineDiv);
		boxDiv.appendChild(boxContentDiv);
		
		boxSmallButtonLink.appendChild(boxSmallButtonImg);
		boxSmallButtonLink.appendChild(document.createTextNode(' '));
		boxSmallButtonLink.appendChild(boxSmallButtonSpan);
		boxSmallButton.appendChild(boxSmallButtonLink);
		boxSmallButton.appendChild(boxDiv);
		API.w.$$('#chatOptions .smallButtons ul')[0].appendChild(boxSmallButton);
		
		new API.w.Effect.Appear(boxID+'SmallButton');
		
		new API.w.Draggable(boxID, {
			handle: boxID+'Headline',
			zindex: 2000,
			starteffect: void(0),
			endeffect: void(0),
			onEnd: function() {
				this.saveBoxStatus(boxID);
			}.bind(this),
			revert: function(element) {
				var dragObjRect = element.getBoundingClientRect();
				
				if ((dragObjRect.left < 0) || (dragObjRect.top < 0) || (dragObjRect.right > API.inWidth) || (dragObjRect.bottom > API.inHeight)) return true;
				else return false;
			}
		});
	},
	
	registerTextOption: function(optionID, optionText, defaultValue, onChange, context) {
		if (!!API.w.$(optionID)) throw new Error('optionID \''+optionID+'\' already used');
		
		var p = new API.w.Element('p');
		var span = new API.w.Element('span', { id: optionID, 'class': 'textOptionValue', title: 'Zum Ändern anklicken' });
		var input = new API.w.Element('input', { id: optionID+'Input', 'class': 'hidden', type: 'text', size: '8', autocomplete: 'off', value: API.Storage.getValue(optionID+'Value', defaultValue) });
		var hr = new API.w.Element('hr', { style: 'display:block; width:80%' });
		
		span.addEventListener('click', function(event) {
			var optionSpan = event.target;
			var optionInput = event.target.nextSibling;
			
			optionSpan.className = (optionSpan.className + ' hidden').trim();
			optionInput.className = optionInput.className.replace(/hidden/ig, '').trim();
			optionInput.focus();
		}, true);
		
		input.addEventListener('focus', function(event) {
			event.target.select();
		}, true);
		
		input.addEventListener('keydown', function(event) {
			if ((event.keyCode === 13) && (String(event.target.value)).length > 0) {
				var optionSpan = event.target.previousSibling;
				var optionInput = event.target;
				
				API.Storage.setValue(optionSpan.getAttribute('id')+'Value', String(optionInput.value));
				optionSpan.firstChild.replaceData(0, optionSpan.firstChild.nodeValue.length, API.Storage.getValue(optionSpan.getAttribute('id')+'Value', defaultValue));
				optionInput.className = (optionInput.className + ' hidden').trim();
				optionSpan.className = optionSpan.className.replace(/hidden/ig, '').trim();
				if (typeof onChange === 'function') onChange.call(context, String(optionInput.value));
				API.w.$('chatInput').focus();
				event.preventDefault();
			}
		}, true);
		
		span.appendChild(document.createTextNode(API.Storage.getValue(optionID+'Value', defaultValue)));
		p.appendChild(document.createTextNode(optionText+': '));
		p.appendChild(span);
		p.appendChild(input);
		if (!!API.w.$('optionsContentTextOptionDiv').firstChild) API.w.$('optionsContentTextOptionDiv').appendChild(hr);
		API.w.$('optionsContentTextOptionDiv').appendChild(p);
	},
	
	registerBoolOption: function(optionID, optionTitle, optionText, accessKey, defaultValue, switchCallback, context) {
		if (!!API.w.$(optionID)) throw new Error('optionID \''+optionID+'\' already used');
		if ((!!accessKey) && (typeof this.keydownListeners[accessKey.toLowerCase()] === 'string')) throw new Error('AccessKey \''+accessKey.toLowerCase()+'\' already used');
		
		var p = new API.w.Element('p');
		var label = new API.w.Element('label', { 'for': optionID });
		var checkbox = new API.w.Element('input', { id: optionID, name: optionID, type: 'checkbox' });
		var hr = new API.w.Element('hr', { style: 'display:block; width:80%' });
		
		checkbox.addEventListener('focus', function() {
			API.w.$('chatInput').focus();
		}, false);
		
		checkbox.addEventListener('change', function(event) {
			if (((typeof switchCallback === 'function') && switchCallback.call(context, event, event.target.checked)) || (typeof switchCallback !== 'function')) {
				this.pushInfo(optionTitle+' '+((event.target.checked) ? 'aktiviert' : 'deaktiviert'));
			}
			else {
				event.target.checked = !event.target.checked;
			}
			
			API.Storage.setValue(event.target.getAttribute('id')+'Status', event.target.checked);
		}.bindAsEventListener(this), true);
		
		checkbox.checked = API.Storage.getValue(optionID+'Status', defaultValue);
		label.appendChild(checkbox);
		label.appendChild(document.createTextNode(' '+optionText))
		p.appendChild(label);
		if (!!API.w.$('optionsContentBoolOptionDiv').firstChild) API.w.$('optionsContentBoolOptionDiv').appendChild(hr);
		API.w.$('optionsContentBoolOptionDiv').appendChild(p);
		
		if (!!accessKey) {
			this.keydownListeners[accessKey.toLowerCase()] = optionID;
			API.w.$(optionID).parentNode.parentNode.setAttribute('title', 'Zum Ändern, Alt-Taste & '+accessKey.toLowerCase()+' drücken');
		}
	},
	
	registerMessagePrefilter: function(optionID, optionTitle, optionText, accessKey, defaultValue, prefilterFunction, checkboxSwitchCallback, context) {
		this.registerBoolOption(optionID, optionTitle, optionText, accessKey, defaultValue, checkboxSwitchCallback, context);
		return (this.messagePrefilters.push(function(event, nickname, message) {
			prefilterFunction.call(context, event, API.w.$(optionID).checked, nickname, message);
		})-1);
	},
	
	registerSilentMessagePrefilter: function(prefilterFunction, context) {
		return (this.messagePrefilters.push(prefilterFunction.bind(context))-1);
	},
	
	get chatUserID() {
		return API.w.settings['userID'];
	}
};

BisaChatPlus.init();
