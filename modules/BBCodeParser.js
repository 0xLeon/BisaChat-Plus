/*
 * BBCode Parser 1.0.3
 * Based on BBCode parser by Andre (http://blogs.stonesteps.ca/showpost.aspx?pid=33)
 * Copyright (c) 2008, Stone Steps Inc.
 */
var BBCodeParser = {
	openingTags: [ ],
	noParse: false,
	
	get TAG_NAME_REGEX() {
		return (/^\/?(?:b|i|u|pre|samp|code|colou?r|size|noparse|s|q|blockquote|sub|sup)$/);
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
	
	caller: null,
	
	init: function(caller) {
		this.caller = caller;
		
		this.registerMessagePrefilter();
	},
	
	registerMessagePrefilter: function() {
		this.caller.registerMessagePrefilter('bbcode', 'BBCode aktivieren', 'b', false, function(event, checked, nickname, message) {
			if (checked) {
				message.innerHTML = BBCodeParser.parse(message.innerHTML);
			}
			else {
				message.innerHTML = message.innerHTML.replace(BBCodeParser.TEXT_REGEX, function(mString, openingTag, openingTagOption, closingTag, offset, string) {
					if (BBCodeParser.isValidTag(openingTag) || BBCodeParser.isValidTag(closingTag)) return '';
					return mString;
				});
			}
		});
	},
	
	isValidTag: function(tag) {
		if (!tag || !tag.length) return false;
		
		return this.TAG_NAME_REGEX.test(tag);
	},
	
	parseTags: function(mString, openingTag, openingTagOption, closingTag, offset, string) {
		if (BBCodeParser.isValidTag(openingTag)) {
			if (BBCodeParser.noParse) return '['+openingTag+']';
			
			switch (openingTag) {
				case 'code':
					BBCodeParser.noParse = true;
					BBCodeParser.openingTags.push({ BBTag: openingTag, closingTag: '</code></pre>' });
					return '<pre><code>';
				case 'pre':
					BBCodeParser.openingTags.push({ BBTag: openingTag, closingTag: '</pre>' });
					return '<pre>';
				case 'color':
				case 'colour':
					if (!openingTagOption || !BBCodeParser.COLOR_REGEX.test(openingTagOption)) openingTagOption = 'inherit';
					BBCodeParser.openingTags.push({ BBTag: openingTag, closingTag: '</span>' });
					return '<span style="color: '+openingTagOption+';">';
				case 'size':
					if (!openingTagOption || !BBCodeParser.NUMBER_REGEX.test(openingTagOption)) openingTagOption = 1;
					BBCodeParser.openingTags.push({ BBTag: openingTag, closingTag: '</span>' });
					return '<span style="font-size: '+(Math.min(Math.max(openingTagOption, 0.7), 3)*12)+'px;">';
				case 's':
					BBCodeParser.openingTags.push({ BBTag: openingTag, closingTag: '</span>' });
					return '<span style="text-decoration: line-through;">';
				case 'i':
					BBCodeParser.openingTags.push({ BBTag: openingTag, closingTag: '</span>' });
					return '<span style="font-style: italic;">'
				case 'noparse':
					BBCodeParser.noParse = true;
					return '';
				case 'quote':
					openingTag = 'blockquote';
				case 'q':
				case 'blockquote':
					BBCodeParser.openingTags.push({ BBTag: openingTag, closingTag: '</'+openingTag+'>' });
					return ((!!openingTagOption && !!openingTagOption.length && BBCodeParser.URI_REGEX.test(openingTagOption)) ? '<'+openingTag+' cite="'+openingTagOption+'">' : '<'+openingTag+'>');
				default:
					BBCodeParser.openingTags.push({ BBTag: openingTag, closingTag: '</'+openingTag+'>' });
					return '<'+openingTag+'>';
			}
		}
		
		if (BBCodeParser.isValidTag(closingTag)) {
			if (BBCodeParser.noParse) {
				if (closingTag == 'noparse' || closingTag == 'code') {
					BBCodeParser.noParse = false;
					return '';
				}
				
				return '['+closingTag+']';
			}
			
			if (!BBCodeParser.openingTags.length || BBCodeParser.openingTags[BBCodeParser.openingTags.length-1].BBTag != closingTag) return '<span style="color: red">[/'+closingTag+']</span>';
			
			return BBCodeParser.openingTags.pop().closingTag;
		}
		
		return mString;
	},
	
	parse: function(text) {
		var result = '';
		var endtags = '';
		
		result = text.replace(this.TEXT_REGEX, this.parseTags);
		
		if (!!this.openingTags.length) {
			while (!!this.openingTags.length) endtags += this.openingTags.pop().closingTag;
		}
		
		this.openingTags = [ ];
		this.noParse = false;
		
		return ((!!endtags) ? result + endtags : result);
	}
};
