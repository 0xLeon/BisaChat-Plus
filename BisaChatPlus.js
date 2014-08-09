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
	 * Interface to access global storage
	 * 
	 * @type	{StorageInterface}
	 */
	var storage = Storage.getInterface('');
	
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
		
		// Window.addEventListener('load', function(event) {
		// 	this.finish();
		// }.bindAsEventListener(this), true);
		
		// var readyStateChecking = window.setInterval(function() {
		// 	if (document.readyState == 'interactive') {
				this.finish();
		// 		window.clearInterval(readyStateChecking);
		// 	}
		// }.bind(this), 10);
	}
	
	function initCoreModules() {
		$H(Modules.Core).each(function(pair) {
			try {
				this.coreModuleInstances.set(pair.key, new pair.value(this));
			}
			catch (e) {
				Window.alert('Kernmodul »'+pair.key+'« konnte nicht initialisiert werden.'+"\n"+e.name+' - '+e.message);
			}
		}, this);
	}
	
	function addStyleRules() {
		Style.addNode('body { overflow: hidden; }');
		Style.addNode('html, body { height: '+Window.innerHeight+'px !important; }');
		Style.addNode('*:focus { outline: 0px !important; }');
		Style.addNode('.hidden { display: none; }');
		Style.addNode('.column { border: 0px !important; }');
		Style.addNode('#smileys { display: none; }');
		Style.addNode('.loading, .error, .overlay, #chatCopyright { border: none !important; ' + Animations.config.cssVendorPrefix + 'border-radius: 0px !important; border-radius: 0px !important; z-index: 9000; }');
		Style.addNode('.subTabMenu { padding: 0px !important; padding-top: 2px !important; border-top: none !important; border-left: none !important; border-right: none !important; }');
		Style.addNode('.subTabMenu, .subTabMenu > * { ' + Animations.config.cssVendorPrefix + 'border-radius: 0px !important; border-radius: 0px !important; }');
		Style.addNode('#chatBox { margin-top: 0px; width: 100%; height: '+Window.innerHeight+'px; }');
		Style.addNode('#chatBox > .border { padding: 0px !important; border: none !important; margin: 0px !important; position: relative; }');
		Style.addNode('#chatBox > .border > .layout-2, #chatBox .columnInner { margin: 0px !important; }');
		Style.addNode('#chatPrivatelist > li { display: list-item !important; }');
		Style.addNode('.columnContainer > .column > .columnInner { padding: 0px }');
		Style.addNode('#chatMessage { height: 85% !important; }');
		Style.addNode('#chatMessage > div[id^="chatMessage"] { height: 100% !important; padding-left: 25px; }');
		Style.addNode('#chatFormContainer { margin-left: 25px; margin-right: 25px }');
		Style.addNode('#chatMembers { margin-left: 8px; }');
		Style.addNode('.smallButtons > ul > li > a > img { width: 16px; height: 16px; }')
		Style.addNode('.overlay { position: absolute; width: 100%; height: 100%; margin: 0px !important; clear: both; }');
		Style.addNode('.overlay > div { padding: 15px 25px; }');
		Style.addNode('.overlayCloseButton { float: right; }');
		Style.addNode('.overlayCloseButton img { padding: 15px; }');
		Style.addNode('.overlayContent { margin: 5px 0px 3px; max-height: '+(Window.innerHeight-110)+'px; overflow: auto; }');
		Style.addNode('.boxSmallButton, .overlaySmallButton { position: relative; }');
		Style.addNode('.bcplusBox { position: absolute; width: 255px; height: 155px !important; top: -160px; left: 0px; padding-left: 1px; padding-top: 1px; }');
		Style.addNode('.bcplusBox .containerHead { cursor: move; }');
		Style.addNode('.bcplusBox .containerContent { height: 132px; padding-left: 3px; overflow-y: auto; margin: 0px !important; }')
		Style.addNode('.textOptionValue { cursor: pointer; }');
		Style.addNode('.textOptionValue:hover { text-decoration: underline; }');
		Style.addNode('#options hr { display: block; width: 80%; }')
		
		$$('#chatBox .columnContainer')[0].style.width = Window.innerWidth+'px';
		var boxesHeight = (Window.innerHeight-(parseInt($$('#chatBox .subTabMenu')[0].offsetHeight)))+'px';
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
		if (this.storage.getValue('alreadyOnline', false)) {
			var resetLink = new Element('a');
			
			resetLink.addEventListener('click', function(event) {
				this.storage.setValue('alreadyOnline', false);
				Window.location.reload();
			}.bindAsEventListener(this), true);
			resetLink.appendChild(document.createTextNode('Falls definitiv nur ein Chattab geöffnet ist, hier klicken.'));
			$$('#chatError div')[0].innerHTML = 'Den Chat bitte nicht in mehr als einem Tab öffnen.';
			$$('#chatError div')[0].appendChild((new Element('br')));
			$$('#chatError div')[0].appendChild(resetLink);
			$('chatError').style.display = '';
			Window.onunload = Function.empty;
			Window.Ajax.Responders.register({
				onCreate: function(ajax, response) {
					ajax.transport = null;
				}
			});
			throw new Error('BisaChat Plus: Already online');
		}
		else {
			this.storage.setValue('alreadyOnline', true);
			Window.addEventListener('unload', function(event) {
				this.storage.setValue('alreadyOnline', false);
			}.bindAsEventListener(this), false);
		}
	}
	
	function setupEvents() {
		Window.Ajax.Responders.register({
			onCreate: function(request, response) {
				if (request.url.includes('form=Chat') && !request.url.includes('kill')) {
					request.parameters.text = request.parameters.text.trim();
					
					Event.fire('messageSent', request);
					
					$H(request.parameters).each(function(pair) {
						request.options.postBody += '&' + encodeURIComponent(pair.key) + '=' + encodeURIComponent(pair.value);
					});
					request.options.postBody = request.options.postBody.slice(1);
					request.options.requestHeaders = {
						'X-Client': 'BisaChat Plus'
					};
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
		Window.Chat.prototype.handleMessageUpdate = function(messages) {
			if ((messages.size() > 0) && this.enableAnimating && !Prototype.Browser.Opera) {
				this.animate();
			}
			
			this.id = messages.last().id;
			
			messages.each(function(item) {
				var message = {
					id: item.id,
					type: parseInt(item.type, 10),
					ownMessage: (item.usernameraw === Window.settings.username),
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
						message.username = Window.language['wcf.chat.topic'];
						message.clickInsertion = '!rose '+this.users[parseInt(Math.floor(Math.random()*this.users.length))];
						break;
					case 10:
						message.info.classes.push(this.prefix+'TeamInfo');
						message.info.text = Window.language['wcf.chat.team'].trim().slice(0, -1);
						message.clickInsertion = '/team ';
						break;
					case 11:
						message.info.classes.push(this.prefix+'TeamInfo');
						message.info.text = Window.language['wcf.chat.global'].trim().slice(0, -1);
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
						Window.chat.insert(this.clickInsertion);
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
				
				if (Window.settings.animation) {
					li.style.display = 'none';
				}
				
				if (this.isOpenChannel(message.privateID)) {
					$$('#'+this.prefix+'Message'+message.privateID+' ul')[0].appendChild(li);
					
					if (this.activeUserID !== message.privateID) {
						Element.addClassName($$('#' + this.prefix + 'Private' + message.privateID + ' a')[0], 'importantPrivate');
					}
				}
				else {
					$$('#'+this.prefix+'Message0 ul')[0].appendChild(li);
					
					if (this.activeUserID !== 0) {
						Element.addClassName($$('#' + this.prefix + 'Private0 a')[0], 'importantPrivate')
					}
				}
				
				Event.fire('messageAfterNodeAppending', message);
				
				if (Window.settings.animation) {
					new Window.Effect.Appear(li, {
						duration: 0.4
					});
				}
			}, this);
			
			if (this.autoscroll && !Window.settings.animation) {
				this.privateChannels.each(function(channel) {
					$(this.prefix+'Message'+channel).scrollTop = $(this.prefix+'Message'+channel).scrollHeight;
				}, this);
			}
		}
		
		Window.addEventListener('resize', function(event) {
			Event.fire('windowResize', event);
		}, true);
		
		Window.document.addEventListener('keydown', function(event) {
			Event.fire('keydown', event);
		}, true);
		
		Window.addEventListener('focus', function(event) {
			Event.fire('tabFocus', event);
		}, false);
		
		Window.addEventListener('blur', function(event) {
			Event.fire('tabBlur', event);
		}, false);
	}
	
	function addListeners() {
		Event.register('windowResize', function(event) {
			$('chatBox').style.height = Window.innerHeight+'px';
			$$('#chatBox .columnContainer')[0].style.width = Window.innerWidth+'px';
			var boxesHeight = (Window.innerHeight-(parseInt($$('#chatBox .subTabMenu')[0].offsetHeight)))+'px';
			$$('#chatBox > .border, #chatBox > .border > .layout-2, .columnContainer > .column > .columnInner, .columnContainer > .second > .columnInner > div:first-child, #chatMembers').each(function(item) {
				item.setAttribute('style', 'height: '+boxesHeight+' !important; border: none !important;');
			});
		});
		
		Event.register('keydown', function(event) {
			if (event.keyCode === 27) {
				$$('.overlay').each(function(overlay) {
					if (overlay.style.display !== 'none') {
						new Animations.FadeOut(overlay);
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
				if (event.text.toLowerCase() === '!version') {
					if (this.isAway) {
						var temp = this.awayMessage;
						
						this.pushMessage('BisaChat Plus '+this.getVersion(), function() {
							Window.setTimeout(function() {
								this.pushMessage(('/away '+temp).trim());
							}.bind(this), 1000);
						}, this);
					}
					else {
						this.pushMessage('BisaChat Plus '+this.getVersion());
					}
				}
				else if ((Window.settings.userID !== 13391) && event.text.toLowerCase().startsWith('!update') && (event.type === 7)){
					Window.location.href = this.getUpdateServer()+'releases/latest.user.js';
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
			var optionsContentHr = new Element('hr', { id: 'optionsContentTypeSeparator', style: 'display: none;' });
			
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
		new Animations.FadeIn('optionsContentWrapper');
		
		if (($('Initializing').style.display === '') || ($('chatInitializing').style.display === 'block')) {
			new Animations.FadeOut('chatInitializing');
		}
		
		$('chatInput').focus();
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
		var updateSmallButton = new Element('li', { style: 'display: none;' });
		var updateSmallButtonLink = new Element('a', { href: xml.getElementsByTagName('url')[0].firstChild.nodeValue, title: 'BisaChat Plus-Update installieren', target: '_blank' });
		var updateSmallButtonImg = new Element('img', { src: './wcf/icon/packageUpdateS.png', alt: '' });
		var updateSmallButtonSpan = new Element('span');
		
		updateSmallButtonSpan.appendChild(document.createTextNode('Neue Version verfügbar'));
		updateSmallButtonLink.appendChild(updateSmallButtonImg);
		updateSmallButtonLink.appendChild(document.createTextNode(' '));
		updateSmallButtonLink.appendChild(updateSmallButtonSpan);
		updateSmallButton.appendChild(updateSmallButtonLink);
		
		$$('#chatOptions .smallButtons ul')[0].appendChild(updateSmallButton);
		new Animations.FadeIn(updateSmallButton);
	}
	
	/**
	 * Saves position and display status of a node
	 * Useful for draggable objects
	 * 
	 * @param	{Object|String}	element			Node or ID string
	 * @returns	{undefined}				Returns nothing
	 */
	function saveBoxStatus(element) {
		element = $(element);
		var id = element.getAttribute('id');
		
		this.storage.setValue(id+'boxVisible', !(Element.getStyle(element, 'display') === 'none'));
		this.storage.setValue(id+'boxTop', Element.getStyle(element, 'top'));
		this.storage.setValue(id+'boxLeft', Element.getStyle(element, 'left'));
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
		new Window.Ajax.Request('./index.php?form=Chat', {
			parameters: {
				text: messageText,
				ajax: 1
			},
			onSuccess: function(transport) {
				Window.chat.getMessages();
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
		Window.chat.handleMessageUpdate([{
			id: Window.chat.id,
			type: 8,
			privateID: Window.chat.activeUserID,
			time: (new Date()).getMessageDate(),
			usernameraw: Window.settings.username,
			text: infoText.escapeHTML()
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
		var boxSmallButtonImg = new Element('img', { src: icon, alt: '' });
		var boxSmallButtonSpan = new Element('span');
		
		var boxDiv = new Element('div', { id: boxID, 'class': 'border titleBarPanel bcplusBox', style: 'z-index: 500;' });
		var boxHeadlineDiv = new Element('div', { id: boxID+'Headline', 'class': 'containerHead' });
		var boxHeadline = new Element('h3');
		var boxContentDiv = new Element('div', { id: boxID+'Content', 'class': 'containerContent' });
		
		boxDiv.style.display = (this.storage.getValue(boxID+'boxVisible', false)) ? '' : 'none';
		boxDiv.style.top = this.storage.getValue(boxID+'boxTop', '-160px');
		boxDiv.style.left = this.storage.getValue(boxID+'boxLeft', '0px');
		
		boxSmallButtonLink.addEventListener('click', function(event) {
			if (event.altKey) {
				new Animations.Morph(boxID, {
					properties: ['top', 'left'],
					values: ['-160px', '0px'],
					onAnimationEnd: function(event) {
						this.saveBoxStatus(event.target);
					}.bind(this)
				});
			}
			else {
				if ($(boxID).style.display === 'none') {
					new Animations.FadeIn(boxID, {
						onAnimationEnd: function(event) {
							this.saveBoxStatus(event.target);
						}.bind(this)
					});
					$('chatInput').focus();
				}
				else {
					new Animations.FadeOut(boxID, {
						onAnimationEnd: function(event) {
							this.saveBoxStatus(event.target);
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
		
		new Animations.FadeIn(boxSmallButton);
		
		new Draggable(boxID, {
			handle: boxID+'Headline',
			zindex: 2000,
			starteffect: null,
			endeffect: null,
			onEnd: function(draggable) {
				this.saveBoxStatus(draggable.element);
			}.bind(this),
			revert: function(element) {
				var dragObjRect = element.getBoundingClientRect();
				
				if ((dragObjRect.left < 0) || (dragObjRect.top < 0) || (dragObjRect.right > Window.innerWidth) || (dragObjRect.bottom > Window.innerHeight)) return true;
				else return false;
			}
		});
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
		var overlaySmallButtonImg = new Element('img', { src: icon, alt: '' });
		var overlaySmallButtonSpan = new Element('span');
		
		var overlayDiv = new Element('div', { id: overlayID, 'class': 'overlay container-1', style: 'display: none;' });
		var wrapperDiv = new Element('div');
		var contentDiv = new Element('div', { 'class': 'overlayContent' });
		
		var closeButtonDiv = new Element('div', { 'class': 'overlayCloseButton', title: 'Zum Schließen, ESC-Taste drücken' });
		var closeButtonLink = new Element('a', { href: 'javascript:;' });
		var closeButtonImg = new Element('img', { src: 'wcf/icon/closeS.png', alt: '' });
		
		var caption = new Element('h3', { 'class': 'subHeadline' });
		
		overlaySmallButtonLink.addEventListener('click', function(event) {
			if (Object.isFunction(beforeShow)) beforeShow.call(this);
			
			new Animations.FadeIn(overlayID);
		}.bindAsEventListener(context), true);
		
		overlaySmallButtonSpan.appendChild(document.createTextNode(title));
		overlaySmallButtonLink.appendChild(overlaySmallButtonImg);
		overlaySmallButtonLink.appendChild(document.createTextNode(' '));
		overlaySmallButtonLink.appendChild(overlaySmallButtonSpan);
		overlaySmallButton.appendChild(overlaySmallButtonLink);
		$$('#chatOptions .smallButtons ul')[0].appendChild(overlaySmallButton);
		
		closeButtonLink.addEventListener('click', function(event) {
			new Animations.FadeOut(overlayID);
			
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
			contentDiv.appendChild(contentBuilder.call(context));
		}
		catch (e) {
			contentBuilder.call(context, contentDiv);
		}
		
		new Animations.FadeIn(overlaySmallButton);
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
		var input = new Element('input', { id: optionID+'Input', 'class': 'hidden', type: 'text', size: '8', autocomplete: 'off', value: this.storage.getValue(optionID+'Value', defaultValue) });
		var hr = new Element('hr');
		
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
				
				this.storage.setValue(optionSpan.getAttribute('id')+'Value', optionInput.value);
				optionSpan.firstChild.replaceData(0, optionSpan.firstChild.nodeValue.length, this.storage.getValue(optionSpan.getAttribute('id')+'Value', defaultValue));
				optionInput.className = (optionInput.className + ' hidden').trim();
				optionSpan.className = optionSpan.className.replace('hidden', '').trim();
				if (Object.isFunction(onChange)) onChange.call(context, optionInput.value);
				$('chatInput').focus();
				event.preventDefault();
			}
		}.bindAsEventListener(this), true);
		
		span.appendChild(document.createTextNode(this.storage.getValue(optionID+'Value', defaultValue)));
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
		var hr = new Element('hr');
		
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
			
			this.storage.setValue(event.target.getAttribute('id')+'Status', event.target.checked);
		}.bindAsEventListener(this), true);
		
		checkbox.checked = this.storage.getValue(optionID+'Status', defaultValue);
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
		return updateCallback.bind(this);
	}
	
	return {
		isAway:			isAway,
		awayMessage:		awayMessage,
		storage:		storage,
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

// Window.bcplus = new BisaChatPlus();

var readyStateChecking = window.setInterval(function() {
	if (document.readyState === 'interactive') {
		Window.bcplus = new BisaChatPlus();
		window.clearInterval(readyStateChecking);
	}
}.bind(this), 10);
