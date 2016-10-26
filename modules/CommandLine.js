Modules.CommandLine = (function() {
	var bcplus = null;
	
	var optionBooleans = ['true', 'false'];
	var optionNumberRegex = /\D/;
	
	var initialize = function(_bcplus) {
		bcplus = _bcplus;
		
		addCommands();
	};
	
	var addCommands = function() {
		bcplus.addCommand(['clear', 'c'], function() {
			$('#timsChatClear').click();
		});
		bcplus.addCommand(['join', 'j'], function(roomID) {
			roomID = parseInt(roomID, 10);
			
			try {
				if (!roomID) {
					throw new Error('Ungültige Raum-ID.');
				}
				
				var roomLink = $('.timsChatRoom a').filter(function(index, element) {
					return ($(element).data('roomID') === roomID);
				});
				
				if (0 === roomLink.length) {
					throw new Error('Raum-ID »' + roomID + '« existiert nicht.');
				}
				
				roomLink.click();
			}
			catch (e) {
				bcplus.showInfoMessage(e.message);
			}
		});
		bcplus.addCommand(['reload', 'r'], function() {
			Window.location.reload();
		});
		bcplus.addCommand(['leave', 'exit', 'l', 'e'], function() {
			Window.location.href = $('#mainMenu li[data-menu-item="wbb.header.menu.board"] > a').attr('href');
		});
		bcplus.addCommand('catch', function() {
			$('#fish').remove();
		});
		bcplus.addCommand(['spoiler', 'sm'], function() {
			if (arguments.length > 0) {
				return 'SPOILER: [sm]' + Array.prototype.join.apply(arguments, [', ']) + '[/sm]';
			}
		});
		bcplus.addCommand(['layout', 'la'], function() {
			var newStatus = Number(!$('#timsChatAltLayout').data('status'));
			
			if (0 === newStatus) {
				bcplus.showInfoMessage('Bubble-Layout aktiviert.');
			}
			else {
				bcplus.showInfoMessage('Alternatives Layout aktiviert.');
			}
			
			$('#timsChatAltLayout').toggleClass('active').data('status', newStatus);
		});
		
		bcplus.addCommand(['set'], function(optionName, optionValue) {
			var originalValue = bcplus.getOptionValue(optionName, undefined);
			var newValue = null;
			
			if (undefined === originalValue) {
				bcplus.showInfoMessage('»' + optionName + '« ist kein gültiger Optionen-Bezeichner.');
			}
			else {
				newValue = (optionBooleans.indexOf(optionValue.toLowerCase()) > -1) ? ('true' === optionValue) : null;
				newValue = (null === newValue) ? (!(optionNumberRegex.test(optionValue)) ? parseInt(optionValue, 10) : null) : newValue;
				newValue = (null === newValue) ? optionValue : newValue;
				
				bcplus.setOptionValue(optionName, newValue);
				bcplus.showInfoMessage('Neuer Wert für »' + optionName + '« wurde gespeichert.');
			}
		});
		bcplus.addCommand(['listoptions', 'lo'], function() {
			bcplus.showInfoMessage('Verfügbare Optionen: ' + bcplus.getOptionIDs().join(', '));
		});
	};
	
	return {
		initialize:	initialize
	};
})();
