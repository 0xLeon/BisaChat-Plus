Modules.CommandLine = (function() {
	var bcplus = null;
	
	var initialize = function(_bcplus) {
		bcplus = _bcplus;
		
		addCommands();
	};
	
	var addCommands = function() {
		bcplus.addCommand('clear', function() {
			$('#timsChatClear').click();
		});
		bcplus.addCommand('join', function(roomID) {
			roomID = parseInt(roomID, 10);
			
			try {
				if (!roomID) {
					throw new Error('Ungültige Raum-ID.');
				}
				
				var roomLink = $('.timsChatRoom a').filter(function() {
					return ($(this).data('roomID') === roomID);
				});
				
				if (roomLink.length === 0) {
					throw new Error('Raum-ID »' + roomID + '« existiert nicht.');
				}
				
				roomLink.click();
			}
			catch (e) {
				bcplus.showInfoMessage(e.message);
			}
		});
		bcplus.addCommand('leave', function() {
			$('#mainMenu li[data-menu-item="wbb.header.menu.board"] > a').click();
		});
		bcplus.addCommand('catch', function() {
			$('#fish').remove();
		});
	};
	
	return {
		initialize:	initialize
	};
})();
