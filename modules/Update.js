Modules.Update = (function() {
	var bcplus = null;
	
	var $updateInfoBox = null;
	
	var initialize = function(_bcplus) {
		bcplus =  _bcplus;
		
		addStyles();
		buildUI();
		addEventListeners();
		addCommands();
		checkVersion();
	};
	
	var addStyles = function() {
		bcplus.addStyle('#bcplus-updateInfo { position: relative; }');
		bcplus.addStyle('#bcplus-updateInfoCloser { position: absolute; top: 7px; right: 7px; cursor: pointer; }');
	};
	
	var buildUI = function() {
		bcplus.addBoolOption('checkForUpdates', 'Nach Updates suchen', 'update', 'Update', true);
		bcplus.addBoolOption('useUnstable', 'Vorabversionen einbeziehen', 'update', null, false);
		
		$('<dt></dt><dd><span>BisaChat Plus ' + bcplus.getVersion() + '</span></dd>').insertBefore($('#bcplus-update dl dt').first());
		$updateInfoBox = $('<p id="bcplus-updateInfo" class="info invisible"><span id="bcplus-updateInfoCloser" class="icon icon16 icon-remove jsTooltip" title="Update-Information ausblenden"></span><span>BisaChat Plus <span id="bcplus-newVersion"></span> ist verfügbar.<br /><a href="#" title="">Update starten</a></span></p>').insertAfter($('#timsChatTopic'));
	};
	
	var addEventListeners = function() {
		$updateInfoBox.find('#bcplus-updateInfoCloser').on('click', function() {
			$updateInfoBox.addClass('invisible');
			$(Window).resize();
		});
	};
	
	var addCommands = function() {
		bcplus.addCommand(['update', 'u'], function() {
			checkVersion();
		});
	};
	
	var checkVersion = function() {
		if (!bcplus.getStorage().getValue('checkForUpdatesOption', true)) {
			return;
		}
		
		$.ajax({
			url: 'https://projects.0xleon.com/userscripts/bcplus/update.php',
			dataType: 'json',
			data: {
				version: bcplus.getVersion(),
				unstable: bcplus.getStorage().getValue('useUnstableOption', false)
			},
			success: function(data, textStatus, jqXHR) {
				if (!!data.updateAvailable) {
					$updateInfoBox.find('#bcplus-newVersion').text(data.version);
					$updateInfoBox.find('a').attr({
						href: data.url
					});
					$updateInfoBox.removeClass('invisible');
					$(Window).resize();
				}
				else {
					$updateInfoBox.addClass('invisible');
				}
			}
		});
	};
	
	return {
		initialize:	initialize,
		checkVersion:	checkVersion
	};
})();
