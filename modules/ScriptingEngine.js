/* 
 * Scripting Engine Module
 * Copyright (c) 2011, Stefan Hahn
 */
Modules.ScriptingEngine = {
	callerObj: null,
	nameCache: API.w.$H({}),
	commands: API.w.$H({}),
	
	init: function(callerObj) {
		this.callerObj = callerObj;
		
		API.addStyle('#scriptingEngine dl dt { font-weight: bold; clear: both; }');
		API.addStyle('#scriptingEngine dl hr { display: block; width: 80%; float: left; }');
		API.addStyle('#scriptingEngine dl dt input { width: 8% }');
		API.addStyle('#scriptingEngine dl dd input { width: 11% }');
		API.addStyle('#scriptingEngine dl dd:last-child hr { display: none; }');
		this.registerPrefilter();
		this.buildOverlay();
	},
	
	registerPrefilter: function() {
		this.callerObj.registerSilentMessagePrefilter(function(event, nickname, message, messageType) {
			var name = API.w.$A(event.target.querySelectorAll('span[onclick] > span')).map(function(item) {
				return '[color='+item.style.color.parseAsColor()+']'+item.firstChild.nodeValue+'[/color]';
			}).join('');
			
			if (!this.nameCache.get(nickname) || (this.nameCache.get(nickname) !== name)) {
				this.nameCache.set(nickname, name);
			}
		}, this);
		
		API.w.Ajax.Responders.register({
			onCreate: function(request, response) {
				if ((request.url.indexOf('form=Chat') > -1) && (request.parameters.text.trim().indexOf('/') === 0)) {
					var command = request.parameters.text.trim().slice(1, request.parameters.text.trim().indexOf(' '));
					
					if (!!this.commands.get(command)) {
						request.options.postBody = 'text='+encodeURIComponent(this.parse(command, request.parameters.text.trim().slice(request.parameters.text.trim().indexOf(' ')+1)))+((!!Modules.SmiliesPlus) ? ((!!$('enablesmilies')) ? '&enablesmilies=on' : '') : (($('enablesmilies').checked) ? '&enablesmilies=on' : ''))+'&ajax=1'
					}
				}
			}.bind(this)
		});
	},
	
	buildOverlay: function() {
		this.callerObj.buildOverlay('scriptingEngine', './wcf/icon/codeS.png', 'Scripting Engine', function() {
			return this.overlayContentBuilder();
		}.bind(this));
	},
	
	overlayContentBuilder: function() {
		var node = new API.w.Element('div');
		
		var buttonWrapper = new API.w.Element('div', { 'class': 'smallButtons' });
		var buttonUl = new API.w.Element('ul');
		var buttonLi = new API.w.Element('li', { style: 'float:left;' });
		var buttonLink = new API.w.Element('a', { href: 'javascript:;' });
		var buttonImg = new API.w.Element('img', { src: './wcf/icon/addS.png', style: 'width: 16px; height: 16px;' });
		var buttonSpan = new API.w.Element('span');
		
		buttonSpan.appendChild(document.createTextNode('Befehl hinzufügen'));
		buttonLink.appendChild(buttonImg);
		buttonLink.appendChild(document.createTextNode(' '));
		buttonLink.appendChild(buttonSpan);
		buttonLi.appendChild(buttonLink);
		buttonUl.appendChild(buttonLi);
		buttonWrapper.appendChild(buttonUl);
		node.appendChild(buttonWrapper);
		
		if (this.commands.size() > 0) {
			var commandsDl = new API.w.Element('dl');
			
			this.commands.each(function(command) {
				var commandsDt = new API.w.Element('dt');
				var commandsDd = new API.w.Element('dd');
				var commandsDdHr = new API.w.Element('dd');
				
				commandsDt.appendChild(document.createTextNode(command.key));
				commandsDd.appendChild(document.createTextNode(command.value));
				commandsDdHr.appendChild(new API.w.Element('hr'));
				commandsDl.appendChild(commandsDt);
				commandsDl.appendChild(commandsDd);
				commandsDl.appendChild(commandsDdHr);
			}, this);
			
			node.appendChild(commandsDl);
		}
		else {
			var p = new API.w.Element('p');
			
			p.appendChild(document.createTextNode('Keine Befehle vorhanden.'));
			node.appendChild(p);
		}
		
		return node;
	},
	
	parse: function(command, parameter) {
		var text = this.commands.get(command);
		
		if ((text.indexOf('%user%') > -1) && !this.nameCache.get(parameter)) {
			this.nameCache.set(parameter, this.getColoredName(parameter));
		}
		
		return '/me '+text.replace(/%user%/ig, this.nameCache.get(parameter));
	},
	
	getColoredName: function(name) {
		var returnValue = '';
		
		API.w.chat.loading = true;
		new API.w.Ajax.Request('./index.php?form=Chat', {
			parameters: {
				text: ('/info '+name).trim(),
				ajax: 1
			},
			onSuccess: function() {
				new API.w.Ajax.Request('index.php?page=ChatMessage&id='+API.w.chat.id+API.w.SID_ARG_2ND, {
					method: 'get',
					onSuccess: function(response) {
						var messages = API.w.$A(response.responseJSON.messages);
						var infoKey = 0;
						
						messages.each(function(item, key) {
							if ((Number(item.type) === 8) && (Number(item.privateID) === API.w.settings.userID)) {
								var div = new API.w.Element('div');
								
								div.innerHTML = item.text;
								
								if (div.firstChild.nodeType === 3) {
									returnValue = name;
								}
								else {
									API.w.$A(div.querySelectorAll('ul li:first-child span')).each(function(span) {
										returnValue += '[color='+span.style.color.parseAsColor()+']'+span.firstChild.nodeValue+'[/color]';
									});
								}
								
								infoKey = key;
								API.w.chat.id = item.id;
								delete div;
								throw API.w.$break;
							}
						}, this);
						response.responseJSON.messages = messages.without(messages[infoKey]);
						API.w.chat.loading = false;
						if (!!response.responseJSON.messages.length) {
							API.w.chat.handleMessageUpdate(response.responseJSON.messages);
						}
					}.bind(this),
					onFailure: function() {
						API.w.chat.failure();
					},
					sanitizeJSON: true,
					asynchronous: false
				});
			}.bind(this),
			asynchronous: false
		});
		
		return returnValue;
	}
};
