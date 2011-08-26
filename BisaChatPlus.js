/*
 * BisaChat Plus
 * Copyright (c) 2011, Stefan Hahn
 */
var BisaChatPlus = {
	/**
	 * BisaChat Plus Version
	 * 
	 * @type	{String}
	 */
	get VERSION() {
		return '{version}';
	},
	
	/**
	 * Update URI
	 * 
	 * @type	{String}
	 */
	get UPDATE_URI() {
		return 'http://projects.swallow-all-lies.com/greasemonkey/files/bisachatPlus/';
	},
	
	/**
	 * Indicates wether or not the user is away
	 * 
	 * @type	{Boolean}
	 */
	isAway: false,
	
	/**
	 * If available, contains the user's away status message
	 * 
	 * @type	{String}
	 */
	awayMessage: '',
	
	/**
	 * Array of all registered prefilter functions
	 * 
	 * @private
	 * @type	{Array}
	 */
	messagePrefilters: [ ],
	
	/**
	 * Hash-like object of all access key listeners with access key as key
	 * 
	 * @private
	 * @type	{Object}
	 */
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
		API.addStyle('#chatBox > .border { padding: 0px !important; border: none !important; margin: 0px !important; position: relative; }');
		API.addStyle('#chatBox > .border > .layout-2, #chatBox .columnInner { margin: 0px !important; }');
		API.addStyle('#chatPrivatelist > li { display: list-item !important; }');
		API.addStyle('.columnContainer > .column > .columnInner { padding: 0px }');
		API.addStyle('#chatMessage { height: 85% !important; }');
		API.addStyle('#chatMessage > div[id^="chatMessage"] { height: 100% !important; padding-left: 25px; }');
		API.addStyle('#chatFormContainer { margin-left: 25px; margin-right: 25px }');
		API.addStyle('#chatMembers { margin-left: 8px; }');
		API.addStyle('.overlay { position: absolute; width: 100%; height: 100%; margin: 0px !important; clear: both; }');
		API.addStyle('.overlay > div { padding: 15px 25px; }');
		API.addStyle('.overlayCloseButton { float: right; }');
		API.addStyle('.overlayCloseButton img { padding: 15px; }');
		API.addStyle('.overlayContent { margin: 5px 0px 3px; max-height: '+(API.inHeight-110)+'px; overflow: auto; }');
		API.addStyle('.boxSmallButton, .overlaySmallButton { position: relative; }');
		API.addStyle('.bcplusBox { position: absolute; width: 255px; height: 155px !important; top: -160px; left: 0px; padding-left: 1px; padding-top: 1px; -moz-border-radius-bottomleft: 0px; -moz-border-radius-bottomright: 0px; }');
		API.addStyle('.textOptionValue { cursor: pointer; }');
		API.addStyle('.textOptionValue:hover { text-decoration: underline; }');
		
		$$('#chatBox .columnContainer')[0].style.width = API.inWidth+'px';
		var boxesHeight = (API.inHeight-(parseInt($$('#chatBox .subTabMenu')[0].offsetHeight)))+'px';
		$$('#chatBox > .border, #chatBox > .border > .layout-2, .columnContainer > .column > .columnInner, .columnContainer > .second > .columnInner > div:first-child, #chatMembers').each(function(item) {
			item.setAttribute('style', 'height: '+boxesHeight+' !important; border: none !important;');
		});
	},
	
	breakCage: function() {
		var tmp = $('chatBox').cloneNode(true);
		
		$('headerContainer').parentNode.removeChild($('headerContainer'));
		$('mainContainer').parentNode.removeChild($('mainContainer'));
		$('footerContainer').parentNode.removeChild($('footerContainer'));
		$$('body')[0].appendChild(tmp);
		delete tmp;
		
		$$('.tabMenu')[0].parentNode.removeChild($$('.tabMenu')[0]);
		$('chatColorPickerContainer').parentNode.removeChild($('chatColorPickerContainer').nextSibling);
	},
	
	avoidMultipleLogin: function() {
		if (API.Storage.getValue('alreadyOnline', false)) {
			var resetLink = new API.w.Element('a');
			
			resetLink.addEventListener('click', function(event) {
				API.Storage.setValue('alreadyOnline', false);
				API.w.location.reload();
			}, true);
			resetLink.appendChild(document.createTextNode('Falls definitiv nur ein Chattab geöffnet ist, hier klicken.'));
			$$('#chatError div')[0].innerHTML = 'Den Chat bitte nicht in mehr als einem Tab öffnen.';
			$$('#chatError div')[0].appendChild((new API.w.Element('br')));
			$$('#chatError div')[0].appendChild(resetLink);
			$('chatError').style.display = '';
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
			$('chatBox').style.height = API.inHeight+'px';
			$$('#chatBox .columnContainer')[0].style.width = API.inWidth+'px';
			var boxesHeight = (API.inHeight-(parseInt($$('#chatBox .subTabMenu')[0].offsetHeight)))+'px';
			($$('#chatBox > .border, #chatBox > .border > .layout-2, .columnContainer > .column > .columnInner, .columnContainer > .second > .columnInner > div:first-child, #chatMembers')).each(function(item) {
				item.setAttribute('style', 'height: '+boxesHeight+' !important; border: none !important;');
			});
		}, false);
		
		// message prefilter/away status listener
		$('chatMessage').addEventListener('DOMNodeInserted', function(event) {
			if (event.target.nodeName.toLowerCase() === 'li') {
				var id = event.target.getAttribute('id');
				var messageNode = $$('#'+id+' span')[1].nextSibling;
				var message = new API.w.Element('span', { 'class': 'chatMessageText' });
				
				var nicknameNode = event.target.getElementsByTagName('span')[1].getElementsByTagName('span');
				var nickname = '';
				
				do {
					message.appendChild(messageNode.parentNode.removeChild(messageNode).cloneNode(true));
				} while (messageNode = $$('#'+id+' span')[1].nextSibling);
				
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
					$(this.keydownListeners[key]).click();
					event.preventDefault();
				}
			}
		}.bindAsEventListener(this), true);
	},
	
	finish: function() {
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
		
		$('optionsContentWaiting').style.display = 'none';
		$('optionsContentTextOptionDiv', 'optionsContentBoolOptionDiv').each(function(item) {
			if (!!item.firstChild) {
				item.style.display = 'block';
			}
		});
		$('optionsContentTypeSeparator').style.display = (($('optionsContentTextOptionDiv').style.diplay !== 'none') && ($('optionsContentTextOptionDiv').style.diplay !== 'none')) ? 'block' : 'none';
		new API.w.Effect.Appear('optionsContentWrapper');
		$('chatInput').focus();
		
		new API.w.Ajax.Updater('chatRoomSelect', './index.php?page=ChatRefreshRoomList'+API.w.SID_ARG_2ND, { evalScripts: true });
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
		
		$$('#chatOptions .smallButtons ul')[0].appendChild(updateSmallButton);
	},
	
	/**
	 * Saves position and display status of a node
	 * Useful for draggable objects
	 * 
	 * @param	{String}	id	Valid DOMNode ID
	 * @returns	{undefined}		Returns nothing
	 */
	saveBoxStatus: function(id) {
		var visible = !($(id).style.display === 'none');
		var top = $(id).style.top;
		var left = $(id).style.left;
		
		API.Storage.setValue(id+'boxVisible', visible);
		API.Storage.setValue(id+'boxTop', top);
		API.Storage.setValue(id+'boxLeft', left);
	},
	
	/**
	 * Post chat message
	 * 
	 * @param	{String}	messageText	Text which to post in chat stream
	 * @param	{Function}	[onFinish]	Gets called after successful posting, ajax transport object passed as first argument
	 * @param	{Object}	[context]	Indicates where 'this' points within onFinish callback
	 * @returns	{undefined}				Returns nothing
	 */
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
	
	/**
	 * Shows information to the user only
	 * 
	 * @param	{String}	infoText	Text which to post in the user's chat stream
	 * @returns	{undefined}				Returns nothing
	 */
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
		
		$$('#chatMessage'+API.w.chat.activeUserID+' ul')[0].appendChild(li);
		$('chatMessage'+API.w.chat.activeUserID).scrollTop = $('chatMessage'+API.w.chat.activeUserID).scrollHeight;
	},
	
	/**
	 * Builds a toggable and draggable box with corresponding small button
	 * 
	 * @param	{String}	boxID			ID for box DOM node
	 * @param	{String}	icon			URI to icon image, 16*16px recommended
	 * @param	{String}	title			small button and box title text
	 * @param	{Function}	contentBuilder	Generates box content, has to return a DOM node
	 * @returns	{undefined}					Returns nothing
	 */
	buildBox: function(boxID, icon, title, contentBuilder) {
		if (!!$(boxID)) throw new Error('boxID \''+boxID+'\' already used');
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
				if ($(boxID).style.display === 'none') {
					API.w.Effect.Appear(boxID, {
						afterFinish: function() {
							this.saveBoxStatus(boxID);
						}.bind(this)
					});
					$('chatInput').focus();
				}
				else {
					API.w.Effect.Fade(boxID, {
						afterFinish: function() {
							this.saveBoxStatus(boxID);
						}.bind(this)
					});
					$('chatInput').focus();
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
		$$('#chatOptions .smallButtons ul')[0].appendChild(boxSmallButton);
		
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
	
	/**
	 * Builds a toggable overlay with corresponding small button
	 * 
	 * @param	{String}	overlayID		ID for overlay DOM node
	 * @param	{String}	icon			URI to icon image, 16*16px recommended
	 * @param	{String}	title			small button and overlay text
	 * @param	{Function}	contentBuilder	Generates overlay content, either has to return a DOM node OR accept content node reference as first parameter
	 * @param	{Function}	[beforeShow]	Called every time the overlay gets displayed
	 * @returns	{undefined}					Returns nothing
	 */
	buildOverlay: function(overlayID, icon, title, contentBuilder, beforeShow) {
		if (!!$(overlayID)) throw new Error('overlayID \''+overlayID+'\' already used');
		if (typeof contentBuilder !== 'function') throw new TypeError('contentBuilder has to be a function');
		
		var overlaySmallButton = new API.w.Element('li', { id: overlayID+'SmallButton', 'class': 'overlaySmallButton', style: 'display:none;' });
		var overlaySmallButtonLink = new API.w.Element('a', { href: 'javascript:;' });
		var overlaySmallButtonImg = new API.w.Element('img', { src: icon, alt: '', style: 'width:16px; height:16px;' });
		var overlaySmallButtonSpan = new API.w.Element('span');
		
		var overlayDiv = new API.w.Element('div', { id: overlayID, 'class': 'overlay container-1', style: 'display:none;' });
		var wrapperDiv = new API.w.Element('div');
		var contentDiv = new API.w.Element('div', { 'class': 'overlayContent' });
		
		var closeButtonDiv = new API.w.Element('div', { 'class': 'overlayCloseButton' });
		var closeButtonLink = new API.w.Element('a', { href: 'javascript:;' });
		var closeButtonImg = new API.w.Element('img', { src: 'wcf/icon/closeS.png', alt: '' });
		
		var caption = new API.w.Element('h3', { 'class': 'subHeadline' });
		
		overlaySmallButtonLink.addEventListener('click', function(event) {
			if (typeof beforeShow === 'function') beforeShow.call();
			new API.w.Effect.Appear(overlayID);
		}, true);
		
		overlaySmallButtonSpan.appendChild(document.createTextNode(title));
		overlaySmallButtonLink.appendChild(overlaySmallButtonImg);
		overlaySmallButtonLink.appendChild(document.createTextNode(' '));
		overlaySmallButtonLink.appendChild(overlaySmallButtonSpan);
		overlaySmallButton.appendChild(overlaySmallButtonLink);
		$$('#chatOptions .smallButtons ul')[0].appendChild(overlaySmallButton);
		
		closeButtonLink.addEventListener('click', function(event) {
			new API.w.Effect.Fade(overlayID);
			$('chatInput').focus();
		}, true);
		
		closeButtonLink.appendChild(closeButtonImg);
		closeButtonDiv.appendChild(closeButtonLink);
		caption.appendChild(document.createTextNode(title));
		wrapperDiv.appendChild(closeButtonDiv);
		wrapperDiv.appendChild(caption);
		wrapperDiv.appendChild(contentDiv);
		overlayDiv.appendChild(wrapperDiv);
		$('chatInitializing').parentNode.appendChild(overlayDiv);
		
		try {
			contentDiv.appendChild(contentBuilder());
		}
		catch (e) {
			contentBuilder(contentDiv);
		}
		
		new API.w.Effect.Appear(overlayID+'SmallButton');
	},
	
	/**
	 * Builds a GUI element for user-defined text content, useful for short texts
	 * 
	 * @param	{String}	optionID		ID for optionSpan DOM node
	 * @param	{String}	optionText		Short description which is displayed in front of actual value
	 * @param	{String}	defaultValue	Text option value if nothing is saved in storage
	 * @param	{Function}	[onChange]		Called when new value is set, new value passed as first argument
	 * @param	{Object}	[context]		Indicates where 'this' points within onChange callback
	 */
	registerTextOption: function(optionID, optionText, defaultValue, onChange, context) {
		if (!!$(optionID)) throw new Error('optionID \''+optionID+'\' already used');
		
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
				$('chatInput').focus();
				event.preventDefault();
			}
		}, true);
		
		span.appendChild(document.createTextNode(API.Storage.getValue(optionID+'Value', defaultValue)));
		p.appendChild(document.createTextNode(optionText+': '));
		p.appendChild(span);
		p.appendChild(input);
		if (!!$('optionsContentTextOptionDiv').firstChild) $('optionsContentTextOptionDiv').appendChild(hr);
		$('optionsContentTextOptionDiv').appendChild(p);
	},
	
	/**
	 * Builds a GUI element for switchable options
	 * 
	 * @param	{String}	optionID			ID for optionInput DOM node
	 * @param	{String}	optionTitle			Short description which is shown in chat stream when option is switched
	 * @param	{String}	optionText			Short description which is displayed in front of actual value
	 * @param	{String}	[accessKey]			One letter which indicates the acess key
	 * @param	{Boolean}	defaultValue		Option status when there is nothing in storage
	 * @param	{Function}	[switchCallback]	Called when option is about to be switched, option is only switched if switchCallback returns boolean true, two arguments passed: event{Object}: checkbox change event object, checked{Boolean}: wether or not the box is checked
	 * @param	{Object}	[context]			Indicates where 'this' points within switchCallback
	 */
	registerBoolOption: function(optionID, optionTitle, optionText, accessKey, defaultValue, switchCallback, context) {
		if (!!$(optionID)) throw new Error('optionID \''+optionID+'\' already used');
		if ((!!accessKey) && (typeof this.keydownListeners[accessKey.toLowerCase()] === 'string')) throw new Error('AccessKey \''+accessKey.toLowerCase()+'\' already used');
		
		var p = new API.w.Element('p');
		var label = new API.w.Element('label', { 'for': optionID });
		var checkbox = new API.w.Element('input', { id: optionID, name: optionID, type: 'checkbox' });
		var hr = new API.w.Element('hr', { style: 'display:block; width:80%' });
		
		checkbox.addEventListener('focus', function() {
			$('chatInput').focus();
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
		if (!!$('optionsContentBoolOptionDiv').firstChild) $('optionsContentBoolOptionDiv').appendChild(hr);
		$('optionsContentBoolOptionDiv').appendChild(p);
		
		if (!!accessKey) {
			this.keydownListeners[accessKey.toLowerCase()] = optionID;
			$(optionID).parentNode.parentNode.setAttribute('title', 'Zum Ändern, Alt-Taste & '+accessKey.toLowerCase()+' drücken');
		}
	},
	
	/**
	 * Builds a GUI element for switchable options combined with an prefilter applied to every chat message
	 * 
	 * @param	{String}	optionID					ID for optionInput DOM node
	 * @param	{String}	optionTitle					Short description which is shown in chat stream when option is switched
	 * @param	{String}	optionText					Short description which is displayed in front of actual value
	 * @param	{String}	[accessKey]					One letter which indicates the acess key
	 * @param	{Boolean}	defaultValue				Option status when there is nothing in storage
	 * @param	{Function}	prefilterFunction			Called when new messages get appened to chat stream but only, if they contain actual user generated content (not on enter messages etc.); has to accept four parameters: event{Object}: event object of inserted message, checked{Boolean}: indicates if the corresponding checkbox is checked, nickname{String}: plain nickname, message{Object}: reference to actual message node
	 * @param	{Function}	[checkboxSwitchCallback]	Called when option is about to be switched, option is only switched if switchCallback returns boolean true, two arguments passed: event{Object}: checkbox change event object, checked{Boolean}: wether or not the box is checked
	 * @param	{Object}	[context]					Indicates where 'this' points within prefilterFunction and switchCallback
	 */
	registerMessagePrefilter: function(optionID, optionTitle, optionText, accessKey, defaultValue, prefilterFunction, checkboxSwitchCallback, context) {
		this.registerBoolOption(optionID, optionTitle, optionText, accessKey, defaultValue, checkboxSwitchCallback, context);
		return (this.messagePrefilters.push(function(event, nickname, message) {
			prefilterFunction.call(context, event, $(optionID).checked, nickname, message);
		})-1);
	},
	
	/**
	 * Apply prefilter without generating a GUI element
	 * 
	 * @param	{Function}	prefilterFunction	Called when new messages get appened to chat stream but only, if they contain actual user generated content (not on enter messages etc.); has to accept three parameters: event{Object}: event object of inserted message, nickname{String}: plain nickname, message{Object}: reference to actual message node
	 * @param	{Object}	[context]			Indicates where 'this' points within prefilterFunction
	 */
	registerSilentMessagePrefilter: function(prefilterFunction, context) {
		return (this.messagePrefilters.push(prefilterFunction.bind(context))-1);
	},
	
	/**
	 * Parses message date strings and returns an unix timestamp
	 * 
	 * @param	{String}	timeString	Valid time string, should look like this: <hours>:<minutes>:<seconds>
	 * @returns	{Number}				unix timestamp in miliseconds
	 */
	parseMessageDate: function(timeString) {
		var timeArray = timeString.split(':');
		var today = new Date();
		
		if (timeArray.length !== 3) throw new Error('invalid timeString »'+timeString+'«');
		
		return ((new Date(today.getFullYear(), today.getMonth(), today.getDate(), Number(timeArray[0]), Number(timeArray[1]), Number(timeArray[2]))).getTime());
	},
	
	/**
	 * user ID
	 * 
	 * @type	{Number}
	 */
	get chatUserID() {
		return API.w.settings['userID'];
	}
};

BisaChatPlus.init();
