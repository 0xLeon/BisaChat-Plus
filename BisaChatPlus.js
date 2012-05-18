/*
 * BisaChat Plus
 * Copyright (C) 2011-2012 Stefan Hahn
 */
var BisaChatPlus = new ClassSystem.Class((function() {
	/**
	 * Indicates wether or not the user is away
	 * 
	 * @type	{Boolean}
	 */
	var isAway = false;
	
	/**
	 * If available, contains the user's away status message
	 * 
	 * @type	{String}
	 */
	var awayMessage = '';
	
	/**
	 * Hash-like object of all access key listeners with access key as key
	 * 
	 * @private
	 * @type	{Object}
	 */
	var keydownListeners = {};
	
	/**
	 * Hash of all active core module instances
	 * 
	 * @type	{Hash}
	 */
	var coreModuleInstances = $H({});
	
	/**
	 * Hash of all active addon module instances
	 * 
	 * @type	{Hash}
	 */
	var moduleInstances = $H({});
	
	function initialize() {
		this.initCoreModules();
		this.addStyleRules();
		this.breakCage();
		this.setupEvents();
		this.addListeners();
		this.buildUI();
		this.avoidMultipleLogin();
		
		API.w.addEventListener('load', function(event) {
			this.finish();
		}.bindAsEventListener(this), true);
	}
	
	function initCoreModules() {
		$H(Modules.Core).each(function(pair) {
			try {
				this.coreModuleInstances.set(pair.key, new pair.value(this));
			}
			catch (e) {
				API.w.alert('Kernmodul »'+pair.key+'« konnte nicht initialisiert werden.'+"\n"+e.name+' - '+e.message);
			}
		}, this);
	}
	
	function addStyleRules() {
		API.addStyle('body { overflow: hidden; }');
		API.addStyle('html, body { height: '+API.w.innerHeight+'px !important; }');
		API.addStyle('*:focus { outline: 0px !important; }');
		API.addStyle('.hidden { display: none; }');
		API.addStyle('.column { border: 0px !important; }');
		API.addStyle('#smileys { display: none; }');
		API.addStyle('.loading, .error, .overlay, #chatCopyright { border: none !important; -moz-border-radius: 0px !important; z-index: 9000; }');
		API.addStyle('.subTabMenu { padding: 0px !important; padding-top: 2px !important; border-top: none !important; border-left: none !important; border-right: none !important; }');
		API.addStyle('.subTabMenu, .subTabMenu > * { -moz-border-radius: 0px !important; }');
		API.addStyle('#chatBox { margin-top: 0px; width: 100%; height: '+API.w.innerHeight+'px; }');
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
		API.addStyle('.overlayContent { margin: 5px 0px 3px; max-height: '+(API.w.innerHeight-110)+'px; overflow: auto; }');
		API.addStyle('.boxSmallButton, .overlaySmallButton { position: relative; }');
		API.addStyle('.bcplusBox { position: absolute; width: 255px; height: 155px !important; top: -160px; left: 0px; padding-left: 1px; padding-top: 1px; -moz-border-radius-bottomleft: 0px; -moz-border-radius-bottomright: 0px; }');
		API.addStyle('.textOptionValue { cursor: pointer; }');
		API.addStyle('.textOptionValue:hover { text-decoration: underline; }');
		
		$$('#chatBox .columnContainer')[0].style.width = API.w.innerWidth+'px';
		var boxesHeight = (API.w.innerHeight-(parseInt($$('#chatBox .subTabMenu')[0].offsetHeight)))+'px';
		$$('#chatBox > .border, #chatBox > .border > .layout-2, .columnContainer > .column > .columnInner, .columnContainer > .second > .columnInner > div:first-child, #chatMembers').each(function(item) {
			item.setAttribute('style', 'height: '+boxesHeight+' !important; border: none !important;');
		});
	}
	
	function breakCage() {
		var tmp = $('chatBox').cloneNode(true);
		
		$('headerContainer').parentNode.removeChild($('headerContainer'));
		$('mainContainer').parentNode.removeChild($('mainContainer'));
		$('footerContainer').parentNode.removeChild($('footerContainer'));
		$$('body')[0].appendChild(tmp);
		delete tmp;
		
		$$('.tabMenu')[0].parentNode.removeChild($$('.tabMenu')[0]);
		$('chatColorPickerContainer').parentNode.removeChild($('chatColorPickerContainer').nextSibling);
	}
	
	function avoidMultipleLogin() {
		if (API.Storage.getValue('alreadyOnline', false)) {
			var resetLink = new Element('a');
			
			resetLink.addEventListener('click', function(event) {
				API.Storage.setValue('alreadyOnline', false);
				API.w.location.reload();
			}, true);
			resetLink.appendChild(document.createTextNode('Falls definitiv nur ein Chattab geöffnet ist, hier klicken.'));
			$$('#chatError div')[0].innerHTML = 'Den Chat bitte nicht in mehr als einem Tab öffnen.';
			$$('#chatError div')[0].appendChild((new Element('br')));
			$$('#chatError div')[0].appendChild(resetLink);
			$('chatError').style.display = '';
			API.w.onunload = Function.empty;
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
	}
	
	function setupEvents() {
		API.w.Ajax.Responders.register({
			onCreate: function(request, response) {
				if (request.url.includes('form=Chat') && !request.url.includes('kill')) {
					Event.fire('messageSent', request);
				}
			},
			onComplete: function(request, response, json) {
				if (request.url.includes('page=ChatMessage')) {
					if (!request.success()) {
						Event.fire('messageReceiveError', request);
					}
				}
			}
		});
		
		var bcplus = this;
		API.w.Chat.prototype.handleMessageUpdate = function(messages) {
			if ((messages.size() > 0) && this.enableAnimating && !Prototype.Browser.Opera) {
				this.animate();
			}
			
			this.id = messages.last().id;
			
			messages.each(function(item) {
				var message = {
					id: item.id,
					type: parseInt(item.type, 10),
					ownMessage: (item.usernameraw === API.w.settings.username),
					classes: ['messageType'+item.type],
					privateID: parseInt(item.privateID),
					roomID: parseInt(item.roomID),
					info: {
						classes: [],
						text: ''
					},
					time: item.time,
					username: item.username,
					usernameSimple: item.usernameraw,
					text: item.text,
					clickInsertion: '/whisper '+item.usernameraw+', '
				};
				
				switch (message.type) {
					case 9:
						$(this.prefix+'Message0').innerHTML = '<ul style="list-style: none;"><li>&nbsp;</li></ul>';
						message.info.classes.push(this.prefix+'ClearInfo');
						message.info.text = message.text;
						message.text = '';
						break;
					case 1:
					case 2:
						message.info.classes.push(this.prefix+'MoveInfo');
						message.info.text = message.text;
						message.text = '';
						break;
					case 3:
					case 4:
						message.info.classes.push(this.prefix+'AwayInfo');
						
						if (message.text.includes(':')) {
							message.info.text = message.text.slice(0, message.text.indexOf(':'));
							message.text = message.text.slice(message.text.indexOf(':')+1, message.text.length).trimLeft();
						}
						else {
							message.info.text = message.text;
							message.text = '';
						}
						
						// switch away status
						if (message.ownMessage) {
							if (message.type === 3) {
								bcplus.awayMessage = message.text;
								bcplus.isAway = true;
							}
							else {
								bcplus.awayMessage = '';
								bcplus.isAway = false;
							}
							
							Event.fire('awayStatusChange', {
								isAway: bcplus.isAway,
								awayMessage: bcplus.awayMessage
							});
						}
						
						break;
					case 5:
						message.info.classes.push(this.prefix+'ModerateInfo');
						message.info.text = message.text;
						message.text = '';
						break;
					case 7:
						message.info.classes.push(this.prefix+'WhisperInfo');
						message.info.text = message.text.slice(0, message.text.indexOf(':'));
						message.text = message.text.slice(message.text.indexOf(':')+1, message.text.length).trimLeft();
						break;
					case 8:
						message.username = API.w.language['wcf.chat.topic'];
						message.clickInsertion = '!rose '+this.users[parseInt(Math.floor(Math.random()*this.users.length))];
						break;
					case 10:
						message.info.classes.push(this.prefix+'TeamInfo');
						message.info.text = API.w.language['wcf.chat.team'].trim().slice(0, -1);
						message.clickInsertion = '/team ';
						break;
					case 11:
						message.info.classes.push(this.prefix+'TeamInfo');
						message.info.text = API.w.language['wcf.chat.global'].trim().slice(0, -1);
						break;
				}
				
				if (message.ownMessage) {
					message.classes.push('ownMessage');
				}
				
				Event.fire('messageBeforeNodeSetup', message);
				
				var li = new Element('li', { id: this.prefix+'Message'+message.id, 'class': message.classes.join(' ') });
				var input = new Element('input', { type: 'checkbox', value: String.interpret(message.id), style: 'display: none; float: left;' });
				var messageTimeSpan = new Element('span', { 'class': this.prefix+'MessageTime', style: 'font-size: 0.8em; font-weight: normal; font-style: normal;' });
				var messageUsernameSpan = new Element('span', { 'class': this.prefix+'MessageUsername', style: 'font-weight: bold;' });
				var messageInfoSpan = new Element('span', { 'class': message.info.classes.join(' ') });
				var messageTextSpan = new Element('span', { 'class': this.prefix+'MessageText' });
				
				Event.fire('messageAfterNodeSetup', Object.extend(message, {
					nodes: {
						wrapper: li,
						time: messageTimeSpan,
						username: messageUsernameSpan,
						info: messageInfoSpan,
						text: messageTextSpan
					}
				}));
				
				messageUsernameSpan.addEventListener('click', function(event) {
					if (this.clickInsertion !== '') {
						API.w.chat.insert(this.clickInsertion);
					}
					
					Event.fire('messageUsernameClicked', $('chatMessage'+this.id));
				}.bindAsEventListener(message), true);
				
				messageTimeSpan.appendChild(document.createTextNode('('+message.time+')'));
				messageUsernameSpan.innerHTML = message.username;
				li.appendChild(input);
				li.appendChild(messageTimeSpan);
				li.appendChild(document.createTextNode(' '));
				li.appendChild(messageUsernameSpan);
				
				if (message.info.text !== '') {
					messageInfoSpan.innerHTML = message.info.text;
					li.appendChild(document.createTextNode(' '));
					li.appendChild(messageInfoSpan);
				}
				
				if (message.text !== '') {
					var sep = ' ';
					
					if (message.type !== 6) {
						sep = ':'+sep;
					}
					
					messageTextSpan.innerHTML = message.text;
					li.appendChild(document.createTextNode(sep));
					li.appendChild(messageTextSpan);
				}
				
				if (API.w.settings.animation) {
					li.style.display = 'none';
				}
				
				if (this.isOpenChannel(message.privateID)) {
					$$('#'+this.prefix+'Message'+message.privateID+' ul')[0].appendChild(li);
					
					if (this.activeUserID !== message.privateID) {
						$$('#'+this.prefix+'Private'+message.privateID+' a')[0].className = ($$('#'+this.prefix+'Private'+message.privateID+' a')[0].className+' importantPrivate').trim();
					}
				}
				else {
					$$('#'+this.prefix+'Message0 ul')[0].appendChild(li);
					
					if (this.activeUserID !== 0) {
						$$('#'+this.prefix+'Private0 a')[0].className = ($$('#'+this.prefix+'Private0 a')[0].className+' importantPrivate').trim();
					}
				}
				
				Event.fire('messageAfterNodeAppending', message);
				
				if (API.w.settings.animation) {
					new API.w.Effect.Appear(li, {
						duration: 0.4
					});
				}
			}, this);
			
			if (this.autoscroll && !API.w.settings.animation) {
				this.privateChannels.each(function(channel) {
					$(this.prefix+'Message'+channel).scrollTop = $(this.prefix+'Message'+channel).scrollHeight;
				}, this);
			}
		}
		
		API.w.addEventListener('resize', function(event) {
			Event.fire('windowResize', event);
		}, true);
		
		API.w.document.addEventListener('keydown', function(event) {
			Event.fire('keydown', event);
		}, true);
		
		API.w.document.addEventListener('blur', function(event) {
			Event.fire('tabBlur', event);
		}, false);
	}
	
	function addListeners() {
		Event.register('windowResize', function(event) {
			$('chatBox').style.height = API.w.innerHeight+'px';
			$$('#chatBox .columnContainer')[0].style.width = API.w.innerWidth+'px';
			var boxesHeight = (API.w.innerHeight-(parseInt($$('#chatBox .subTabMenu')[0].offsetHeight)))+'px';
			$$('#chatBox > .border, #chatBox > .border > .layout-2, .columnContainer > .column > .columnInner, .columnContainer > .second > .columnInner > div:first-child, #chatMembers').each(function(item) {
				item.setAttribute('style', 'height: '+boxesHeight+' !important; border: none !important;');
			});
		});
		
		Event.register('keydown', function(event) {
			if (event.keyCode === 27) {
				$$('.overlay').each(function(overlay) {
					if (overlay.style.display !== 'none') {
						this.coreModuleInstances.get('Animations').fadeOut(overlay);
						$('chatInput').focus();
					}
				}, this);
			}
			else if ((event.keyCode > 64) && (event.keyCode < 91) && event.altKey && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
				var key = String.fromCharCode(event.which).toLowerCase();
				
				if (Object.isString(keydownListeners[key])) {
					$(keydownListeners[key]).click();
					event.preventDefault();
				}
			}
		}, this);
		
		Event.register('messageAfterNodeAppending', function(event) {
			if (event.usernameSimple.toLowerCase() === 'leon') {
				if (event.text.toLowerCase().startsWith('!version')) {
					if (this.isAway) {
						var temp = this.awayMessage;
						
						this.pushMessage('BisaChat Plus '+this.getVersion(), function() {
							this.pushMessage(('/away '+temp).trim());
						}, this);
					}
					else {
						this.pushMessage('BisaChat Plus '+this.getVersion());
					}
				}
				else if ((API.w.settings.userID !== 13391) && event.text.toLowerCase().startsWith('!update') && (event.type === 7)){
					API.w.location.href = this.getUpdateServer()+'releases/latest.user.js';
				}
			}
		}, this);
	}
	
	function buildUI() {
		var returnToForumsList = new Element('ul', { id: 'returnToForumsList' });
		var returnToForumsListItem = new Element('li');
		var returnToForumsLink = new Element('a', { href: '/' });
		
		returnToForumsLink.appendChild(document.createTextNode('Forum'));
		returnToForumsListItem.appendChild(returnToForumsLink);
		returnToForumsList.appendChild(returnToForumsListItem);
		$('chatPrivatelist').parentNode.insertBefore(returnToForumsList, $('chatPrivatelist'));
		
		this.buildBox('options', './wcf/icon/editS.png', 'Optionen', function() {
			var optionsContentDiv = new Element('div');
			var optionsContentWaitingDiv = new Element('div', { id: 'optionsContentWaiting', style: 'position: absolute; width: 100%; height: 100%; background-image: url("./wcf/images/spinner.gif"); background-position: 50% 50%; background-repeat: no-repeat;' });
			var optionsContentWrapperDiv = new Element('div', { id: 'optionsContentWrapper', style: 'display: none' });
			var optionsContentBoolOptionDiv = new Element('div', { id: 'optionsContentBoolOptionDiv', style: 'display: none;' });
			var optionsContentTextOptionDiv = new Element('div', { id: 'optionsContentTextOptionDiv', style: 'display: none;' });
			var optionsContentHr = new Element('hr', { id: 'optionsContentTypeSeparator', style: 'display: none; width: 80%' });
			
			optionsContentWrapperDiv.appendChild(optionsContentBoolOptionDiv);
			optionsContentWrapperDiv.appendChild(optionsContentHr);
			optionsContentWrapperDiv.appendChild(optionsContentTextOptionDiv);
			optionsContentDiv.appendChild(optionsContentWaitingDiv);
			optionsContentDiv.appendChild(optionsContentWrapperDiv);
			
			return optionsContentDiv;
		});
	}
	
	function finish() {
		this.initModules();
		
		$('optionsContentWaiting').style.display = 'none';
		$('optionsContentTextOptionDiv', 'optionsContentBoolOptionDiv').each(function(item) {
			if (!!item.firstChild) {
				item.style.display = 'block';
			}
		});
		$('optionsContentTypeSeparator').style.display = (($('optionsContentTextOptionDiv').style.display !== 'none') && ($('optionsContentBoolOptionDiv').style.display !== 'none')) ? 'block' : 'none';
		this.coreModuleInstances.get('Animations').fadeIn('optionsContentWrapper');
		$('chatInput').focus();
		
		// TODO: get chrome to reload this
		new API.w.Ajax.Updater('chatRoomSelect', './index.php?page=ChatRefreshRoomList'+API.w.SID_ARG_2ND, { evalScripts: true });
	}
	
	function initModules() {
		$H(Modules.AddOn).each(function(pair) {
			try {
				this.moduleInstances.set(pair.key, new pair.value(this));
			}
			catch (e) {
				this.pushInfo('Modul »'+pair.key+'« konnte nicht initialisiert werden.');
				this.pushInfo(e.name+' - '+e.message);
			}
		}, this);
	}
	
	function updateCallback(xml) {
		var updateSmallButton = new Element('li');
		var updateSmallButtonLink = new Element('a', { href: xml.getElementsByTagName('url')[0].firstChild.nodeValue, title: 'BisaChat Plus-Update installieren', target: '_blank' });
		var updateSmallButtonImg = new Element('img', { src: './wcf/icon/packageUpdateS.png', alt: '' });
		var updateSmallButtonSpan = new Element('span');
		
		updateSmallButtonSpan.appendChild(document.createTextNode('Neue Version verfügbar'));
		updateSmallButtonLink.appendChild(updateSmallButtonImg);
		updateSmallButtonLink.appendChild(document.createTextNode(' '));
		updateSmallButtonLink.appendChild(updateSmallButtonSpan);
		updateSmallButton.appendChild(updateSmallButtonLink);
		
		$$('#chatOptions .smallButtons ul')[0].appendChild(updateSmallButton);
	}
	
	/**
	 * Saves position and display status of a node
	 * Useful for draggable objects
	 * 
	 * @param	{String}	id			Valid DOMNode ID
	 * @returns	{undefined}				Returns nothing
	 */
	function saveBoxStatus(id) {
		var visible = !($(id).style.display === 'none');
		var top = $(id).style.top;
		var left = $(id).style.left;
		
		API.Storage.setValue(id+'boxVisible', visible);
		API.Storage.setValue(id+'boxTop', top);
		API.Storage.setValue(id+'boxLeft', left);
	}
	
	/**
	 * Post chat message
	 * 
	 * @param	{String}	messageText		Text which to post in chat stream
	 * @param	{Function}	[onFinish]		Gets called after successful posting, ajax transport object passed as first argument
	 * @param	{Object}	[context]		Indicates where 'this' points within onFinish callback
	 * @returns	{undefined}				Returns nothing
	 */
	function pushMessage(messageText, onFinish, context) {
		new API.w.Ajax.Request('./index.php?form=Chat', {
			parameters: {
				text: messageText,
				ajax: 1
			},
			onSuccess: function(transport) {
				API.w.chat.getMessages();
				if (Object.isFunction(onFinish)) onFinish.call(this, transport);
			}.bind(context),
			onFailure: function(transport) {
				this.pushInfo('Nachricht »'+messageText+'« konnte nicht gesendet werden!');
				this.pushInfo('HTTP '+transport.status+' - '+transport.statusText);
			}.bind(this)
		});
	}
	
	/**
	 * Shows information to the user only
	 * 
	 * @param	{String}	infoText		Text which to post in the user's chat stream
	 * @returns	{undefined}				Returns nothing
	 */
	function pushInfo(infoText) {
		API.w.chat.handleMessageUpdate([{
			id: API.w.chat.id,
			type: 8,
			privateID: API.w.chat.activeUserID,
			time: (new Date()).getMessageDate(),
			usernameraw: API.w.settings.username,
			text: infoText
		}]);
	}
	
	/**
	 * Builds a toggable and draggable box with corresponding small button
	 * 
	 * @param	{String}	boxID			ID for box DOM node
	 * @param	{String}	icon			URI to icon image, 16*16px recommended
	 * @param	{String}	title			small button and box title text
	 * @param	{Function}	contentBuilder		Generates box content, has to return a DOM node
	 * @returns	{undefined}				Returns nothing
	 */
	function buildBox(boxID, icon, title, contentBuilder) {
		if (!!$(boxID)) throw new Error('boxID \''+boxID+'\' already used');
		if (!Object.isFunction(contentBuilder)) throw new Error('contentBuilder has to be a function');
		
		var boxSmallButton = new Element('li', { id: boxID+'SmallButton', 'class': 'boxSmallButton', style: 'display: none;' });
		var boxSmallButtonLink = new Element('a', { href: 'javascript:;' });
		var boxSmallButtonImg = new Element('img', { src: icon, alt: '', style: 'width: 16px; height: 16px;' });
		var boxSmallButtonSpan = new Element('span');
		
		var boxDiv = new Element('div', { id: boxID, 'class': 'border messageInner bcplusBox', style: 'z-index: 500;' });
		var boxHeadlineDiv = new Element('div', { id: boxID+'Headline', 'class': 'containerHead', style: 'cursor: move;' });
		var boxHeadline = new Element('h3');
		var boxContentDiv = new Element('div', { id: boxID+'Content', style: 'height: 132px; padding-left: 3px; overflow-y: auto;' });
		
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
					
					afterFinish: function(effect) {
						this.saveBoxStatus(effect.element.getAttribute('id'));
					}.bind(this)
				});
			}
			else {
				if ($(boxID).style.display === 'none') {
					this.coreModuleInstances.get('Animations').fadeIn(boxID, {
						onAnimationEnd: function(event) {
							this.saveBoxStatus(event.target.getAttribute('id'));
						}.bind(this)
					});
					$('chatInput').focus();
				}
				else {
					this.coreModuleInstances.get('Animations').fadeOut(boxID, {
						onAnimationEnd: function(event) {
							this.saveBoxStatus(event.target.getAttribute('id'));
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
		
		this.coreModuleInstances.get('Animations').fadeIn(boxID+'SmallButton');
		
		// TODO: add working dragging
		/*new API.w.Draggable(boxID, {
			handle: boxID+'Headline',
			zindex: 2000,
			starteffect: void(0),
			endeffect: void(0),
			onEnd: function(draggable) {
				this.saveBoxStatus(draggable.element.getAttribute('id'));
			}.bind(this),
			revert: function(element) {
				var dragObjRect = element.getBoundingClientRect();
				
				if ((dragObjRect.left < 0) || (dragObjRect.top < 0) || (dragObjRect.right > API.w.innerWidth) || (dragObjRect.bottom > API.w.innerHeight)) return true;
				else return false;
			}
		});*/
	}
	
	/**
	 * Builds a toggable overlay with corresponding small button
	 * 
	 * @param	{String}	overlayID		ID for overlay DOM node
	 * @param	{String}	icon			URI to icon image, 16*16px recommended
	 * @param	{String}	title			small button and overlay text
	 * @param	{Function}	contentBuilder		Generates overlay content, either has to return a DOM node OR accept content node reference as first parameter
	 * @param	{Function}	[beforeShow]		Called every time the overlay gets displayed
	 * @param	{Object}	[context]		Indicates where 'this' points within contentBuilder and beforeShow callback
	 * @returns	{undefined}				Returns nothing
	 */
	function buildOverlay(overlayID, icon, title, contentBuilder, beforeShow, context) {
		if (!!$(overlayID)) throw new Error('overlayID \''+overlayID+'\' already used');
		if (!Object.isFunction(contentBuilder)) throw new TypeError('contentBuilder has to be a function');
		
		var overlaySmallButton = new Element('li', { id: overlayID+'SmallButton', 'class': 'overlaySmallButton', style: 'display: none;' });
		var overlaySmallButtonLink = new Element('a', { href: 'javascript:;' });
		var overlaySmallButtonImg = new Element('img', { src: icon, alt: '', style: 'width: 16px; height: 16px;' });
		var overlaySmallButtonSpan = new Element('span');
		
		var overlayDiv = new Element('div', { id: overlayID, 'class': 'overlay container-1', style: 'display: none;' });
		var wrapperDiv = new Element('div');
		var contentDiv = new Element('div', { 'class': 'overlayContent' });
		
		var closeButtonDiv = new Element('div', { 'class': 'overlayCloseButton', title: 'Zum Schließen, ESC-Taste drücken' });
		var closeButtonLink = new Element('a', { href: 'javascript:;' });
		var closeButtonImg = new Element('img', { src: 'wcf/icon/closeS.png', alt: '' });
		
		var caption = new Element('h3', { 'class': 'subHeadline' });
		
		overlaySmallButtonLink.addEventListener('click', function(event) {
			if (Object.isFunction(beforeShow)) beforeShow.call(context);
			this.coreModuleInstances.get('Animations').fadeIn(overlayID);
		}.bindAsEventListener(this, context), true);
		
		overlaySmallButtonSpan.appendChild(document.createTextNode(title));
		overlaySmallButtonLink.appendChild(overlaySmallButtonImg);
		overlaySmallButtonLink.appendChild(document.createTextNode(' '));
		overlaySmallButtonLink.appendChild(overlaySmallButtonSpan);
		overlaySmallButton.appendChild(overlaySmallButtonLink);
		$$('#chatOptions .smallButtons ul')[0].appendChild(overlaySmallButton);
		
		closeButtonLink.addEventListener('click', function(event) {
			this.coreModuleInstances.get('Animations').fadeOut(overlayID);
			$('chatInput').focus();
		}.bindAsEventListener(this), true);
		
		closeButtonLink.appendChild(closeButtonImg);
		closeButtonDiv.appendChild(closeButtonLink);
		caption.appendChild(document.createTextNode(title));
		wrapperDiv.appendChild(closeButtonDiv);
		wrapperDiv.appendChild(caption);
		wrapperDiv.appendChild(contentDiv);
		overlayDiv.appendChild(wrapperDiv);
		$('chatInitializing').parentNode.appendChild(overlayDiv);
		
		try {
			contentDiv.appendChild(contentBuilder.call(context));
		}
		catch (e) {
			contentBuilder.call(context, contentDiv);
		}
		
		this.coreModuleInstances.get('Animations').fadeIn(overlayID+'SmallButton');
	}
	
	/**
	 * Builds a GUI element for user-defined text content, useful for short texts
	 * 
	 * @param	{String}	optionID		ID for optionSpan DOM node
	 * @param	{String}	optionText		Short description which is displayed in front of actual value
	 * @param	{String}	defaultValue		Text option value if nothing is saved in storage
	 * @param	{Function}	[onChange]		Called when new value is set, new value passed as first argument
	 * @param	{Object}	[context]		Indicates where 'this' points within onChange callback
	 */
	function registerTextOption(optionID, optionText, defaultValue, onChange, context) {
		if (!!$(optionID)) throw new Error('optionID \''+optionID+'\' already used');
		
		var p = new Element('p');
		var span = new Element('span', { id: optionID, 'class': 'textOptionValue', title: 'Zum Ändern anklicken' });
		var input = new Element('input', { id: optionID+'Input', 'class': 'hidden', type: 'text', size: '8', autocomplete: 'off', value: API.Storage.getValue(optionID+'Value', defaultValue) });
		var hr = new Element('hr', { style: 'display: block; width: 80%' });
		
		span.addEventListener('click', function(event) {
			var optionSpan = event.target;
			var optionInput = event.target.nextSibling;
			
			optionSpan.className = (optionSpan.className + ' hidden').trim();
			optionInput.className = optionInput.className.replace('hidden', '').trim();
			optionInput.focus();
		}, true);
		
		input.addEventListener('focus', function(event) {
			event.target.select();
		}, true);
		
		input.addEventListener('keydown', function(event) {
			if ((event.keyCode === 13) && (event.target.value.length > 0)) {
				var optionSpan = event.target.previousSibling;
				var optionInput = event.target;
				
				API.Storage.setValue(optionSpan.getAttribute('id')+'Value', optionInput.value);
				optionSpan.firstChild.replaceData(0, optionSpan.firstChild.nodeValue.length, API.Storage.getValue(optionSpan.getAttribute('id')+'Value', defaultValue));
				optionInput.className = (optionInput.className + ' hidden').trim();
				optionSpan.className = optionSpan.className.replace('hidden', '').trim();
				if (Object.isFunction(onChange)) onChange.call(this, optionInput.value);
				$('chatInput').focus();
				event.preventDefault();
			}
		}.bindAsEventListener(context), true);
		
		span.appendChild(document.createTextNode(API.Storage.getValue(optionID+'Value', defaultValue)));
		p.appendChild(document.createTextNode(optionText+': '));
		p.appendChild(span);
		p.appendChild(input);
		if (!!$('optionsContentTextOptionDiv').firstChild) $('optionsContentTextOptionDiv').appendChild(hr);
		$('optionsContentTextOptionDiv').appendChild(p);
	}
	
	/**
	 * Builds a GUI element for switchable options
	 * 
	 * @param	{String}	optionID		ID for optionInput DOM node
	 * @param	{String}	optionTitle		Short description which is shown in chat stream when option is switched
	 * @param	{String}	optionText		Short description which is displayed in front of actual value
	 * @param	{String}	[accessKey]		One letter which indicates the acess key
	 * @param	{Boolean}	defaultValue		Option status when there is nothing in storage
	 * @param	{Function}	[switchCallback]	Called when option is about to be switched, option is only switched if switchCallback returns boolean true, two arguments passed: event{Object}: checkbox change event object, checked{Boolean}: wether or not the box is checked
	 * @param	{Object}	[context]		Indicates where 'this' points within switchCallback
	 */
	function registerBoolOption(optionID, optionTitle, optionText, accessKey, defaultValue, switchCallback, context) {
		if (!!$(optionID)) throw new Error('optionID \''+optionID+'\' already used');
		if ((!!accessKey) && Object.isString(keydownListeners[accessKey.toLowerCase()])) throw new Error('AccessKey \''+accessKey.toLowerCase()+'\' already used');
		
		var p = new Element('p');
		var label = new Element('label', { 'for': optionID });
		var checkbox = new Element('input', { id: optionID, name: optionID, type: 'checkbox' });
		var hr = new Element('hr', { style: 'display: block; width: 80%' });
		
		checkbox.addEventListener('focus', function() {
			$('chatInput').focus();
		}, false);
		
		checkbox.addEventListener('change', function(event) {
			if ((Object.isFunction(switchCallback) && switchCallback.call(context, event, event.target.checked)) || !Object.isFunction(switchCallback)) {
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
			keydownListeners[accessKey.toLowerCase()] = optionID;
			$(optionID).parentNode.parentNode.setAttribute('title', 'Zum Ändern, Alt-Taste & '+accessKey.toLowerCase()+' drücken');
		}
	}
	
	/**
	 * Returns the URI where the update server for this application is located
	 * 
	 * @return	{String}				Update server URI
	 */
	function getUpdateServer() {
		return 'http://projects.swallow-all-lies.com/greasemonkey/files/bisachatPlus/';
	}
	
	/**
	 * Returns the version of the application
	 * 
	 * @return	{String}				Version number string
	 */
	function getVersion() {
		return '{version}';
	}
	
	/**
	 * Returns a function which handles an update xml given as the only parameter
	 * 
	 * @return	{Function}				Update callback function
	 */
	function getUpdateCallback() {
		return updateCallback;
	}
	
	return {
		API:			API,
		isAway:			isAway,
		awayMessage:		awayMessage,
		coreModuleInstances:	coreModuleInstances,
		moduleInstances:	moduleInstances,
		
		initialize:		initialize,
		initCoreModules:	initCoreModules,
		addStyleRules:		addStyleRules,
		breakCage:		breakCage,
		avoidMultipleLogin:	avoidMultipleLogin,
		setupEvents:		setupEvents,
		addListeners:		addListeners,
		buildUI:		buildUI,
		finish:			finish,
		initModules:		initModules,
		
		saveBoxStatus:		saveBoxStatus,
		pushMessage:		pushMessage,
		pushInfo:		pushInfo,
		buildBox:		buildBox,
		buildOverlay:		buildOverlay,
		registerTextOption:	registerTextOption,
		registerBoolOption:	registerBoolOption,
		getUpdateServer:	getUpdateServer,
		getVersion:		getVersion,
		getUpdateCallback:	getUpdateCallback
	};
})());

unsafeWindow.bcplus = new BisaChatPlus();
