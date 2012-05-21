/*
 * Event System
 * Basic event system for custom events
 *
 * Copyright (C) 2011-2012 Stefan Hahn
 */
var Event = (function() {
	/**
	 * Saves event handlers
	 * 
	 * @private
	 * @type	{Hash}
	 */
	var events = $H({});

	var keys = {
		KEY_BACKSPACE:	8,
		KEY_TAB:	9,
		KEY_RETURN:	13,
		KEY_ESC:	27,
		KEY_LEFT:	37,
		KEY_UP:		38,
		KEY_RIGHT:	39,
		KEY_DOWN:	40,
		KEY_DELETE:	46,
		KEY_HOME:	36,
		KEY_END:	35,
		KEY_PAGEUP:	33,
		KEY_PAGEDOWN:	34,
		KEY_INSERT:	45
	};

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
	
	function stop(event) {
		event.preventDefault();
		event.stopPropagation();

		event.stopped = true;
	}
	
	
	function pointerX(event) {
		var docElement = document.documentElement;
		var body = document.body || {
			scrollLeft: 0
		};
		
		return (event.pageX || (event.clientX + (docElement.scrollLeft || body.scrollLeft) - (docElement.clientLeft || 0)));
	}

	
	function pointerY(event) {
		var docElement = document.documentElement;
		var body = document.body || {
			scrollTop: 0
		};

		return (event.pageY || (event.clientY + (docElement.scrollTop || body.scrollTop) - (docElement.clientTop || 0)));
	}

	if (WEBKIT) {
		_isButton = function(event, code) {
			switch (code) {
				case 0:
					return ((event.which == 1) && !event.metaKey);
				case 1:
					return ((event.which == 2) || ((event.which == 1) && event.metaKey));
				case 2:
					return (event.which == 3);
				default:
					return false;
			}
		}

	}
	else {
		_isButton = function(event, code) {
			return ((event.which) ? (event.which === code + 1) : (event.button === code));
		}
	}

	function isLeftClick(event) {
		return _isButton(event, 0);
	}
	
	function isMiddleClick(event) {
		return _isButton(event, 1);
	}
	
	function isRightClick(event) {
		return _isButton(event, 2);
	}

	
	return {
		register:	register,
		unregister:	unregister,
		fire:		fire,
		
		keys:		keys,
		stop:		stop,
		pointerX:	pointerX,
		pointerY:	pointerY,
		isLeftClick:	isLeftClick,
		isMiddleClick:	isMiddleClick,
		isRightClick:	isRightClick
	};
})();
