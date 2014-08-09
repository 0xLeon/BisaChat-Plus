/* 
 * Scripting Engine Module
 * Copyright (C) 2011-2012 Stefan Hahn
 */
// TODO: add ability to edit commands
Modules.AddOn.ScriptingEngine = new ClassSystem.Class(Modules.Util.AbstractModule, {
	initializeVariables: function() {
		this.commands = $H(this.storage.getValue('scriptingEngineCommands', {}));
	},
	
	addStyleRules: function() {
		Style.addNode('#scriptingEngine dl dt { clear: both; margin: 3px; }');
		Style.addNode('#scriptingEngine dl dt span { font-weight: bold; }');
		Style.addNode('#scriptingEngine dl hr { display: block; width: 100%; }');
		Style.addNode('#scriptingEngine dl dt input { width: 8% }');
		Style.addNode('#scriptingEngine dl dd input { width: 11% }');
		Style.addNode('#scriptingEngine dl div:last-child hr { opacity: 0; }');
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
				var commandAddNameInput = new Element('input', { 'class': 'inputText', type: 'text', size: 7, placeholder: 'Befehlsname' });
				var commandAddTemplateInput = new Element('input', { 'class': 'inputText', type: 'text', size: 12, placeholder: 'Befehlstext' });
				
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
				
				[commandAddNameInput, commandAddTemplateInput].each(function(input) {
					input.addEventListener('keydown', function(event) {
						var inputs = $$('#scriptingEngine dl input');
						
						if (event.keyCode === 13) {
							if (inputs.all(function(n) { return (n.value.trim().length > 0); })) {
								try {
									this.addCommand(inputs[0].value.trim(), inputs[1].value.trim());
									
									this.buildCommandListElements(inputs[0].value.trim(), inputs[1].value.trim(), false, $$('#scriptingEngine dl')[0]);
									
									new Animations.FadeOut(inputs[0].parentNode.parentNode, {
										onAnimationEnd: function(event) {
											event.target.parentNode.removeChild(event.target);
											
											new Animations.FadeIn($$('#scriptingEngine dl div').last());
										}
									});
								}
								catch (e) {
									Window.alert('Fehler beim Speichern des Befehls.'+"\n"+'Ein Befehl mit diesem Bezeichner existiert bereits!');
									$$('#scriptingEngine dl input')[0].focus();
								}
							}
							else {
								Window.alert('Fehler beim Speichern des Befehls.'+"\n"+'Bitte kontrolliere die Eingabefelder!');
								$$('#scriptingEngine dl input')[0].focus();
							}
						}
					}.bindAsEventListener(this), true);
				}, this);
				
				commandAddDeleteButtonLink.appendChild(commandAddDeleteButtonImg);
				commandAddDt.appendChild(commandAddDeleteButtonLink);
				commandAddDt.appendChild(commandAddNameInput);
				commandAddDd.appendChild(commandAddTemplateInput);
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
				Window.alert('Bitte benutz die schon vorhandenen Eingabefelder!');
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
				this.callerObj.coreModuleInstances.get('CommandController').addCommand(command.key, this.parse, {
					text: command.value
				});
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
					try {
						var commandName = event.target.querySelector('span').firstChild.nodeValue;
						
						this.removeCommand(commandName);
						event.target.parentNode.removeChild(event.target);
					}
					finally {
						this.checkListEmpty(targetList);
					}
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
	},
	
	parse: function(parsedText, additionalData) {
		var message = additionalData.template;
		
		if (message.includes('%mp3%')) {
			return '/me *winamptret*';
		}
		
		return message.replace(/%user%/ig, '[user]' + parsedText.parameters.join(' ') + '[/user]');
	},
	
	addCommand: function(name, template) {
		this.callerObj.coreModuleInstances.get('CommandController').addCommand(name, this.parse, {
			template: template
		});
		this.commands.set(name, template);
		this.storage.setValue('scriptingEngineCommands', this.commands._object);
	},
	
	removeCommand: function(name) {
		this.commands.unset(commandName);
		this.storage.setValue('scriptingEngineCommands', this.commands._object);
		this.callerObj.coreModuleInstances.get('CommandController').removeCommand(name);
	}
});
