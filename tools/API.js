/**
 * BisaChat API
 * Provides useful functions for userscripts
 *
 * Copyright (c) 2011, Stefan Hahn
 */
var API = {
	/**
	 * Storage engine for persistent value storage
	 * 
	 * @type	{Object}
	 */
	Storage: {
		/**
		 * Gets saved value from persistent storage
		 * 
		 * @param	{String}	key
		 * @param	{mixed}		[defaultValue]
		 * @returns	{mixed}
		 */
		getValue: function(key, defaultValue) {
			var type, value;
			
			if (localStorage.getItem(key) === null) {
				if (defaultValue !== undefined) this.setValue(key, defaultValue);
				return defaultValue;
			}
			
			value = localStorage.getItem(key);
			type = value[0];
			value = value.slice(1);
			switch (type) {
				case 'b':
					return (value === 'true');
				case 'n':
					return Number(value);
				case 'o':
					return JSON.parse(value);
				default:
					return value;
			}
		},
		
		/**
		 * Saves value persistent
		 * 
		 * @param	{String}	key
		 * @param	{mixed}		value
		 * @returns	{undefined}
		 */
		setValue: function(key, value) {
			value = (typeof value)[0] + ((typeof value === 'object') ? JSON.stringify(value) : value);
			return localStorage.setItem(key, value);
		},
		
		/**
		 * Deletes value from persistent storage
		 * 
		 * @param	{String}	key
		 * @returns	{undefined}
		 */
		unsetValue: function(key) {
			localStorage.removeItem(key);
		},
		
		/**
		 * Deletes all data from persistent storage
		 * 
		 * @returns	{undefined}
		 */
		clear: function() {
			localStorage.clear();
		},
		
		/**
		 * Amount of saved key value pairs
		 * 
		 * @type	{Number}
		 */
		get length() {
			return localStorage.length;
		},
		
		/**
		 * Returns n-th key
		 * 
		 * @param	{Number}	n
		 * @returns	{String}
		 */
		key: function(n) {
			return localStorage.key(n);
		},
		
		/**
		 * Replace all data in persistent storage with properties of passed object
		 * 
		 * @param	{Object}	Object	Hash-like object
		 * @returns	{undefined}			Returns nothing
		 */
		importSettings: function(obj) {
			if (typeof obj !== 'object') throw new TypeError('obj has to be an object type');
			
			var keys = API.w.$A(Object.keys(obj));
			
			this.clear();
			keys.each(function(key) {
				this.setValue(key, obj[key]);
			}, this);
		},
		
		/**
		 * Returns all key value pairs from persistent storage
		 * 
		 * @returns	{Object}	Hash-like object with every key as property
		 */
		exportSettings: function() {
			var obj = { };
			
			for (var i = 0; i < this.length; i++) {
				obj[this.key(i)] = this.getValue(this.key(i));
			}
			
			return obj;
		}
	},
	
	/**
	 * Selector Engine
	 * Provides methods for selecting elements with DOM tree
	 * 
	 * @type	{Object}
	 */
	Selector: {
		/**
		 * Gets element nodes via ID
		 * Accepts as many parameters as you want
		 * Returns an array of all found nodes
		 * 
		 * Based on Prototype function
		 * Copyright (c) 2005-2010 Sam Stephenson
		 * 
		 * @param	{Object|String}		element		Node or ID string
		 * @returns	{Object|Array}					Single element node or array of nodes
		 */
		$: function(element) {
			if (arguments.length > 1) {
				for (var i = 0, elements = [], length = arguments.length; i < length; i++) {
					elements.push(this.$(arguments[i]));
				}
				
				return elements;
			}

			if (typeof element === 'string') {
				element = document.getElementById(element);
			}
			
			return element;
		},
		
		/**
		 * Gets element nodes via CSS expression
		 * Accepts as many parameters as you want
		 * Returns an array of all found nodes
		 * 
		 * Based on Prototype function
		 * Copyright (c) 2005-2010 Sam Stephenson
		 * 
		 * @param	{String}	cssExpression		CSS expression
		 * @returns	{Array}							Array of nodes
		 */
		$$: function() {
			var expression = API.w.$A(arguments).join(', ');
			
			return API.w.$A(document.documentElement.querySelectorAll(expression));
		}
	},
	
	/**
	 * Add style rules to document
	 * 
	 * @param	{String}	CSSString	Valid CSS style rules
	 * @returns	{undefined}				Returns nothing
	 */
	addStyle: function(CSSString) {
		var styleNode = new this.w.Element('style', { 'type': 'text/css' });
		
		styleNode.appendChild(document.createTextNode(CSSString));
		this.w.$$('head')[0].appendChild(styleNode);
	},
	
	/**
	 * Checks for latest version of userscript
	 * 
	 * @param	{String}	updateServer			Valid URI pointing to an update server
	 * @param	{String}	version					Version number string
	 * @param	{Function}	callback				Gets called if there's a new version, response xml dom passed as first argument
	 * @param	{Boolean}	[getNonStableReleases]	Indicates wether or not to include developer versions in update checking
	 * @returns {undefined}							Returns nothing
	 */
	checkForUpdates: function(updateServer, version, callback, getNonStableReleases) {
		GM_xmlhttpRequest({
			method: 'GET',
			url: updateServer+'?version='+encodeURIComponent(version)+'&getNonStableReleases='+((getNonStableReleases) ? '1' : '0'),
			headers: {
				'Accept': 'text/xml'
			},
			onload: function(response) {
				var xml = ((!response.responseXML) ? (new DOMParser()).parseFromString(response.responseText, 'text/xml') : response.responseXML);
				
				if (xml.documentElement.getAttribute('newVersion') === 'true') {
					callback(xml);
				}
			}
		});
	},
	
	/**
	 * Unrestricted window object
	 * 
	 * @type	{Object}
	 */
	get w() {
		return (unsafeWindow || window);
	},
	
	/**
	 * Width available inside browser content
	 * 
	 * @type	{Number}
	 */
	get inWidth() {
		return parseInt(window.innerWidth);
	},
	
	/**
	 * Height available inside browser content
	 * 
	 * @type	{Number}
	 */
	get inHeight() {
		return parseInt(window.innerHeight);
	}
};

// wrappers for selector functions
window.$ = API.Selector.$;
window.$$ = API.Selector.$$;
