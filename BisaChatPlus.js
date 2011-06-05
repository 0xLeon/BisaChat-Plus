/*
 * BisaChat Plus
 */
var BisaChatPlus = {
	get VERSION() {
		return '{version}';
	},
	
	smiliesTmp: [ ],
	messagePrefilters: [ ],
	keydownListeners: { },
	
	init: function() {
		try {
			this.addStyleRules();
			this.breakCage();
			this.buildOptionsBox();
			this.buildSmiliesBox();
			this.buildRoomSelect();
			this.addEventListeners();
			this.finish();
		}
		finally {
			API.checkForUpdates('http://projects.swallow-all-lies.com/greasemonkey/files/bisachatPlus/', this, this.updateCallback, API.Storage.getValue('getNonStableReleasesStatus', true));
		}
	},
	
	addStyleRules: function() {
		API.addStyle('body { overflow: hidden; }');
		API.addStyle('html, body { height: '+API.inHeight+'px !important; }');
		API.addStyle('.hidden { display: none; }');
		API.addStyle('.column { border: 0px !important; }');
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
		API.addStyle('#chatOptions { display: none; }');
		API.addStyle('#smiliesSmallButton, #optionsSmallButton { position: relative; }');
		API.addStyle('#smilies, #options { position: absolute; width: 255px; height: 155px !important; top: -160px; left: 0px; padding-left: 1px; padding-top: 1px; -moz-border-radius-bottomleft: 0px; -moz-border-radius-bottomright: 0px; }');
		API.addStyle('#smiliesList li { border: none !important; margin-left: 3px; margin-right: 3px; height: 30px; float: left; }');
		API.addStyle('.textOptionValue { cursor: pointer; }');
		API.addStyle('.textOptionValue:hover { text-decoration: underline; }');
		
		API.w.$$('#chatBox .columnContainer')[0].style.width = API.inWidth+'px';
		var boxesHeight = (API.inHeight-(parseInt(API.w.$$('#chatBox .subTabMenu')[0].offsetHeight)))+'px';
		(API.w.$$('#chatBox > .border, #chatBox > .border > .layout-2, .columnContainer > .column > .columnInner, .columnContainer > .second > .columnInner > div:first-child, #chatMembers')).each(function(item) {
			item.style.border = 'none';
			item.style.height = boxesHeight;
		});
	},
	
	breakCage: function() {
		var tmp = API.w.$('chatBox').cloneNode(true);
		(API.w.$$('#smileyList ul > li')).each(function(item) {
			this.smiliesTmp.push(item.cloneNode(true));
		}, this);
		
		API.w.$('headerContainer').parentNode.removeChild(API.w.$('headerContainer'));
		API.w.$('mainContainer').parentNode.removeChild(API.w.$('mainContainer'));
		API.w.$('footerContainer').parentNode.removeChild(API.w.$('footerContainer'));
		API.w.$$('body')[0].appendChild(tmp);
		delete tmp;
		
		API.w.$$('.tabMenu')[0].parentNode.removeChild(API.w.$$('.tabMenu')[0]);
		API.w.$('smileys').parentNode.removeChild(API.w.$('smileys'));
		API.w.$(API.w.$('chatColorPickerContainer')).parentNode.removeChild(API.w.$('chatColorPickerContainer').nextSibling);
	},
	
	buildOptionsBox: function() {
		var optionsSmallButton = new API.w.Element('li', { id: 'optionsSmallButton' });
		var optionsSmallButtonLink = new API.w.Element('a', { href: 'javascript:;' });
		var optionsSmallButtonImg = new API.w.Element('img', { src: './wcf/icon/editS.png', alt: '', style: 'width:16px; height:16px;' });
		var optionsSmallButtonSpan = new API.w.Element('span');
		
		var optionsDiv = new API.w.Element('div', { id: 'options', 'class': 'border messageInner', style: 'z-index:500;' });
		var optionsHeadlineDiv = new API.w.Element('div', { id: 'optionsHeadline', 'class': 'containerHead', style: 'cursor:move;' });
		var optionsHeadline = new API.w.Element('h3');
		var optionsContentDiv = new API.w.Element('div', { id: 'optionsContent', style: 'height:132px; padding-left:3px; overflow-y:auto;' });
		var optionsContentBoolOptionDiv = new API.w.Element('div', { id: 'optionsContentBoolOptionDiv' });
		var optionsContentTextOptionDiv = new API.w.Element('div', { id: 'optionsContentTextOptionDiv' });
		var optionsContentHr = new API.w.Element('hr', { style: 'display:block; width:80%' });
		
		optionsDiv.style.display = (API.Storage.getValue('optionsboxVisible', false)) ? '' : 'none';
		optionsDiv.style.top = API.Storage.getValue('optionsboxTop', '-160px');
		optionsDiv.style.left = API.Storage.getValue('optionsboxLeft', '0px');
		
		optionsSmallButtonLink.addEventListener('click', function(event) {
			if (event.altKey) {
				new API.w.Effect.Morph('options', {
					style: {
						display: 'block',
						top: '-160px',
						left: '0px'
					},
					
					afterFinish: function() {
						this.saveBoxStatus('options');
					}.bind(this)
				});
			}
			else {
				if (API.w.$('options').style.display === 'none') {
					API.w.Effect.Appear('options', {
						afterFinish: function() {
							this.saveBoxStatus('options');
						}.bind(this)
					});
					API.w.$('chatInput').focus();
				}
				else {
					API.w.Effect.Fade('options', {
						afterFinish: function() {
							this.saveBoxStatus('options');
						}.bind(this)
					});
					API.w.$('chatInput').focus();
				}
			}
			
			event.preventDefault();
		}.bindAsEventListener(this), true);
		
		optionsSmallButtonSpan.appendChild(document.createTextNode('Optionen'));
		optionsHeadline.appendChild(document.createTextNode('Optionen'));
		
		optionsHeadlineDiv.appendChild(optionsHeadline);
		optionsDiv.appendChild(optionsHeadlineDiv);
		optionsContentDiv.appendChild(optionsContentBoolOptionDiv);
		optionsContentDiv.appendChild(optionsContentHr);
		optionsContentDiv.appendChild(optionsContentTextOptionDiv);
		optionsDiv.appendChild(optionsContentDiv);
		
		optionsSmallButtonLink.appendChild(optionsSmallButtonImg);
		optionsSmallButtonLink.appendChild(document.createTextNode(' '));
		optionsSmallButtonLink.appendChild(optionsSmallButtonSpan);
		optionsSmallButton.appendChild(optionsSmallButtonLink);
		optionsSmallButton.appendChild(optionsDiv);
		API.w.$$('#chatForm .smallButtons ul')[0].appendChild(optionsSmallButton);
		
		new API.w.Draggable('options', {
			handle: 'optionsHeadline',
			zindex: 2000,
			starteffect: void(0),
			endeffect: void(0),
			onEnd: function() {
				this.saveBoxStatus('options');
			}.bind(this),
			revert: function(element) {
				var dragObjRect = element.getBoundingClientRect();
				
				if ((dragObjRect.left < 0) || (dragObjRect.top < 0) || (dragObjRect.right > API.inWidth) || (dragObjRect.bottom > API.inHeight)) return true;
				else return false;
			}.bindAsEventListener(this)
		});
	},
	
	buildSmiliesBox: function() {
		var smiliesSmallButton = new API.w.Element('li', { id: 'smiliesSmallButton' });
		var smiliesSmallButtonLink = new API.w.Element('a', { href: 'javascript:;' });
		var smiliesSmallButtonImg = new API.w.Element('img', { src: './wcf/images/smilies/smile.png', alt: '', style: 'width:16px; height:16px;' });
		var smiliesSmallButtonSpan = new API.w.Element('span');
		
		var smiliesDiv = new API.w.Element('div', { id: 'smilies', 'class': 'border messageInner', style: 'z-index:500;' });
		var smiliesHeadlineDiv = new API.w.Element('div', { id: 'smiliesHeadline', 'class': 'containerHead', style: 'cursor:move;' });
		var smiliesHeadline = new API.w.Element('h3');
		var smiliesContentDiv = new API.w.Element('div', { id: 'smiliesContent', style: 'height:132px; padding-left:3px; overflow-y:auto;' });
		var smiliesListDiv = new API.w.Element('div', { id: 'smiliesList' });
		var smiliesUl = new API.w.Element('ul', { 'class': 'smileys' });
		
		for (var i = 0; i < this.smiliesTmp.length; i++) {
			smiliesUl.appendChild(this.smiliesTmp[i].cloneNode(true));
		}
		delete this.smiliesTmp;
		
		smiliesDiv.style.display = (API.Storage.getValue('smiliesboxVisible', false)) ? '' : 'none';
		smiliesDiv.style.top = API.Storage.getValue('smiliesboxTop', '-160px');
		smiliesDiv.style.left = API.Storage.getValue('smiliesboxLeft', '0px');
		
		smiliesSmallButtonLink.addEventListener('click', function(event) {
			if (event.altKey) {
				new API.w.Effect.Morph('smilies', {
					style: {
						display: 'block',
						top: '-160px',
						left: '0px'
					},
					
					afterFinish: function() {
						this.saveBoxStatus('smilies');
					}.bind(this)
				});
			}
			else {
				if (API.w.$('smilies').style.display === 'none') {
					API.w.Effect.Appear('smilies', {
						afterFinish: function() {
							this.saveBoxStatus('smilies');
						}.bind(this)
					});
					API.w.$('chatInput').focus();
				}
				else {
					API.w.Effect.Fade('smilies', {
						afterFinish: function() {
							this.saveBoxStatus('smilies');
						}.bind(this)
					});
					API.w.$('chatInput').focus();
				}
			}
			
			event.preventDefault();
		}.bindAsEventListener(this), true);
		
		smiliesSmallButtonSpan.appendChild(document.createTextNode('Smileys'));
		smiliesHeadline.appendChild(document.createTextNode('Smileys'));
		
		smiliesListDiv.appendChild(smiliesUl);
		smiliesContentDiv.appendChild(smiliesListDiv);
		smiliesHeadlineDiv.appendChild(smiliesHeadline);
		smiliesDiv.appendChild(smiliesHeadlineDiv);
		smiliesDiv.appendChild(smiliesContentDiv);
		
		smiliesSmallButtonLink.appendChild(smiliesSmallButtonImg);
		smiliesSmallButtonLink.appendChild(document.createTextNode(' '));
		smiliesSmallButtonLink.appendChild(smiliesSmallButtonSpan);
		smiliesSmallButton.appendChild(smiliesSmallButtonLink);
		smiliesSmallButton.appendChild(smiliesDiv);
		API.w.$$('#chatForm .smallButtons ul')[0].appendChild(smiliesSmallButton);
		
		new API.w.Draggable('smilies', {
			handle: 'smiliesHeadline',
			zindex: 2000,
			starteffect: void(0),
			endeffect: void(0),
			onEnd: function() {
				this.saveBoxStatus('smilies');
			}.bind(this),
			revert: function(element) {
				var dragObjRect = element.getBoundingClientRect();
				
				if ((dragObjRect.left < 0) || (dragObjRect.top < 0) || (dragObjRect.right > API.inWidth) || (dragObjRect.bottom > API.inHeight)) return true;
				else return false;
			}
		});
		
		this.registerMessagePrefilter('enablesmilies', 'Smileys', 'Darstellung von Smileys aktivieren', 'p', false, function(event, checked, nickname, message) {
			if (!checked) {
				var smilies = API.w.$A(message.getElementsByTagName('img'));
				
				if (smilies.length > 0) {
					smilies.each(function(item) {
						message.replaceChild(document.createTextNode(String(item.getAttribute('alt'))), item);
					});
				}
			}
		});
	},
	
	buildRoomSelect: function() {
		var roomSelectSmallButton = new API.w.Element('li', { id: 'chatOptionsTemp' });
		var roomSelectSmallButtonLink = new API.w.Element('a', { id: 'changeRoom', style: 'display:inline-block; -moz-border-radius-topright:0px !important; -moz-border-radius-bottomright:0px !important;' });
		var roomSelectSmallButtonSpan = new API.w.Element('span');
		var roomSelectSmallButtonMenu = new API.w.Element('div', { id: 'changeRoomMenu', 'class': 'hidden' });
		var roomSelectSmallButtonMenuList = this.getRoomList();
		
		var roomSelectSmallButtonUpdateLink = new API.w.Element('a', { id: 'changeRoomUpdate', title: 'Raumliste neu laden', style: 'display:inline-block; top:1px !important; -moz-border-radius-topleft:0px !important; -moz-border-radius-bottomleft:0px !important;' });
		var roomSelectSmallButtonUpdateImage = new API.w.Element('img', { src: './wcf/icon/packageUpdateS.png', alt: '' });
		
		roomSelectSmallButtonUpdateLink.addEventListener('click', function(event) {
			new API.w.Ajax.Updater('chatExtraRoomContainer', 'index.php?page=ChatRefreshRoomList', {
				evalScripts: true,
				onCreate: function(response) {
					API.w.$('changeRoomUpdate').style.opacity = 0.5;
				},
				onComplete: function(respone, json) {
					API.w.$('changeRoomMenu').replaceChild(this.getRoomList(), API.w.$('changeRoomMenuList'));
					API.w.$('changeRoomUpdate').style.opacity = 1.0;
				}.bind(this)
			});
		}.bindAsEventListener(this), true);
		
		roomSelectSmallButtonUpdateLink.appendChild(roomSelectSmallButtonUpdateImage);
		
		roomSelectSmallButtonSpan.appendChild(document.createTextNode('Aktueller Raum: '+String(roomSelectSmallButtonMenuList.getElementsByClassName('active')[0].getElementsByTagName('span')[0].firstChild.nodeValue).trim()));
		roomSelectSmallButtonLink.appendChild(roomSelectSmallButtonSpan);
		roomSelectSmallButtonMenu.appendChild(roomSelectSmallButtonMenuList);
		roomSelectSmallButton.appendChild(roomSelectSmallButtonLink);
		roomSelectSmallButton.appendChild(roomSelectSmallButtonUpdateLink);
		roomSelectSmallButton.appendChild(roomSelectSmallButtonMenu);
		API.w.$$('#chatForm .smallButtons ul')[0].appendChild(roomSelectSmallButton);
		
		API.w.popupMenuList.register('changeRoom');
	},
	
	getRoomList: function() {
		var roomSelectSmallButtonMenuList = new API.w.Element('ul', { id: 'changeRoomMenuList' });
		
		(API.w.$$('#chatOptions option')).each(function(item) {
			var roomSelectSmallButtonMenuListItem = new API.w.Element('li', { id: String(item.getAttribute('id'))+'Temp' });
			var roomSelectSmallButtonMenuListItemLink = new API.w.Element('a');
			var roomSelectSmallButtonMenuListItemSpan = new API.w.Element('span');
			var roomSelectSmallButtonMenuListItemInput = new API.w.Element('input', { type: 'hidden', value: String(item.getAttribute('value')) });
			
			roomSelectSmallButtonMenuListItem.addEventListener('click', function(event) {
				var li = (event.target.parentNode.nodeName.toLowerCase() === 'li') ? event.target.parentNode : event.target.parentNode.parentNode;
				
				if (!!li.getAttribute('class')) {
					return false;
				}
				else {
					API.w.$$('#changeRoomMenu li.active')[0].setAttribute('class', '');
					window.location.hash = li.getElementsByTagName('input')[0].getAttribute('value');
					API.w.$$('#changeRoom > span')[0].firstChild.replaceData(0, API.w.$$('#changeRoom > span')[0].firstChild.nodeValue.length, 'Aktueller Raum: '+String(li.getElementsByTagName('span')[0].firstChild.nodeValue).trim());
					li.setAttribute('class', 'active');
				}
			}, true);
			
			if (item.selected) roomSelectSmallButtonMenuListItem.setAttribute('class', 'active');
			roomSelectSmallButtonMenuListItemSpan.appendChild(document.createTextNode(String(item.innerHTML).trim()));
			roomSelectSmallButtonMenuListItemLink.appendChild(roomSelectSmallButtonMenuListItemSpan);
			roomSelectSmallButtonMenuListItem.appendChild(roomSelectSmallButtonMenuListItemLink);
			roomSelectSmallButtonMenuListItem.appendChild(roomSelectSmallButtonMenuListItemInput);
			roomSelectSmallButtonMenuList.appendChild(roomSelectSmallButtonMenuListItem);
			
			delete roomSelectSmallButtonMenuListItem;
			delete roomSelectSmallButtonMenuListItemLink;
			delete roomSelectSmallButtonMenuListItemSpan;
			delete roomSelectSmallButtonMenuListItemInput;
		});
		
		return roomSelectSmallButtonMenuList;
	},
	
	addEventListeners: function() {
		// window resize listener
		unsafeWindow.addEventListener('resize', function() {
			API.w.$('chatBox').style.height = API.inHeight+'px';
			API.w.$$('#chatBox .columnContainer')[0].style.width = API.inWidth+'px';
			var boxesHeight = (API.inHeight-(parseInt(API.w.$$('#chatBox .subTabMenu')[0].offsetHeight)))+'px';
			(API.w.$$('#chatBox > .border, #chatBox > .border > .layout-2, .columnContainer > .column > .columnInner, .columnContainer > .second > .columnInner > div:first-child, #chatMembers')).each(function(item) {
				item.style.height = boxesHeight;
			});
		}, false);
		
		// message prefilter listener
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
					
					if (message.firstChild.nodeValue.length === 0) message.removeChild(message.firstChild);
				}
				
				event.target.appendChild(message);
				
				for (var i = 0; i < this.messagePrefilters.length; i++) {
					this.messagePrefilters[i](event, nickname, message);
				}
			}
		}.bindAsEventListener(this), true);
		
		// option checkboxes access key listener
		document.addEventListener('keydown', function(event) {
			if (event.altKey && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
				var key = String.fromCharCode(event.keyCode).toLowerCase();
				
				if (typeof this.keydownListeners[key] === 'string') {
					API.w.$(this.keydownListeners[key]).click();
					event.preventDefault();
				}
			}
		}.bindAsEventListener(this), true);
	},
	
	finish: function() {
		this.initModules();
		this.registerBoolOption('getNonStableReleases', 'Updatesuche nach Entwicklerversionen', 'Unstable-Updates einschließen', 'u', true, null);
		API.w.$('chatInput').focus();
	},
	
	initModules: function() {
		var keysArray = Object.keys(Modules);
		
		for (var i = 0; i < keysArray.length; i++) {
			Modules[(keysArray[i])].init(this);
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
		
		API.w.$$('#chatForm .smallButtons ul')[0].appendChild(updateSmallButton);
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
		GM_xmlhttpRequest({
			method: 'POST',
			url: './index.php?form=Chat',
			data: 'text='+encodeURIComponent(messageText)+'&ajax=1',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Accept': '*/*'
			},
			onload: function(response) {
				if (response.readyState === 4) {
					API.w.chat.getMessages();
					if (typeof onFinish === 'function') onFinish.call(context, response);
				}
			},
			onerror: function(response) {
				this.pushInfo('Nachricht »'+messageText+'« konnte nicht gesendet werden!');
			}.bindAsEventListener(this)
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
	
	registerTextOption: function(optionID, optionText, defaultValue) {
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
			API.Storage.setValue(event.target.getAttribute('id')+'Status', event.target.checked);
			this.pushInfo(optionTitle+' '+((event.target.checked) ? 'aktiviert' : 'deaktiviert'));
			if (typeof switchCallback === 'function') switchCallback.call(context, event, event.target.checked);
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
	
	registerMessagePrefilter: function(optionID, optionTitle, optionText, accessKey, defaultValue, prefilterFunction, context) {
		this.registerBoolOption(optionID, optionTitle, optionText, accessKey, defaultValue);
		this.messagePrefilters.push(function(event, nickname, message) {
			prefilterFunction.call(context, event, API.w.$(optionID).checked, nickname, message);
		});
	}
};

BisaChatPlus.init();
