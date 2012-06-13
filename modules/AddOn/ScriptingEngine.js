/* 
 * Scripting Engine Module
 * Copyright (C) 2011-2012 Stefan Hahn
 */
Modules.AddOn.ScriptingEngine = new ClassSystem.Class(Modules.Util.AbstractModule, {
	initializeVariables: function() {
		this.commands = $H(this.storage.getValue('scriptingEngineCommands', {}));
	},
	
	addStyleRules: function() {
		API.addStyle('#scriptingEngine dl dt { clear: both; margin: 3px; }');
		API.addStyle('#scriptingEngine dl dt span { font-weight: bold; }');
		API.addStyle('#scriptingEngine dl hr { display: block; width: 100%; }');
		API.addStyle('#scriptingEngine dl dt input { width: 8% }');
		API.addStyle('#scriptingEngine dl dd input { width: 11% }');
		API.addStyle('#scriptingEngine dl div:last-child hr { opacity: 0; }');
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
		var node = new Element('div');
		
		var buttonWrapper = new Element('div', { 'class': 'smallButtons' });
		var buttonUl = new Element('ul');
		var buttonLi = new Element('li', { style: 'float: left;' });
		var buttonLink = new Element('a', { href: 'javascript:;' });
		var buttonImg = new Element('img', { src: './wcf/icon/addS.png', style: 'width: 16px; height: 16px;', alt: '' });
		var buttonSpan = new Element('span');
		
		buttonLink.addEventListener('click', function(event) {
			if ($$('#scriptingEngine dl input').size() === 0) {
				var commandDl = (($$('#scriptingEngine dl')[0]) || (new Element('dl')));
				var commandAddWrapper = new Element('div', { style: 'display: none;' });
				var commandAddDt = new Element('dt');
				var commandAddDd = new Element('dd');
				var commandAddInput = new Element('input', { 'class': 'inputText', type: 'text', size: 7, placeholder: 'Befehlsname' });
				var commandAddTextInput = new Element('input', { 'class': 'inputText', type: 'text', size: 12, placeholder: 'Befehlstext' });
				
				var commandAddDeleteButtonLink = new Element('a', { href: 'javascript:;' });
				var commandAddDeleteButtonImg = new Element('img', { src: './wcf/icon/deleteS.png', style: 'width: 16px; height: 16px;', alt: '' });
				
				commandAddDeleteButtonLink.addEventListener('click', function(event) {
					var wrapper = ((event.target.nodeName.toLowerCase() === 'img') ? event.target.parentNode.parentNode.parentNode : event.target.parentNode.parentNode);
					
					new Animations.FadeOut(wrapper, {
						onAnimationEnd: function(event) {
							event.target.parentNode.removeChild(event.target);
							this.checkListEmpty($$('#scriptingEngine dl')[0]);
						}.bind(this)
					});
				}.bindAsEventListener(this), true);
				
				[commandAddInput, commandAddTextInput].each(function(input) {
					input.addEventListener('keydown', function(event) {
						var inputs = $$('#scriptingEngine dl input');
						
						if (event.keyCode === 13) {
							if (inputs.all(function(n) { return (n.value.trim().length > 0); })) {
								if (!this.commands.get(inputs[0].value.trim())) {
									this.commands.set(inputs[0].value.trim(), inputs[1].value.trim());
									this.storage.setValue('scriptingEngineCommands', this.commands._object);
									
									this.buildCommandListElements(inputs[0].value.trim(), inputs[1].value.trim(), false, $$('#scriptingEngine dl')[0]);
									
									new Animations.FadeOut(inputs[0].parentNode.parentNode, {
										onAnimationEnd: function(event) {
											event.target.parentNode.removeChild(event.target);
											
											new Animations.FadeIn($$('#scriptingEngine dl div').last());
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
				commandAddWrapper.appendChild(commandAddDt);
				commandAddWrapper.appendChild(commandAddDd);
				commandDl.appendChild(commandAddWrapper);
				
				if (!commandDl.parentNode) {
					$$('#scriptingEngine p')[0].parentNode.replaceChild(commandDl, $$('#scriptingEngine p')[0]);
				}
				
				new Animations.FadeIn($$('#scriptingEngine dl div').last(), {
					onAnimationEnd: function(event) {
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
			var commandsDl = new Element('dl');
			
			this.commands.each(function(command) {
				this.buildCommandListElements(command.key, command.value, true, commandsDl);
			}, this);
			
			node.appendChild(commandsDl);
		}
		else {
			var p = new Element('p');
			
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
		var commandWrapper = new Element('div', { style: ((visible) ? '' : 'display: none;') });
		var commandDt = new Element('dt')
		var commandSpan = new Element('span');
		var commandDd = new Element('dd')
		var commandDdHr = new Element('dd');
		
		var commandDeleteButtonLink = new Element('a', { href: 'javascript:;' });
		var commandDeleteButtonImg = new Element('img', { src: './wcf/icon/deleteS.png', style: 'width: 16px; height: 16px;', alt: '' });
		
		commandDeleteButtonLink.addEventListener('click', function(event) {
			var wrapper = ((event.target.nodeName.toLowerCase() === 'img') ? event.target.parentNode.parentNode.parentNode : event.target.parentNode.parentNode);
			
			new Animations.FadeOut(wrapper, {
				onAnimationEnd: function(event) {
					var commandName = event.target.querySelector('span').firstChild.nodeValue;
					
					this.commands.unset(commandName);
					this.storage.setValue('scriptingEngineCommands', this.commands._object);
					event.target.parentNode.removeChild(event.target);
					
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
		commandDdHr.appendChild(new Element('hr', { 'class': 'transitionOpacity' }));
		commandWrapper.appendChild(commandDt);
		commandWrapper.appendChild(commandDd);
		commandWrapper.appendChild(commandDdHr);
		targetList.appendChild(commandWrapper);
	},
	
	checkListEmpty: function(targetList) {
		if (this.commands.size() === 0) {
			var p = new Element('p', { style: 'display: none;' });
			
			p.appendChild(document.createTextNode('Keine Befehle vorhanden.'));
			targetList.parentNode.replaceChild(p, targetList);
			new Animations.FadeIn(p);
		}
	}
});
