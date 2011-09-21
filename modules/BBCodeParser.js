/*
 * BBCode Parser
 * Copyright (c) 2011, Stefan Hahn
 * 
 * Based on BBCode parser by Andre (http://blogs.stonesteps.ca/showpost.aspx?pid=33)
 * Copyright (c) 2008, Stone Steps Inc.
 */
Modules.BBCodeParser = {
	openingTags: API.w.$A([]),
	noParse: false,
	
	get TAG_NAME_REGEX() {
		return (/^\/?(?:b|i|u|pre|samp|code|colou?r|size|noparse|s|q|blockquote|sub|sup)$/i);
	},
	get COLOR_REGEX() {
		return (/^(:?black|silver|gray|white|maroon|red|purple|fuchsia|green|lime|olive|yellow|navy|blue|teal|aqua|#(?:[0-9a-f]{3})?[0-9a-f]{3})$/i);
	},
	get NUMBER_REGEX() {
		return (/^[\\.0-9]{1,8}$/i);
	},
	get URI_REGEX() {
		return (/^[-;\/\?:@&=\+\$,_\.!~\*'\(\)%0-9a-z]{1,512}$/i);
	},
	get TEXT_REGEX() {
		return (/(?:\[([a-z]{1,16})(?:=([^\x00-\x1F"'\(\)<>\[\]]{1,256}))?\])|(?:\[\/([a-z]{1,16})\])/gi);
	},
	
	callerObj: null,
	
	init: function(callerObj) {
		this.callerObj = callerObj;
		
		this.registerMessagePrefilter();
	},
	
	registerMessagePrefilter: function() {
		this.callerObj.registerMessagePrefilter('bbcode', 'BBCodes', 'BBCode aktivieren', 'b', false, function(event, checked, nickname, message) {
			if (checked) {
				message.innerHTML = this.parse(message.innerHTML);
			}
			else {
				message.innerHTML = this.stripTags(message.innerHTML);
			}
		}, null, this);
	},
	
	isValidTag: function(tag) {
		if (!tag || !tag.length) return false;
		
		return this.TAG_NAME_REGEX.test(tag);
	},
	
	parseTags: function(mString, openingTag, openingTagOption, closingTag, offset, string) {
		if (this.isValidTag(openingTag)) {
			if (this.noParse) return '['+openingTag+']';
			
			switch (openingTag) {
				case 'code':
					this.noParse = true;
					this.openingTags.push({ BBTag: openingTag, closingTag: '</code></pre>' });
					return '<pre><code>';
				case 'pre':
					this.openingTags.push({ BBTag: openingTag, closingTag: '</pre>' });
					return '<pre>';
				case 'color':
				case 'colour':
					if (!openingTagOption || !this.COLOR_REGEX.test(openingTagOption)) openingTagOption = 'inherit';
					this.openingTags.push({ BBTag: openingTag, closingTag: '</span>' });
					return '<span style="color: '+openingTagOption+';">';
				case 'size':
					if (!openingTagOption || !this.NUMBER_REGEX.test(openingTagOption)) openingTagOption = 1;
					this.openingTags.push({ BBTag: openingTag, closingTag: '</span>' });
					return '<span style="font-size: '+(Math.min(Math.max(openingTagOption, 0.7), 3)*12)+'px;">';
				case 's':
					this.openingTags.push({ BBTag: openingTag, closingTag: '</span>' });
					return '<span style="text-decoration: line-through;">';
				case 'i':
					this.openingTags.push({ BBTag: openingTag, closingTag: '</span>' });
					return '<span style="font-style: italic;">';
				case 'noparse':
					this.noParse = true;
					return '';
				case 'quote':
					openingTag = 'blockquote';
				case 'q':
				case 'blockquote':
					this.openingTags.push({ BBTag: openingTag, closingTag: '</'+openingTag+'>' });
					return ((!!openingTagOption && !!openingTagOption.length && this.URI_REGEX.test(openingTagOption)) ? '<'+openingTag+' cite="'+openingTagOption+'">' : '<'+openingTag+'>');
				default:
					this.openingTags.push({ BBTag: openingTag, closingTag: '</'+openingTag+'>' });
					return '<'+openingTag+'>';
			}
		}
		
		if (this.isValidTag(closingTag)) {
			if (this.noParse) {
				if (closingTag === 'noparse' || closingTag === 'code') {
					this.noParse = false;
					return '';
				}
				
				return '['+closingTag+']';
			}
			
			if (!this.openingTags.length || this.openingTags.last().BBTag != closingTag) return '<span style="color: red">[/'+closingTag+']</span>';
			
			return this.openingTags.pop().closingTag;
		}
		
		return mString;
	},
	
	parse: function(text) {
		var result = '';
		var endtags = '';
		
		result = text.replace(this.TEXT_REGEX, (function(context) {
			return function() {
				return context.parseTags.apply(context, arguments);
			}
		})(this));
		
		if (!!this.openingTags.length) {
			while (!!this.openingTags.length) endtags += this.openingTags.pop().closingTag;
		}
		
		this.openingTags.clear();
		this.noParse = false;
		
		return ((!!endtags) ? result + endtags : result);
	},
	
	stripTags: function(text) {
		text = text.replace(this.TEXT_REGEX, (function(context) {
			return function(mString, openingTag, openingTagOption, closingTag, offset, string) {
				if (context.isValidTag(openingTag) || context.isValidTag(closingTag)) return '';
				return mString;
			}
		})(this));
		
		return text;
	}
};
