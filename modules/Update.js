Modules.Update = (function() {
	var bcplus = null;
	
	var initialize = function(_bcplus) {
		bcplus =  _bcplus;
		
		buildUI();
		checkVersion();
	};
	
	var buildUI = function() {
		bcplus.addBoolOption('checkForUpdates', 'Nach Updates suchen', 'update', 'Update', true);
		bcplus.addBoolOption('useUnstable', 'Vorabversionen einbeziehen', 'update', null, false);
		
		$('<dt></dt><dd><span>BisaChat Plus ' + bcplus.getVersion() + '</span></dd>').insertBefore($('#bcplus-update dl dt').first());
	};
	
	var checkVersion = function() {
		if (!bcplus.getStorage().getValue('checkForUpdatesOption', true)) {
			return;
		}
		
		$.ajax({
			url: 'http://projects.0xleon.com/userscripts/bcplus/update.php',
			dataType: 'json',
			data: {
				version: bcplus.getVersion(),
				unstable: bcplus.getStorage().getValue('useUnstableOption', false)
			},
			success: function(data, textStatus, jqXHR) {
				console.log(data);
			}
		});
	};
	
	return {
		initialize:	initialize,
		checkVersion:	checkVersion
	};
})();
