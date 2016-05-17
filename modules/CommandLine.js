Modules.CommandLine = (function() {
	var bcplus = null;
	
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
				
				if (roomLink.length === 0) {
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
	};
	
	return {
		initialize:	initialize
	};
})();
