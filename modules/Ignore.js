Modules.Ignore = (function() {
	let bcplus = null;
	let ignoredUserIDs = null;
	
	let $ignoreButton = null;
	let $ignoreDialog = null;
	let $ignoreStyleNode = null;
	
	let initialize = function(_bcplus) {
		bcplus = _bcplus;
		ignoredUserIDs = bcplus.getStorage().getValue('ignoredUserIDs', []);
		
		addStyles();
		buildUI();
		addEventListeners();
	};
	
	let addStyles = function() {
		bcplus.addStyle('#bcplusIgnoreDialogUserList .framedIconList li { display: inline-block; position: relative; }');
		bcplus.addStyle('#bcplusIgnoreDialogUserList .framedIconList a { display: inline-block; }');
		bcplus.addStyle('#bcplusIgnoreDialogUserList .framedIconList .bcplus-userUnignoreButton { display: none; position: absolute; z-index: 400; top: 8px; left: 8px; cursor: pointer; opacity: 0.75; transition: opacity 0.2s; }');
		bcplus.addStyle('#bcplusIgnoreDialogUserList .framedIconList a:hover + .bcplus-userUnignoreButton { display: inline-block; }');
		bcplus.addStyle('#bcplusIgnoreDialogUserList .framedIconList .bcplus-userUnignoreButton:hover { display: inline-block; opacity: 1.0; }');
		bcplus.addStyle('#bcplusIgnoreDialogUserList .framedIconList .userAvatarImage { width: 48px; height: 48px; }');
		$ignoreStyleNode = bcplus.addStyle('');
		
		updateStyleRule();
	};
	
	let buildUI = function() {
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
			
			if (-1 === ignoredUserIDs.indexOf(user.objectID)) {
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
		
		WCF.DOMNodeInsertedHandler.execute();
	};
	
	let addEventListeners = function() {
		bcplus.addExternalCommand(['doignore', 'di'], function(message) {
			if (bcplus.messageType.WHISPER !== message.type) {
				return;
			}
			
			let answer = '/f ' + message.username + ', @\'' + WCF.User.username + '\' ignoriert dich';
			
			if (-1 === ignoredUserIDs.indexOf(message.sender)) {
				answer += ' nicht';
			}
			
			return answer;
		}, false);
	};
	
	let updateStyleRule = function() {
		let ignoredUserClasses = [];
		
		if (ignoredUserIDs.length < 1) {
			$ignoreStyleNode.text('');
			return;
		}
		
		ignoredUserIDs.forEach(function(userID) {
			ignoredUserClasses.push('.timsChatMessage.user' + userID.toString(10) + ':not(.timsChatMessage5):not(.timsChatMessage8):not(.timsChatMessage10):not(.timsChatMessage11):not(.timsChatMessage12)');
		});
		
		$ignoreStyleNode.text(ignoredUserClasses.join(', ') + ' { display: none !important; visibility: hidden !important; }');
		
		bcplus.handleStreamScroll();
	};
	
	let buildUserList = function() {
		let $userList = $ignoreDialog.find('#bcplusIgnoreDialogUserList');
		let $iconList = $('<ul class="framedIconList" />');
		
		if ($userList.children().length > 0) {
			$userList.empty();
		}
		
		if (0 === ignoredUserIDs.length) {
			$('<p>Keine ignorierten Benutzer</p>').appendTo($userList);
			return;
		}
		
		Util.UserCache.getUsers(ignoredUserIDs).then(
			function(users) {
				for (let userID in users) {
					let user = users[userID];
					let $userIcon = $('<li><a class="framed jsTooltip" href="#" title="" target="_blank"><img class="userAvatarImage" src="#" srcset="" alt="" /></a><span class="bcplus-userUnignoreButton icon icon32 icon-remove jsTooltip" title="Benutzer nicht mehr ignorieren"></span></li>');
					
					$userIcon.children('a').attr({
						href: user.profile,
						title: user.username
					});
					$userIcon.find('img').attr({
						src: user.avatar,
						srcset: user.avatar + ' 2x'
					});
					$userIcon.children('.bcplus-userUnignoreButton').data({
						userID: userID
					}).on('click', eventHandlerRemoveIgnoredUser);
					
					$userIcon.appendTo($iconList);
				}
				
				$iconList.appendTo($userList);
				WCF.DOMNodeInsertedHandler.execute();
			},
			function(e) {
				console.error(e);
			}
		);
	};
	
	let eventHandlerRemoveIgnoredUser = function(event) {
		event.preventDefault();
		event.stopPropagation();
		
		let i = ignoredUserIDs.indexOf(parseInt($(this).data('userID'), 10));
		
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
	};
	
	return {
		initialize:	initialize
	};
})();
