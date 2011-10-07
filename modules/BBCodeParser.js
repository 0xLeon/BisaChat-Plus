/*
 * BBCode Parser
 * Copyright (C) 2011 Stefan Hahn
 * 
 * Based on WCF BBCode parser by WoltLab <https://github.com/woltlab>
 * Copyright (C) 2001-2011 WoltLab GmbH
 */
Modules.BBCodeParser = {
	callerObj: null,
	definedTags: API.w.$H({
		'b': {
			htmlOpen: 'strong',
			htmlClose: 'strong',
			textOpen: '*',
			textClose: '*',
			getParsedTag: null,
			attributes: API.w.$A([])
		},
		'i': {
			htmlOpen: 'em',
			htmlClose: 'em',
			textOpen: '_',
			textClose: '_',
			getParsedTag: null,
			attributes: API.w.$A([])
		},
		'u': {
			htmlOpen: 'span style="text-decoration: underline;"',
			htmlClose: 'span',
			textOpen: '',
			textClose: '',
			getParsedTag: null,
			attributes: API.w.$A([])
		},
		's': {
			htmlOpen: 'span style="text-decoration: line-through;"',
			htmlClose: 'span',
			textOpen: '-',
			textClose: '-',
			getParsedTag: null,
			attributes: API.w.$A([])
		},
		'sub': {
			htmlOpen: 'sub',
			htmlClose: 'sub',
			textOpen: '~',
			textClose: '~',
			getParsedTag: null,
			attributes: API.w.$A([])
		},
		'sup': {
			htmlOpen: 'sup',
			htmlClose: 'sup',
			textOpen: '^',
			textClose: '^',
			getParsedTag: null,
			attributes: API.w.$A([])
		},
		'color': {
			htmlOpen: 'span',
			htmlClose: 'span',
			textOpen: '',
			textClose: '',
			getParsedTag: null,
			attributes: API.w.$A([{
				attributeNo: 0,
				attributeHtml: 'style="color: %s;"',
				attributeText: '',
				validationPattern: '^(:?black|silver|gray|white|maroon|red|purple|fuchsia|green|lime|olive|yellow|navy|blue|teal|aqua|#(?:[0-9a-f]{3})?[0-9a-f]{3})$',
				required: true,
				useText: false
			}])
		},
		'size': {
			htmlOpen: 'span',
			htmlClose: 'span',
			textOpen: '',
			textClose: '',
			getParsedTag: null,
			attributes: API.w.$A([{
				attributeNo: 0,
				attributeHtml: 'style="font-size: %spt;"',
				attributeText: '',
				validationPattern: '^([89]{1}|[1-3]{1}[0-9]{1})$',
				required: true,
				useText: false
			}])
		},
		'user': {
			htmlOpen: '',
			htmlClose: '',
			textOpen: '',
			textClose: '',
			attributes: API.w.$A([]),
			getParsedTag: function(openingTag, content, closingTag, parser) {
				var returnValue = '';
				
				API.w.chat.loading = true;
				new API.w.Ajax.Request('./index.php?form=Chat', {
					parameters: {
						text: ('/info '+content).trim(),
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
											returnValue = content;
										}
										else {
											returnValue += '<strong>';
											API.w.$A(div.querySelectorAll('ul li:first-child span')).each(function(span) {
												returnValue += '<span style="color: '+span.style.color.parseAsColor()+';">'+span.firstChild.nodeValue+'</span>';
											});
											returnValue += '</strong>';
										}
										
										infoKey = key;
										API.w.chat.id = item.id;
										delete div;
										throw API.w.$break;
									}
								});
								response.responseJSON.messages = messages.without(messages[infoKey]);
								API.w.chat.loading = false;
								if (!!response.responseJSON.messages.length) {
									API.w.chat.handleMessageUpdate(response.responseJSON.messages);
								}
							},
							onFailure: function() {
								API.w.chat.failure();
							},
							sanitizeJSON: true,
							asynchronous: false
						});
					},
					asynchronous: false
				});
				
				return returnValue;
			}
		}
	}),
	outputType: 'text/html',
	text: '',
	parsedText: {
		text: ''
	},
	tagArray: API.w.$A([]),
	textArray: API.w.$A([]),
	
	init: function(callerObj) {
		this.callerObj = callerObj;
		
		this.registerMessagePrefilter();
	},
	
	registerMessagePrefilter: function() {
		this.callerObj.registerMessagePrefilter('bbcode', 'BBCodes', 'BBCode aktivieren', 'b', false, function(event, checked, nickname, message, messageType) {
			if (checked) {
				message.innerHTML = this.parse(message.innerHTML);
			}
			else {
				message.innerHTML = this.stripTags(message.innerHTML);
			}
		}, null, this);
	},
	
	parse: function(text) {
		this.text = text;
		this.buildTagArray();
		this.buildXMLStructure();
		this.buildParsedString();
		
		return this.parsedText.text;
	},
	
	buildTagArray: function() {
		var pattern = this.getTagPattern();
		
		this.tagArray = API.w.$A(this.text.match(pattern));
		this.textArray = API.w.$A(this.text.split(pattern));
		
		this.tagArray = this.tagArray.map(function(tag) {
			return this.buildTag(tag);
		}, this);
	},
	
	buildTag: function(string) {
		var tag = {
			name: '',
			closing: false,
			source: string,
			attributes: API.w.$A([])
		};
		
		if (string.substr(1, 1) === '/') {
			tag.name = string.substr(2, string.length - 3).toLowerCase();
			tag.closing = true;
		}
		else {
			var match = string.match(/^\[([a-z0-9]+)=?(.*)\]$/i);
			
			tag.name = match[1].toLowerCase();
			
			if (match[2] !== '') {
				tag.attributes = this.buildTagAttributes(match[2]);
			}
		}
		
		return tag;
	},
	
	buildTagAttributes: function(string) {
		// todo: find error with ' in attributes
		var matches = API.w.$A(string.match(/(?:^|,)('[^'\\]*(?:\.[^'\\]*)*'|[^,]*)/g));
		
		matches = matches.map(function(match) {
			if ((match.substr(0, 1) === '\'') && (matches.substr(-1) === '\'')) {
				match = match.replace('\\\'', '\'');
				match = match.replace('\\\\', '\\');
				
				match = match.substr(1, match.length - 2);
			}
			
			return match;
		});
		
		return matches;
	},
	
	buildXMLStructure: function() {
		var openTagStack = API.w.$A([]);
		var openTagDataStack = API.w.$A([]);
		var newTagArray = API.w.$A([]);
		var newTextArray = API.w.$A([]);
		var nextIndex = 0;
		var lastIndex = 0;
		
		this.tagArray.each(function(tag, i) {
			if (tag.closing) {
				if (openTagStack.indexOf(tag.name) > -1) {
					var tmpOpenTags = API.w.$A([]);
					var previousTag = '';
					var tmpTag = '';
					
					while ((previousTag = openTagStack.last()) !== tag.name) {
						nextIndex = newTagArray.length;
						newTagArray[nextIndex] = this.buildTag('[/'+previousTag+']');
						if (!newTextArray[nextIndex]) newTextArray[nextIndex] = '';
						newTextArray[nextIndex] += this.textArray[i];
						this.textArray[i] = '';
						tmpOpenTags.push(openTagDataStack.last());
						openTagStack.pop();
						openTagDataStack.pop();
					}
					
					nextIndex = newTagArray.length;
					newTagArray[nextIndex] = tag;
					openTagStack.pop();
					openTagDataStack.pop();
					if (!newTextArray[nextIndex]) newTextArray[nextIndex] = '';
					newTextArray[nextIndex] += this.textArray[i];
					
					while (!!(tmpTag = tmpOpenTags.last())) {
						nextIndex = newTagArray.length;
						newTagArray[nextIndex] = tmpTag;
						if (!newTextArray[nextIndex]) newTextArray[nextIndex] = '';
						openTagStack.push(tmpTag.name);
						openTagDataStack.push(tmpTag);
						tmpOpenTags.pop();
					}
				}
				else {
					this.textArray[i] += tag.source;
					lastIndex = newTagArray.length;
					if (!newTextArray[lastIndex]) newTextArray[lastIndex] = '';
					newTextArray[lastIndex] += this.textArray[i];
				}
			}
			else {
				if (this.isValidTag(tag)) {
					openTagStack.push(tag.name);
					openTagDataStack.push(tag);
					nextIndex = newTagArray.length;
					newTagArray[nextIndex] = tag;
					if (!newTextArray[nextIndex]) newTextArray[nextIndex] = '';
					newTextArray[nextIndex] += this.textArray[i];
				}
				else {
					this.textArray[i] += tag.source;
					lastIndex = newTagArray.length;
					if (!newTextArray[lastIndex]) newTextArray[lastIndex] = '';
					newTextArray[lastIndex] += this.textArray[i];
				}
			}
		}, this);
		
		lastIndex = newTagArray.length;
		if (!newTextArray[lastIndex]) newTextArray[lastIndex] = '';
		newTextArray[lastIndex] += this.textArray[this.tagArray.length];
		
		while (!!openTagStack.last()) {
			nextIndex = newTagArray.length;
			newTagArray[nextIndex] = this.buildTag('[/'+openTagStack.last()+']');
			if (!newTextArray[nextIndex]) newTextArray[nextIndex] = '';
			openTagStack.pop();
			openTagDataStack.pop();
		}
		
		this.tagArray = null;
		this.textArray = null;
		this.tagArray = newTagArray.clone();
		this.textArray = newTextArray.clone();
	},
	
	isValidTag: function(tag) {
		if (!!tag.attributes && (tag.attributes.length > this.definedTags.get(tag.name).attributes.length)) {
			return false;
		}
		
		return this.definedTags.get(tag.name).attributes.all(function(attribute) {
			if (!this.isValidTagAttribute(((!!tag.attributes) ? tag.attributes : API.w.$A([])), attribute)) {
				return false;
			}
			
			return true;
		}, this);
	},
	
	isValidTagAttribute: function(tagAttributes, definedTagAttribute) {
		if (!!definedTagAttribute.validationPattern && !!tagAttributes[definedTagAttribute.attributeNo]) {
			if (!((new RegExp(definedTagAttribute.validationPattern, 'i')).test(tagAttributes[definedTagAttribute.attributeNo]))) {
				return false;
			}
		}
			
		if (definedTagAttribute.required && !definedTagAttribute.useText && !tagAttributes[definedTagAttribute.attributeNo]) {
			return false;
		}
		
		return true;
	},
	
	buildParsedString: function() {
		this.parsedText.text = '';
		
		var buffer = this.parsedText;
		var bufferedTagStack = API.w.$A([]);
		var hideBuffer = false;
		
		this.tagArray.each(function(tag, i) {
			buffer.text += this.textArray[i];
			
			if (tag.closing) {
				var openingTag = bufferedTagStack.last();
				
				if (!!openingTag && (openingTag.name === tag.name)) {
					hideBuffer = false;
					
					this.definedTags.get(tag.name).attributes.each(function(attribute) {
						if (attribute.useText && !openingTag.attributes[attribute.attributeNo]) {
							openingTag.attributes[attribute.attributeNo] = buffer.text;
							hideBuffer = true;
							throw API.w.$break;
						}
					});
					
					var parsedTag = '';
					if (this.isValidTag(openingTag)) {
						if (typeof this.definedTags.get(tag.name).getParsedTag === 'function') {
							parsedTag = this.definedTags.get(tag.name).getParsedTag(openingTag, buffer.text, tag, this);
						}
						else {
							parsedTag = this.buildOpeningTag(openingTag);
							closingTag = this.buildClosingTag(tag);
							if ((closingTag !== '') && hideBuffer) parsedTag += buffer.text+closingTag;
						}
					}
					else {
						parsedTag = openingTag.source+buffer.text+tag.source;
					}
					
					bufferedTagStack.pop();
					
					if (bufferedTagStack.length > 0) {
						bufferedTag = bufferedTagStack.last();
						buffer = bufferedTag.buffer;
					}
					else {
						buffer = this.parsedText;
					}
					
					buffer.text += parsedTag;
				}
				else {
					buffer.text += this.buildClosingTag(tag);
				}
			}
			else {
				if (this.needBuffering(tag)) {
					tag.buffer = {
						text: ''
					};
					bufferedTagStack.push(tag);
					buffer = bufferedTagStack.last().buffer;
				}
				else {
					buffer.text += this.buildOpeningTag(tag);
				}
			}
		}, this);
		
		if (!!this.textArray[this.tagArray.length]) this.parsedText.text += this.textArray[this.tagArray.length];
	},
	
	buildOpeningTag: function(tag) {
		var attributesString = '';
		
		this.definedTags.get(tag.name).attributes.each(function(attribute) {
			var attributeString = '';
			
			if ((this.outputType === 'text/html') && (attribute.attributeHtml !== '')) {
				attributeString = ' '+attribute.attributeHtml;
			}
			else if (this.outputType === 'text/plain') {
				attributeString = attribute.attributeText;
			}
			
			if (attributeString !== '') {
				attributesString += attributeString.replace('%s', tag.attributes[attribute.attributeNo]);
			}
		}, this);
		
		if (this.outputType === 'text/html') {
			if (this.definedTags.get(tag.name).htmlOpen !== '') {
				return '<'+this.definedTags.get(tag.name).htmlOpen+attributesString+((this.definedTags.get(tag.name).htmlClose === '') ? ' /' : '')+'>';
			}
		}
		else if (this.outputType === 'text/plain') {
			if ((this.definedTags.get(tag.name).textOpen !== '') || (attributesString !== '')) {
				return this.definedTags.get(tag.name).textOpen+attributesString;
			}
		}
		
		return '';
	},
	
	buildClosingTag: function(tag) {
		if (this.outputType === 'text/html') {
			if (this.definedTags.get(tag.name).htmlClose !== '') {
				return '</'+this.definedTags.get(tag.name).htmlClose+'>';
			}
		}
		else if (this.outputType === 'text/plain') {
			return this.definedTags.get(tag.name).textClose;
		}
		
		return '';
	},
	
	needBuffering: function(tag) {
		if (typeof this.definedTags.get(tag.name).getParsedTag === 'function') {
			return true;
		}
		
		if (this.definedTags.get(tag.name).attributes.length > 0) {
			return this.definedTags.get(tag.name).attributes.all(function(attribute) {
				if (!!attribute.useText && !tag.attributes[attribute.attributeNo]) {
					return true;
				}
			});
		}
		
		return false;
	},
	
	stripTags: function(text) {
		return text.replace(this.getTagPattern(), '');
	},
	
	getTagPattern: function() {
		var validTags = '';
		this.definedTags.each(function(pair) {
			if (validTags !== '') validTags += '|';
			validTags += pair.key;
		});
		
		return (new RegExp('\\[(?:\\/(?:'+validTags+')|(?:'+validTags+')(?:=(?:\'[^\'\\\\]*(?:\\\\.[^\'\\\\]*)*\'|[^,\\]]*)(?:,(?:\'[^\'\\\\]*(?:\\\\.[^\'\\\\]*)*\'|[^,\\]]*))*)?)\\]', 'ig'));
	}
};
