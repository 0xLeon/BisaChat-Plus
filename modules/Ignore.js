Modules.Ignore = (function() {
	var bcplus = null;
	var ignoredUserIDs = null;
	var $ignoreButton = null;
	var $ignoreDialog = null;
	var $ignoreStyleNode = null;
	
	var initialize = function(_bcplus) {
		bcplus = _bcplus;
		ignoredUserIDs = bcplus.getStorage().getValue('ignoredUserIDs', []);
		
		addStyles();
		buildUI();
		// addEventListeners();
	};
	
	var addStyles = function() {
		$ignoreStyleNode = $('<style type="text/css"></style>').appendTo('head');
		
		updateStyleRule();
	};
	
	var buildUI = function() {
		$ignoreDialog = $('<div id="bcplusIgnoreDialogContent">\n	<fieldset>\n		<legend>Benutzer suchen</legend>\n		\n		<dl class="marginTop">\n			<dt><label for="username">Benutzername</label></dt>\n			<dd>\n				<span>\n					<input type="text" id="bcplusIgnoreDialogUsernameInput" name="username" class="medium" value="" autocomplete="off" />\n				</span>\n			</dd>\n		</dl>\n		<div id="bcplusIgnoreDialogUserList"></div>\n	</fieldset>\n</div>\n').appendTo('body').wcfDialog({
			autoOpen: false,
			title: 'Benutzer ignorieren',
			
			onShow: function() {
				// event.optionsOpened.fire();
			},
			
			onClose: function() {
				// event.optionsClosed.fire();
				
				$('#timsChatInput').focus();
			}
		});
		
		new WCF.Search.User('#bcplusIgnoreDialogUsernameInput', function(user) {
			console.log(user);
			this._searchInput.val('');
			
			if (ignoredUserIDs.indexOf(user.objectID) === -1) {
				ignoredUserIDs.push(user.objectID);
				ignoredUserIDs.sort(function(a, b) {
					return (a - b);
				});
				
				updateStyleRule();
				bcplus.getStorage().setValue('ignoredUserIDs', ignoredUserIDs);
			}
		}, false, [WCF.User.username], false);
		
		$ignoreButton = $('<li><a id="bcplusIgnoreOptions" class="button jsTooltip" title="Benutzer ignorieren"><span class="icon icon16 icon-ban-circle"></span><span class="invisible">Benutzer ignorieren</span></a></li>');
		$ignoreButton.find('a').on('click', function() {
			$ignoreDialog.wcfDialog('open');
		});
		$ignoreButton.insertBefore($('#timsChatClear').closest('li'));
	};
	
	var updateStyleRule = function() {
		var ignoredUserClasses = [];
		
		if (ignoredUserIDs.length < 1) {
			$ignoreStyleNode.text('');
			return;
		}
		
		ignoredUserIDs.forEach(function(userID) {
			ignoredUserClasses.push('.user' + userID.toString(10));
		});
		
		$ignoreStyleNode.text(ignoredUserClasses.join(', ') + ' { display: none !important; visibility: hidden !important; }');
	};
	
	return {
		initialize:	initialize
	};
})();
