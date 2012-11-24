/* 
 * Command Controller Core Module
 * Copyright (C) 2011-2012 Stefan Hahn
 */
Modules.Core.CommandController = new ClassSystem.Class(Modules.Util.AbstractCoreModule, {
	initializeVariables: function() {
		this.commands = $H({});
	},
	
	addListeners: function() {
		Event.register('messageSent', function(event) {
			var parsedText = this.parseText(event.parameters.text);
			
			if (!!parsedText && !!this.commands.get(parsedText.command)) {
				var command = this.commands.get(parsedText.command);
				
				if (Object.isString(command.action)) {
					event.parameters.text = command.action;
				}
				else if (Object.isFunction(command.action)) {
					event.parameters.text = command.action(parsedText, command.additionalData);
				}
			}
		}, this);
	},
	
	addCommand: function(name, action, additionalData) {
		if (!!this.commands.get(name)) {
			throw new Error('Command »' + name + '« already exists.')
		}
		
		this.commands.set(name, {
			action: action,
			additionalData: additionalData
		});
	},
	
	removeCommand: function(name) {
		if (!!this.commands.get(name)) {
			throw new Error('Command »' + name + '« doesn\'t exist.')
		}
		
		this.commands.unset(name);
	},
	
	parseText: function(text) {
		if (text.startsWith('/')) {
			var command = text.slice(1, ((!text.includes(' ')) ? (text.length) : text.indexOf(' ')));
			var parameters = ((!text.includes(' ')) ? '' : text.slice(text.indexOf(' ') + 1));
			
			if (parameters.includes(',')) {
				parameters = parameters.split(',').invoke('trim'); 
			}
			else {
				parameters = parameters.split(' ').invoke('trim'); 
			}
			
			if ((parameters.length === 1) && (parameters[0] === '')) {
				parameters.clear();
			}
			
			return {
				command:	command,
				parameters:	parameters
			};
		}
		else {
			return null;
		}
	}
});
