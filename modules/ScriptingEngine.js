/* 
 * Scripting Engine Module
 * Copyright (c) 2011, Stefan Hahn
 */
Modules.ScriptingEngine = {
	callerObj: null,
	nameCache: API.w.$H({}),
	commands: API.w.$H(API.Storage.getValue('scriptingEngineCommands', {})),
	
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
		
		buttonLink.addEventListener('click', function(event) {
			if (!$$('#scriptingEngine dl dd:last-child')[0] || ($$('#scriptingEngine dl dd:last-child')[0].previousSibling.firstChild.nodeType === 3)) {
				var commandDl = (($$('#scriptingEngine dl')[0]) || (new API.w.Element('dl')));
				var commandAddDt = new API.w.Element('dt', { style: 'display: none;' });
				var	commandAddDd = new API.w.Element('dd', { style: 'display: none;' });
				var commandAddInput = new API.w.Element('input', { 'class': 'inputText', type: 'text', size: 7, value: '' });
				var commandAddTextInput = new API.w.Element('input', { 'class': 'inputText', type: 'text', size: 12, value: '' });
				
				API.w.$A([commandAddInput, commandAddTextInput]).each(function(input) {
					input.addEventListener('focus', function(event) {
						event.target.select();
					}, true);
					
					input.addEventListener('keydown', function(event) {
						var inputs = $$('#scriptingEngine dl input');
						
						if (event.keyCode === 13) {
							if (inputs.all(function(n) { return (n.value.trim().length > 0); })) {
								if (!this.commands.get(inputs[0].value.trim())) {
									this.commands.set(inputs[0].value.trim(), inputs[1].value.trim());
									API.Storage.setValue('scriptingEngineCommands', this.commands._object);
									
									var newCommandDt = new API.w.Element('dt', { style: 'display: none;' });
									var	newCommandDd = new API.w.Element('dd', { style: 'display: none;' });
									var newCommandDdHr = new API.w.Element('dd');
									
									newCommandDt.appendChild(document.createTextNode(inputs[0].value.trim()));
									newCommandDd.appendChild(document.createTextNode(inputs[1].value.trim()));
									newCommandDdHr.appendChild(new API.w.Element('hr'));
									$$('#scriptingEngine dl')[0].appendChild(newCommandDt);
									$$('#scriptingEngine dl')[0].appendChild(newCommandDd);
									
									new API.w.Effect.Parallel(API.w.$A([
										new API.w.Effect.Fade(inputs[0].parentNode, { sync: true, afterFinish: function(effect) { effect.element.parentNode.removeChild(effect.element); } }),
										new API.w.Effect.Fade(inputs[1].parentNode, { sync: true, afterFinish: function(effect) { effect.element.parentNode.removeChild(effect.element); } })
									]), {
										afterFinish: function() {
											new API.w.Effect.Parallel(API.w.$A([
												new API.w.Effect.Appear($$('#scriptingEngine dl dt').last(), { sync: true }),
												new API.w.Effect.Appear($$('#scriptingEngine dl dd').last(), { sync: true , afterFinish: function() { $$('#scriptingEngine dl')[0].appendChild(newCommandDdHr); } })
											]));
										}
									});
								}
								else {
									API.w.alert('Fehler beim Speichern des Befehls.'+"\n"+'Ein Befehl mit diesem Bezeichner existiert bereits!');
									$$('#scriptingEngine dl input')[0].focus();
								}
							}
							else {
								API.w.alert('Fehler beim Speichern des Befehls.'+"\n"+'Bitte kontrolliere die Eingabefelder!');
								$$('#scriptingEngine dl input')[0].focus();
							}
						}
					}.bindAsEventListener(this), true);
				}, this);
				
				commandAddDt.appendChild(commandAddInput);
				commandAddDd.appendChild(commandAddTextInput);
				commandDl.appendChild(commandAddDt);
				commandDl.appendChild(commandAddDd);
				
				if (!commandDl.parentNode) {
					$$('#scriptingEngine p')[0].parentNode.replaceChild(commandDl, $$('#scriptingEngine p')[0]);
				}
				
				new API.w.Effect.Parallel(API.w.$A([
					new API.w.Effect.Appear($$('#scriptingEngine dl dt').last(), { sync: true }),
					new API.w.Effect.Appear($$('#scriptingEngine dl dd').last(), { sync: true })
				]), {
					afterFinish: function() {
						$$('#scriptingEngine dl dt input').last().focus();
					}
				});
			}
			else {
				API.w.alert('Bitte benutz die schon vorhandenen Eingabefelder!');
				$$('#scriptingEngine dl input')[0].focus();
			}
		}.bindAsEventListener(this), true);
		
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
