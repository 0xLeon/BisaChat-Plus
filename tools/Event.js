/*
 * Event System
 * Basic event system for custom events
 *
 * Copyright (C) 2011 Stefan Hahn
 */
var Event = (function() {
	/**
	 * Saves event handlers
	 * 
	 * @private
	 * @type	{Hash}
	 */
	var events = $H({});
	
	/**
	 * Register an event handler for an event
	 * 
	 * @param	{String]	name		event name
	 * @param	{Function}	handler		event handler function, has to accept one parameter of type Object
	 * @param	{Object}	[context]	optional object which this will reference to within handler function
	 * @returns	{Number}			index of event handler, necessary when you want to unregister the listener
	 */
	function register(name, handler, context) {
		if (Object.isUndefined(events.get(name))) {
			events.set(name, []);
		}
		
		return (events.get(name).push(handler.bind(context))-1);
	}
	
	/**
	 * Remove an event listener
	 * 
	 * @param	{String}	name		event name
	 * @param	{Number}	index		index retuern by Event.register
	 * @returns	{undefined}			Returns nothing
	 */
	function unregister(name, index) {
		delete events.get(name)[index];
	}
	
	/**
	 * Executes all listeners registered to the named event
	 * 
	 * @param	{String}	name		event name
	 * @param	{Object}	eventObj	object passed to event handlers
	 * @returns	{undefined}			Returns nothing
	 */
	function fire(name, eventObj) {
		if (Object.isArray(events.get(name))) {
			events.get(name).each(function(item) {
				try {
					item(eventObj);
				}
				catch (e) {
					alert('Event Listener konnte nicht ausgeführt werden!'+"\n"+e.name+' - '+e.message);
				}
			});
		}
	}
	
	return {
		register:   register,
		unregister: unregister,
		fire:       fire
	};
})();
