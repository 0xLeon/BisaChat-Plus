/**
 * BisaChat API
 * Provides useful functions for userscripts
 *
 * Copyright (C) 2011 Stefan Hahn
 */
var API = (function() {
	/**
	 * Storage engine for persistent value storage
	 * 
	 * @type	{Object}
	 */
	var Storage = (function() {
		/**
		 * Gets saved value from persistent storage
		 * 
		 * @param	{String}	key
		 * @param	{mixed}		[defaultValue]
		 * @returns	{mixed}
		 */
		function getValue(key, defaultValue) {
			var type, value;
			
			if (localStorage.getItem(key) === null) {
				if (!Object.isUndefined(defaultValue)) this.setValue(key, defaultValue);
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
		}
		
		/**
		 * Saves value persistent
		 * 
		 * @param	{String}	key
		 * @param	{mixed}		value
		 * @returns	{undefined}
		 */
		function setValue(key, value) {
			value = (typeof value)[0] + ((typeof value === 'object') ? JSON.stringify(value) : value);
			return localStorage.setItem(key, value);
		}
		
		/**
		 * Deletes value from persistent storage
		 * 
		 * @param	{String}	key
		 * @returns	{undefined}
		 */
		function unsetValue(key) {
			localStorage.removeItem(key);
		}
		
		/**
		 * Deletes all data from persistent storage
		 * 
		 * @returns	{undefined}
		 */
		function clear() {
			localStorage.clear();
		}
		
		/**
		 * Returns n-th key
		 * 
		 * @param	{Number}	n
		 * @returns	{String}
		 */
		function key(n) {
			return localStorage.key(n);
		}
		
		/**
		 * Replace all data in persistent storage with properties of passed object
		 * 
		 * @param	{Object}	Object	Hash-like object
		 * @returns	{undefined}	Returns nothing
		 */
		function importSettings(obj) {
			if (typeof obj !== 'object') throw new TypeError('obj has to be an object type');
			
			var keys = Object.keys(obj);
			
			this.clear();
			keys.each(function(key) {
				this.setValue(key, obj[key]);
			}, this);
		}
		
		/**
		 * Returns all key value pairs from persistent storage
		 * 
		 * @returns	{Object}	Hash-like object with every key as property
		 */
		function exportSettings() {
			var obj = {};
			
			for (var i = 0, length = this.length; i < length; i++) {
				obj[this.key(i)] = this.getValue(this.key(i));
			}
			
			return obj;
		}
		
		return {
			getValue:       getValue,
			setValue:       setValue,
			unsetValue:     unsetValue,
			clear:          clear,
			key:            key,
			importSettings: importSettings,
			exportSettings: exportSettings,
			
			/**
			 * Amount of saved key value pairs
			 * 
			 * @type	{Number}
			 */
			get length() {
				return localStorage.length;
			}
		};
	})();
	
	/**
	 * Selector Engine
	 * Provides methods for selecting elements with DOM tree
	 * 
	 * @type	{Object}
	 */
	var Selector = (function() {
		/**
		 * Gets element nodes via ID
		 * Accepts as many parameters as you want
		 * Returns an array of all found nodes
		 * 
		 * Based on Prototype function
		 * Copyright (c) 2005-2010 Sam Stephenson
		 * 
		 * @param	{Object|String}		element		Node or ID string
		 * @returns	{Object|Array}				Single element node or array of nodes
		 */
		function getElementsByIDs(element) {
			if (arguments.length > 1) {
				for (var i = 0, elements = [], length = arguments.length; i < length; i++) {
					elements.push(getElementsByIDs(arguments[i]));
				}
				
				return $A(elements);
			}

			if (Object.isString('string')) {
				element = document.getElementById(element);
			}
			
			return element;
		}
		
		/**
		 * Gets element nodes via CSS expression
		 * Accepts as many parameters as you want
		 * Returns an array of all found nodes
		 * 
		 * Based on Prototype function
		 * Copyright (c) 2005-2010 Sam Stephenson
		 * 
		 * @param	{String}	cssExpression		CSS expression
		 * @returns	{Array}					Array of nodes
		 */
		function getElementsByCSSExpression() {
			var expression = $A(arguments).join(', ');
			
			return $A(document.documentElement.querySelectorAll(expression));
		}
		
		return {
			getElementsByIDs:           getElementsByIDs,
			getElementsByCSSExpression: getElementsByCSSExpression
		};
	})();
	
	/**
	 * Add style rules to document
	 * 
	 * @param	{String}	CSSString			Valid CSS style rules
	 * @returns	{undefined}					Returns nothing
	 */
	function addStyle(CSSString) {
		var styleNode = new this.w.Element('style', { 'type': 'text/css' });
		
		styleNode.appendChild(document.createTextNode(CSSString));
		this.Selector.getElementsByCSSExpression('head')[0].appendChild(styleNode);
	}
	
	/**
	 * Checks for latest version of userscript
	 * 
	 * @param	{String}	updateServer			Valid URI pointing to an update server
	 * @param	{String}	version				Version number string
	 * @param	{Function}	callback			Gets called if there's a new version, response xml dom passed as first argument
	 * @param	{Boolean}	[getNonStableReleases]		Indicates wether or not to include developer versions in update checking
	 * @returns {undefined}						Returns nothing
	 */
	function checkForUpdates(updateServer, version, callback, getNonStableReleases) {
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
	}
	
	return {
		Storage:         Storage,
		Selector:        Selector,
		addStyle:        addStyle,
		checkForUpdates: checkForUpdates,
		
		/**
		 * Unrestricted window object
		 * 
		 * @type	{Object}
		 */
		get w() {
			return (unsafeWindow || window);
		}
	};
})();

// wrappers for selector functions
window.$ = API.Selector.getElementsByIDs;
window.$$ = API.Selector.getElementsByCSSExpression;
