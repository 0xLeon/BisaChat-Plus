/* 
 * Scripting Engine Module
 * Copyright (C) 2011 Stefan Hahn
 */
Modules.ScriptingEngine = new ClassSystem.Class(Modules.AbstractModule, {
	initializeVariables: function() {
		this.commands = $H(API.Storage.getValue('scriptingEngineCommands', {}));
	},
	
	addStyleRules: function() {
		API.addStyle('#scriptingEngine dl dt { clear: both; margin: 3px; }');
		API.addStyle('#scriptingEngine dl dt span { font-weight: bold; }');
		API.addStyle('#scriptingEngine dl hr { display: block; width: 80%; float: left; }');
		API.addStyle('#scriptingEngine dl dt input { width: 8% }');
		API.addStyle('#scriptingEngine dl dd input { width: 11% }');
		API.addStyle('#scriptingEngine dl dd:last-child hr { display: none; }');
	},
	
	addListeners: function() {
		Event.register('messageSent', function(event) {
			if (event.parameters.text.trim().startsWith('/')) {
				var command = event.parameters.text.trim().slice(1, ((!event.parameters.text.trim().includes(' ')) ? (event.parameters.text.trim().length) : event.parameters.text.trim().indexOf(' ')));
				var parameter = ((!event.parameters.text.trim().includes(' ')) ? '' : event.parameters.text.trim().slice(event.parameters.text.trim().indexOf(' ')+1));
				
				if (!!this.commands.get(command)) {
					event.options.postBody = 'text='+encodeURIComponent(this.parse(command, parameter))+((!!this.callerObj.moduleInstances.get('SmiliesPlus')) ? ((!!$('enablesmilies')) ? '&enablesmilies=on' : '') : (($('enablesmilies').checked) ? '&enablesmilies=on' : ''))+'&ajax=1'
				}
			}
		}, this);
	},
	
	buildUI: function() {
		this.callerObj.buildOverlay('scriptingEngine', './wcf/icon/codeS.png', 'Scripting Engine', function() {
			return this.overlayContentBuilder();
		}, null, this);
	},
	
	overlayContentBuilder: function() {
		var node = new API.w.Element('div');
		
		var buttonWrapper = new API.w.Element('div', { 'class': 'smallButtons' });
		var buttonUl = new API.w.Element('ul');
		var buttonLi = new API.w.Element('li', { style: 'float:left;' });
		var buttonLink = new API.w.Element('a', { href: 'javascript:;' });
		var buttonImg = new API.w.Element('img', { src: './wcf/icon/addS.png', style: 'width: 16px; height: 16px;', alt: '' });
		var buttonSpan = new API.w.Element('span');
		
		buttonLink.addEventListener('click', function(event) {
			if (!$$('#scriptingEngine dl dd:last-child')[0] || ($$('#scriptingEngine dl dd:last-child')[0].previousSibling.firstChild.nodeType === 3)) {
				var commandDl = (($$('#scriptingEngine dl')[0]) || (new API.w.Element('dl')));
				var commandAddDt = new API.w.Element('dt', { style: 'display: none;' });
				var	commandAddDd = new API.w.Element('dd', { style: 'display: none;' });
				var commandAddInput = new API.w.Element('input', { 'class': 'inputText', type: 'text', size: 7, value: 'Befehlsname', style: 'font-style: italic;' });
				var commandAddTextInput = new API.w.Element('input', { 'class': 'inputText', type: 'text', size: 12, value: 'Befehlstext', style: 'font-style: italic;' });
				
				var commandAddDeleteButtonLink = new API.w.Element('a', { href: 'javascript:;' });
				var commandAddDeleteButtonImg = new API.w.Element('img', { src: './wcf/icon/deleteS.png', style: 'width: 16px; height: 16px;', alt: '' });
				
				commandAddDeleteButtonLink.addEventListener('click', function(event) {
					var dt = ((event.target.nodeName.toLowerCase() === 'img') ? event.target.parentNode.parentNode : event.target.parentNode);
					
					new API.w.Effect.Parallel([
						new API.w.Effect.Fade(dt, { sync: true, afterFinish: function(effect) { effect.element.parentNode.removeChild(effect.element); } }),
						new API.w.Effect.Fade(dt.nextSibling, { sync: true, afterFinish: function(effect) { effect.element.parentNode.removeChild(effect.element); } })
					], {
						afterFinish: function() {
							this.checkListEmpty($$('#scriptingEngine dl')[0]);
						}.bind(this)
					});
				}.bindAsEventListener(this), true);
				
				[commandAddInput, commandAddTextInput].each(function(input) {
					input.addEventListener('focus', function(event) {
						if ((event.target.value === 'Befehlsname') || (event.target.value === 'Befehlstext')) {
							event.target.value = '';
						}
						
						event.target.style.fontStyle = 'normal';
						event.target.select();
					}, true);
					
					input.addEventListener('blur', function(event) {
						if (event.target.value === '') {
							event.target.style.fontStyle = 'italic';
							event.target.value = ['', '', '', '', '', '', '', 'Befehlsname', '', '', '', '', 'Befehlstext'][parseInt(event.target.size)];
						}
					}, true);
					
					input.addEventListener('keydown', function(event) {
						var inputs = $$('#scriptingEngine dl input');
						
						if (event.keyCode === 13) {
							if (inputs.all(function(n) { return (n.value.trim().length > 0); })) {
								if (!this.commands.get(inputs[0].value.trim())) {
									this.commands.set(inputs[0].value.trim(), inputs[1].value.trim());
									API.Storage.setValue('scriptingEngineCommands', this.commands._object);
									
									this.buildCommandListElements(inputs[0].value.trim(), inputs[1].value.trim(), false, $$('#scriptingEngine dl')[0]);
									
									new API.w.Effect.Parallel([
										new API.w.Effect.Fade(inputs[0].parentNode, { sync: true, afterFinish: function(effect) { effect.element.parentNode.removeChild(effect.element); } }),
										new API.w.Effect.Fade(inputs[1].parentNode, { sync: true, afterFinish: function(effect) { effect.element.parentNode.removeChild(effect.element); } })
									], {
										afterFinish: function() {
											new API.w.Effect.Parallel([
												new API.w.Effect.Appear($$('#scriptingEngine dl dt').last(), { sync: true }),
												new API.w.Effect.Appear($$('#scriptingEngine dl dd').last().previousSibling, { sync: true })
											]);
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
				
				commandAddDeleteButtonLink.appendChild(commandAddDeleteButtonImg);
				commandAddDt.appendChild(commandAddDeleteButtonLink);
				commandAddDt.appendChild(commandAddInput);
				commandAddDd.appendChild(commandAddTextInput);
				commandDl.appendChild(commandAddDt);
				commandDl.appendChild(commandAddDd);
				
				if (!commandDl.parentNode) {
					$$('#scriptingEngine p')[0].parentNode.replaceChild(commandDl, $$('#scriptingEngine p')[0]);
				}
				
				new API.w.Effect.Parallel([
					new API.w.Effect.Appear($$('#scriptingEngine dl dt').last(), { sync: true }),
					new API.w.Effect.Appear($$('#scriptingEngine dl dd').last(), { sync: true })
				], {
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
				this.buildCommandListElements(command.key, command.value, true, commandsDl);
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
		
		if (text.includes('%mp3%')) {
			text = '*winamptret*';
		}
		
		text = text.replace(/%user%/ig, '[user]'+parameter+'[/user]');
		
		return '/me '+text;
	},
	
	buildCommandListElements: function(command, text, visible, targetList) {
		var commandDt = new API.w.Element('dt', { style: ((visible) ? '' : 'display: none;') });
		var commandSpan = new API.w.Element('span');
		var commandDd = new API.w.Element('dd', { style: ((visible) ? '' : 'display: none;') });
		var commandDdHr = new API.w.Element('dd');
		
		var commandDeleteButtonLink = new API.w.Element('a', { href: 'javascript:;' });
		var commandDeleteButtonImg = new API.w.Element('img', { src: './wcf/icon/deleteS.png', style: 'width: 16px; height: 16px;', alt: '' });
		
		commandDeleteButtonLink.addEventListener('click', function(event) {
			var dt = ((event.target.nodeName.toLowerCase() === 'img') ? event.target.parentNode.parentNode : event.target.parentNode);
			var dd = dt.nextSibling;
			var ddHr = dd.nextSibling;
			var commandName = dt.querySelector('span').firstChild.nodeValue;
			
			new API.w.Effect.Parallel([
				new API.w.Effect.Fade(dt, { sync: true, afterFinish: function(effect) { effect.element.parentNode.removeChild(effect.element); } }),
				new API.w.Effect.Fade(dd, { sync: true, afterFinish: function(effect) { effect.element.parentNode.removeChild(effect.element); } }),
				new API.w.Effect.Fade(ddHr, { sync: true, afterFinish: function(effect) { effect.element.parentNode.removeChild(effect.element); } })
			], {
				afterFinish: function() {
					this.commands.unset(commandName);
					API.Storage.setValue('scriptingEngineCommands', this.commands._object);
					
					this.checkListEmpty(targetList);
				}.bind(this)
			});
		}.bindAsEventListener(this), true);
		
		commandDeleteButtonLink.appendChild(commandDeleteButtonImg);
		commandSpan.appendChild(document.createTextNode(command));
		commandDt.appendChild(commandDeleteButtonLink);
		commandDt.appendChild(document.createTextNode(' '));
		commandDt.appendChild(commandSpan);
		commandDd.appendChild(document.createTextNode(text));
		commandDdHr.appendChild(new API.w.Element('hr'));
		targetList.appendChild(commandDt);
		targetList.appendChild(commandDd);
		targetList.appendChild(commandDdHr);
	},
	
	checkListEmpty: function(targetList) {
		if (this.commands.size() === 0) {
			var p = new API.w.Element('p', { style: 'display: none;' });
			
			p.appendChild(document.createTextNode('Keine Befehle vorhanden.'));
			targetList.parentNode.replaceChild(p, targetList);
			new API.w.Effect.Appear($$('#scriptingEngine p')[0]);
		}
	}
});
