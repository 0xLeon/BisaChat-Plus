Modules.Ignore = (function() {
	var bcplus = null;
	var ignoredUserIDs = null;
	var cachedUserProfiles = null;
	
	var $ignoreButton = null;
	var $ignoreDialog = null;
	var $ignoreStyleNode = null;
	
	var tooltip = null;
	
	var initialize = function(_bcplus) {
		bcplus = _bcplus;
		ignoredUserIDs = bcplus.getStorage().getValue('ignoredUserIDs', []);
		cachedUserProfiles = [];
		
		tooltip = new WCF.Effect.BalloonTooltip();
		tooltip.init();
		
		addStyles();
		buildUI();
		// addEventListeners();
	};
	
	var addStyles = function() {
		bcplus.addStyle('#bcplusIgnoreDialogUserList .framedIconList li { display: inline-block; position: relative; }');
		bcplus.addStyle('#bcplusIgnoreDialogUserList .framedIconList a { display: inline-block; }');
		bcplus.addStyle('#bcplusIgnoreDialogUserList .framedIconList .bcplus-userUnignoreButton { display: none; position: absolute; z-index: 400; top: 8px; left: 8px; cursor: pointer; opacity: 0.75; transition: opacity 0.2s; }');
		bcplus.addStyle('#bcplusIgnoreDialogUserList .framedIconList a:hover + .bcplus-userUnignoreButton { display: inline-block; }');
		bcplus.addStyle('#bcplusIgnoreDialogUserList .framedIconList .bcplus-userUnignoreButton:hover { display: inline-block; opacity: 1.0; }');
		bcplus.addStyle('#bcplusIgnoreDialogUserList .framedIconList .userAvatarImage { width: 48px; height: 48px; }');
		$ignoreStyleNode = bcplus.addStyle('');
		
		updateStyleRule();
	};
	
	var buildUI = function() {
		$ignoreDialog = $('<div id="bcplusIgnoreDialogContent">\n	<fieldset>\n		<legend>Benutzer suchen</legend>\n		\n		<dl class="marginTop">\n			<dt><label for="username">Benutzername</label></dt>\n			<dd>\n				<span>\n					<input type="text" id="bcplusIgnoreDialogUsernameInput" name="username" class="medium" value="" autocomplete="off" />\n				</span>\n			</dd>\n		</dl>\n	</fieldset>\n	<fieldset>\n		<legend>Ignorierte Benutzer</legend>\n		<div id="bcplusIgnoreDialogUserList"></div>\n	</fieldset>\n</div>\n').appendTo('body').wcfDialog({
			autoOpen: false,
			title: 'Benutzer ignorieren',
			
			onShow: function() {
				// event.optionsOpened.fire();
				
				WCF.LoadingOverlayHandler.show();
				
				buildUserList();
			
				WCF.LoadingOverlayHandler.hide();
			},
			
			onClose: function() {
				// event.optionsClosed.fire();
				
				$('#timsChatInput').focus();
			}
		});
		
		new WCF.Search.User('#bcplusIgnoreDialogUsernameInput', function(user) {
			this._searchInput.val('');
			
			if (ignoredUserIDs.indexOf(user.objectID) === -1) {
				ignoredUserIDs.push(user.objectID);
				ignoredUserIDs.sort(function(a, b) {
					return (a - b);
				});
				
				bcplus.getStorage().setValue('ignoredUserIDs', ignoredUserIDs);
				
				WCF.LoadingOverlayHandler.show();
				updateStyleRule();
				buildUserList();
				WCF.LoadingOverlayHandler.hide();
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
	
	var buildUserList = function() {
		var $userList = $ignoreDialog.find('#bcplusIgnoreDialogUserList');
		var $iconList = $('<ul class="framedIconList" />');
		
		if ($userList.children().length > 0) {
			$userList.empty();
		}
		
		if (ignoredUserIDs.length === 0) {
			$('<p>Keine ignorierten Benutzer</p>').appendTo($userList);
			return;
		}
		
		ignoredUserIDs.forEach(function(userID) {
			console.log(userID);
			
			var $userData = null;
			
			if (!!cachedUserProfiles[userID]) {
				$userData = $(cachedUserProfiles[userID]);
			}
			else {
				(new WCF.Action.Proxy({
					showLoadingOverlay: false,
					async: false,
					data: {
						actionName: 'getUserProfile',
						className: 'wcf\\data\\user\\UserProfileAction',
						objectIDs: [userID]
					},
					success: function(data, textStatus, jqXHR) {
						cachedUserProfiles[userID] = data.returnValues.template;
						$userData = $(cachedUserProfiles[userID]);
					}
				})).sendRequest();
			}
			
			var $userIcon = $('<li><a class="framed jsTooltip" href="#" title="" target="_blank"><img class="userAvatarImage" src="#" srcset="" alt="" /></a><span class="bcplus-userUnignoreButton icon icon32 icon-remove jsTooltip" title="Benutzer nicht mehr ignorieren"></span></li>');
			var avatarPath = $userData.find('.userAvatarImage').attr('src').replace(/(^.*\/\d+-.*?)(?:-\d+)?(\..*$)/, '$1$2');
			
			$userIcon.children('a').attr({
				href: $userData.children('a').attr('href'),
				title: $userData.children('a').attr('title')
			});
			$userIcon.find('img').attr({
				src: avatarPath,
				srcset: avatarPath + ' 2x'
			});
			$userIcon.children('.bcplus-userUnignoreButton').on('click', function(event) {
				event.preventDefault();
				event.stopPropagation();
				
				var i = ignoredUserIDs.indexOf($(this).data('userID'));
				
				if (i > -1) {
					ignoredUserIDs.splice(i, 1);
					bcplus.getStorage().setValue('ignoredUserIDs', ignoredUserIDs);
					
					updateStyleRule();
				}
				
				if (ignoredUserIDs.length > 0) {
					$(this).closest('li').remove();
				}
				else {
					$(this).closest('ul').remove();
					$('<p>Keine ignorierten Benutzer</p>').appendTo($ignoreDialog.find('#bcplusIgnoreDialogUserList'));
				}
			});
			$userIcon.children('.bcplus-userUnignoreButton').data({
				userID: userID
			});
			
			$userIcon.appendTo($iconList);
			tooltip._initTooltip(0, $userIcon.children('a'));
			tooltip._initTooltip(0, $userIcon.children('.bcplus-userUnignoreButton'));
		});
		
		$iconList.appendTo($userList);
	};
	
	return {
		initialize:	initialize
	};
})();
