Modules.Update = (function() {
	let bcplus = null;
	
	let $updateInfoBox = null;
	
	let initialize = function(_bcplus) {
		bcplus =  _bcplus;
		
		addStyles();
		buildUI();
		addEventListeners();
		addCommands();
		checkVersion();
	};
	
	let addStyles = function() {
		bcplus.addStyle('#bcplus-updateInfo { position: relative; }');
		bcplus.addStyle('#bcplus-updateInfoCloser { position: absolute; top: 7px; right: 7px; cursor: pointer; }');
	};
	
	let buildUI = function() {
		bcplus.addBoolOption('checkForUpdates', 'Nach Updates suchen', 'update', 'Update', true);
		bcplus.addBoolOption('useUnstable', 'Vorabversionen einbeziehen', 'update', null, false);
		
		$('<dt></dt><dd><span>BisaChat Plus ' + bcplus.getVersion() + '</span></dd>').insertBefore($('#bcplus-update dl dt').first());
		$updateInfoBox = $('<p id="bcplus-updateInfo" class="info invisible"><span id="bcplus-updateInfoCloser" class="icon icon16 icon-remove jsTooltip" title="Update-Information ausblenden"></span><span>BisaChat Plus <span id="bcplus-newVersion"></span> ist verfügbar.<br /><a href="#" title="">Update starten</a></span></p>').insertAfter($('#timsChatTopic, #content > p.info').first());
		
		WCF.DOMNodeInsertedHandler.execute();
	};
	
	let addEventListeners = function() {
		$updateInfoBox.find('#bcplus-updateInfoCloser').on('click', function() {
			$updateInfoBox.addClass('invisible');
			$(Window).resize();
		});
	};
	
	let addCommands = function() {
		bcplus.addCommand(['update', 'u'], function() {
			checkVersion();
		});
	};
	
	let checkVersion = function() {
		if (!bcplus.getOptionValue('checkForUpdates', true)) {
			return;
		}
		
		$.ajax({
			url: 'https://projects.0xleon.com/userscripts/bcplus/update.php',
			dataType: 'json',
			data: {
				version: bcplus.getVersion(),
				unstable: bcplus.getOptionValue('useUnstable', false)
			},
			success: function(data, textStatus, jqXHR) {
				if (!!data.updateAvailable) {
					$updateInfoBox.find('#bcplus-newVersion').text(data.version);
					$updateInfoBox.find('a').attr({
						href: data.url
					});
					$updateInfoBox.removeClass('invisible');
				}
				else {
					$updateInfoBox.addClass('invisible');
				}
				
				$(Window).resize();
			}
		});
	};
	
	return {
		initialize:	initialize,
		checkVersion:	checkVersion
	};
})();
