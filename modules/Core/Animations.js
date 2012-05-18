/* 
 * Animations Core Module
 * Copyright (C) 2011-2012 Stefan Hahn
 */
Modules.Core.Animations = new ClassSystem.Class(Modules.Util.AbstractCoreModule, (function() {
	function initialize($super, callerObj) {
		getAnimationConfig.call(this);
		$super(callerObj);
	}
	
	function addStyleRules() {
		API.addStyle('@'+this.config.cssVendorPrefix+'keyframes fadeIn {\n'+
			'from {\n'+
				'opacity: 0;\n'+
			'}\n'+
			'to {\n'+
				'opacity: 1;\n'+
			'}\n'+
		'}');
		API.addStyle('@'+this.config.cssVendorPrefix+'keyframes fadeOut {\n'+
			'from {\n'+
				'opacity: 1;\n'+
			'}\n'+
			'to {\n'+
				'opacity: 0;\n'+
			'}\n'+
		'}');
		API.addStyle('@'+this.config.cssVendorPrefix+'keyframes highlight {\n'+
			'0% {\n'+
				'background-color: rgba(255, 255, 153, 0);\n'+
			'}\n'+
			'15% {\n'+
				'background-color: rgba(255, 255, 153, 1);\n'+
			'}\n'+
			'100% {\n'+
				'background-color: transparent;\n'+
			'}\n'+
		'}');
	}
	
	function getAnimationConfig() {
		var prefixes = ['Moz', 'Webkit', 'O'];
		
		this.config = {
			animation: false,
			domAnimationString: 'animation',
			cssVendorPrefix: '',
			styleID: 17,
			events: {
				start: 'animationstart',
				end: 'animationend',
				iteration: 'animationiteration'
			}
		};
		
		if (!Object.isUndefined($$('body')[0].style.animationName)) {
			this.config.animation = true;
		}
		
		if (!this.config.animation) {
			prefixes.each(function(prefix) {
				if (!Object.isUndefined($$('body')[0].style[prefix+'AnimationName'])) {
					this.config.animation = true;
					this.config.domAnimationString = prefix+'Animation';
					this.config.cssVendorPrefix = '-'+prefix.toLowerCase()+'-';
					
					if (prefix == 'Webkit') {
						this.config.events.start = 'webkitAnimationStart';
						this.config.events.end = 'webkitAnimationEnd';
						this.config.events.iteration = 'webkitAnimationIteration';
					}
					
					throw $break;
				}
			}, this);
		}
		
		$$('head > link[rel="stylesheet"]').each(function(styleNode) {
			var result = null;
			
			if (!!(result = styleNode.getAttribute('href').match(/style-(\d+)\.css$/))) {
				this.config.styleID = parseInt(result[1], 10);
				
				throw $break;
			}
		}, this);
	}
	
	function addGlobalAnimationListeners(element) {
		if (!element.animationGlobalListenersAdded) {
			element.addEventListener(this.config.events.start, function(event) {
				event.target.animating = true;
				
				switch (event.animationName) {
					case 'fadeIn':
						event.target.style.display = '';
						break;
				}
				
				if (Object.isFunction(event.target.onAnimationStart)) {
					event.target.onAnimationStart(event);
				}
			}, false);
			element.addEventListener(this.config.events.end, function(event) {
				switch (event.animationName) {
					case 'fadeOut':
						event.target.style.display = 'none';
						break;
				}
				
				if (Object.isFunction(event.target.onAnimationEnd)) {
					event.target.onAnimationEnd(event);
				}
				
				delete event.target.onAnimationStart;
				delete event.target.onAnimationEnd;
				
				event.target.animating = false;
				event.target.style[this.config.domAnimationString] = '';
			}.bind(this), false);
			
			element.animationGlobalListenersAdded = true;
		}
	}
	
	function doAnimation(element, config, animationString) {
		element = $(element);
		config = config || {};
		
		addGlobalAnimationListeners.call(this, element);
		
		if (!element.animating) {
			if (Object.isFunction(config.onAnimationStart)) element.onAnimationStart = config.onAnimationStart;
			if (Object.isFunction(config.onAnimationEnd)) element.onAnimationEnd = config.onAnimationEnd;
			
			element.style[this.config.domAnimationString] = animationString;
		}
	}
	
	function fadeIn(element, config) {
		doAnimation.apply(this, [element, config, 'fadeIn 1s ease-in-out forwards']);
	}
	
	function fadeOut(element, config) {
		doAnimation.apply(this, [element, config, 'fadeOut 1s ease-in-out forwards']);
	}
	
	function highlight(element, config) {
		doAnimation.apply(this, [element, config, 'highlight 1500ms linear forwards']);
	}
	
	return {
		initialize:	initialize,
		addStyleRules:	addStyleRules,
		
		fadeIn:		fadeIn,
		fadeOut:	fadeOut,
		highlight:	highlight
	};
})());
