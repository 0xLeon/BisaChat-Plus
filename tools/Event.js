/**
 * Event System
 * Basic event system for custom events
 *
 * Copyright (c) 2011, Stefan Hahn
 */
var Event = {
	events: API.w.$H({}),
	
	register: function(name, handler, context) {
		if (typeof this.events.get(name) === 'undefined') {
			this.events.set(name, API.w.$A([]));
		}
		
		return (this.events.get(name).push(handler.bind(context))-1);
	},
	
	unregister: function(name, index) {
		delete this.events.get(name)[index];
	},
	
	fire: function(name, eventObj) {
		this.events.get(name).each(function(item) {
			item(eventObj);
		});
	}
};
