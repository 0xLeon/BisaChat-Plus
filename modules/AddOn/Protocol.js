/*
 * Protocol Module
 * Copyright (C) 2011-2012 Stefan Hahn
 */
Modules.AddOn.Protocol = new ClassSystem.Class(Modules.Util.AbstractModule, {
	initialize: function($super, callerObj) {
		new Window.Ajax.Request('./index.php?page=ChatLog' + Window.SID_ARG_2ND, {
			onSuccess: function(response) {
				try {
					this.DOMLogPageCache = (new DOMParser()).parseFromString(response.responseText, 'text/xml');
				}
				catch (e) {
					callerObj.pushInfo(String.interpret(e.message));
				}
				
				$super(callerObj);
			}.bind(this)
		});
	},
	
	buildUI: function() {
		this.callerObj.buildOverlay('protocol', 'null.png', 'Protokoll', function(overlayContentNode) {
			this.overlayContentBuilder(overlayContentNode);
		},
		function() {
			
		}, this);
	},
	
	overlayContentBuilder: function(overlayContentNode) {
		if (typeof overlayContentNode !== 'object') throw new TypeError('overlayContentNode has to be of type object');
		
		if (this.DOMLogPageCache !== null) {
			this.insertLog(overlayContentNode);
		}
		else {
			this.reloadLog(overlayContentNode);
		}
	},
	
	parseLogPageDOM: function(DOMLogPage) {
		var messageNodes = [];
		
		$A(DOMLogPage.querySelectorAll('#chatMessage > div > ul > li')).each(function(message) {
			messageNodes.push(message.cloneNode(true));
		});
		
		return messageNodes;
	},
	
	insertLog: function(overlayContentNode) {
		var ul = new Element('ul', { style: 'list-style-type: none;' });
		
		this.parseLogPageDOM(this.DOMLogPageCache).each(function(message) {
			ul.appendChild(message);
		});
		this.DOMLogPageCache = null;
		
		overlayContentNode.appendChild(ul);
	}
});
