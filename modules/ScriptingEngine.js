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
		
		this.registerPrefilter();
		this.buildOverlay();
	},
	
	registerPrefilter: function() {
		this.callerObj.registerSilentMessagePrefilter(function(event, nickname, message, messageType) {
			var name = API.w.$A(event.target.querySelectorAll('span[onclick] > span'));
			var tmp = '';
			
			if (!this.nameCache.get(nickname) || (this.nameCache.get(nickname) !== name)) {
				name.each(function(item) {
					tmp += '[color='+String(item.style.color).parseAsColor()+']'+item.firstChild.nodeValue+'[/color]';
				});
				
				this.nameCache.set(nickname, tmp);
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
		this.callerObj.buildOverlay('scriptingEngine', './wcf/icon/pmFullS.png', 'Scripting Engine', function() {
			return this.overlayContentBuilder();
		}.bind(this));
	},
	
	overlayContentBuilder: function() {
		return new API.w.Element('div');
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
										returnValue += '[color='+String(span.style.color).parseAsColor()+']'+span.firstChild.nodeValue+'[/color]';
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