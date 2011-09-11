/**
 * Event System
 * Basic event system for custom events
 *
 * Copyright (c) 2011, Stefan Hahn
 */
var Event = {
	/**
	 * Saves event handlers
	 * 
	 * @private
	 * @type	{Hash}
	 */
	events: API.w.$H({}),
	
	/**
	 * Register and event handler for an event
	 * 
	 * @param	{String]	name		event name
	 * @param	{Function}	handler		event handler function, has to accept one parameter of type Object
	 * @param	{Object}	[context]	optional object which this will reference to within handler function
	 * @returns	{Number}				index of event handler, necessary when you want to unregister the listener
	 */
	register: function(name, handler, context) {
		if (typeof this.events.get(name) === 'undefined') {
			this.events.set(name, API.w.$A([]));
		}
		
		return (this.events.get(name).push(handler.bind(context))-1);
	},
	
	/**
	 * Remove an event listener
	 * 
	 * @param	{String}	name	event name
	 * @param	{Number}	index	index retuern by Event.register
	 * @returns	{undefined}			Returns nothing
	 */
	unregister: function(name, index) {
		delete this.events.get(name)[index];
	},
	
	/**
	 * Executes all listeners registered to the named event
	 * 
	 * @param	{String}	name		event name
	 * @param	{Object}	eventObj	object passed to event handlers
	 * @returns	{undefined}				Returns nothing
	 */
	fire: function(name, eventObj) {
		if (!!this.events.get(name)) {
			this.events.get(name).each(function(item) {
				item(eventObj);
			});
		}
	}
};
