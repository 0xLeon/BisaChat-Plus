Modules.TextFragments = (function() {
	let bcplus = null;
	
	let fragments = null;
	let fragmentKeys = null;
	let fragmentKeysRegex = null;
	
	let $fragmentButton = null;
	let $fragmentDialog = null;
	
	let initialize = function(_bcplus) {
		bcplus = _bcplus;
		
		loadData();
		addStyles();
		buildUI();
		addEventListeners();
	};
	
	let loadData = function() {
		fragments = bcplus.getStorage().getValue('textFragments', {
			':shrug:': '¯\\_(ツ)_/¯'
		});
		fragmentKeys = Object.keys(fragments);
		fragmentKeysRegex = new RegExp(fragmentKeys.map(function(fragmentKey) {
			return RegExp.escape(fragmentKey);
		}).join('|'), 'gi');
	};
	
	let addStyles = function() {
		bcplus.addStyle('#bcplusFragmentsDialogFragmentList dd { position: relative; }');
		bcplus.addStyle('#bcplusFragmentsDialogFragmentList .buttonGroupNavigation { position: absolute; top: 4px; right: 10px; }');
		bcplus.addStyle('#bcplusFragmentsDialogFragmentList .buttonGroupNavigation > ul > li { float: left; opacity: 0; transition: opacity 0.1s linear; }');
		bcplus.addStyle('#bcplusFragmentsDialogFragmentList .buttonGroupNavigation > ul > li > a { padding: 4px; }');
		bcplus.addStyle('#bcplusFragmentsDialogFragmentList dd:hover > .buttonGroupNavigation > ul > li { opacity: 1; }');
	};
	
	let buildUI = function() {
		$fragmentDialog = $('<div id="bcplusFragmentsDialogContent">\n	<fieldset>\n		<legend>Textfragmente bearbeiten</legend>\n		\n		<dl class="marginTop">\n			<dt><label for="bcplusFragmentsDialogFragmentKeyInput">Fragmentbezeichner</label></dt>\n			<dd>\n				<span>\n					<input type="text" id="bcplusFragmentsDialogFragmentKeyInput" name="bcplusFragmentsDialogFragmentKeyInput" class="medium" value="" autocomplete="off" />\n				</span>\n			</dd>\n			\n			<dt><label for="bcplusFragmentsDialogFragmentContentInput">Fragmentinhalt</label></dt>\n			<dd>\n				<span>\n					<input type="text" id="bcplusFragmentsDialogFragmentContentInput" name="bcplusFragmentsDialogFragmentContentInput" class="medium" value="" autocomplete="off" />\n				</span>\n			</dd>\n		</dl>\n	</fieldset>\n	<div class="formSubmit">\n		<button class="buttonPrimary" data-type="save">Speichern</button>\n	</div>\n	<fieldset>\n		<legend>Textfragmente</legend>\n		<div id="bcplusFragmentsDialogFragmentList"></div>\n	</fieldset>\n</div>').appendTo('body').wcfDialog({
			autoOpen: false,
			title: 'Textfragmente bearbeiten',
			
			onShow: function() {
				buildFragmentsList();
			},
			
			onClose: function() {
				$('#timsChatInput').focus();
			}
		});
		$fragmentDialog.find('.formSubmit > button[data-type="save"]').on('click', function(event) {
			let fragmentKey = $('#bcplusFragmentsDialogFragmentKeyInput').val();
			let fragmentContent = $('#bcplusFragmentsDialogFragmentContentInput').val();
			
			if ('' === fragmentKey) {
				Window.alert('Der Fragmentbezeichner darf nicht leer sein!');
				return;
			}
			
			if ('' === fragmentContent) {
				Window.alert('Der Fragmentinhalt darf nicht leer sein!');
				return;
			}
			
			addFragment(fragmentKey, fragmentContent, true);
			buildFragmentsList();
		});
		
		$fragmentButton = $('<li><a id="bcplusFragmentsOptions" class="button jsTooltip" title="Textfragmente bearbeiten"><span class="icon icon16 icon-font"></span><span class="invisible">Textfragmente bearbeiten</span></a></li>')
		$fragmentButton.find('a').on('click', function() {
			$fragmentDialog.wcfDialog('open');
		});
		$fragmentButton.insertBefore($('#timsChatClear').closest('li'));
		
		WCF.DOMNodeInsertedHandler.execute();
	};
	
	let addEventListeners = function() {
		bcplus.addEventListener('messageSubmit', function(message) {
			message.messageText = message.messageText.replace(fragmentKeysRegex, function(match) {
				return fragments[match];
			});
		});
	};
	
	let buildFragmentsList = function() {
		let $fragmentListContainer = $fragmentDialog.find('#bcplusFragmentsDialogFragmentList');
		let $fragmentList = $('<dl />');
		
		if ($fragmentListContainer.children().length > 0) {
			$fragmentListContainer.empty();
		}
		
		checkFragmentListEmpty();
		
		fragmentKeys.forEach(function(fragmentKey) {
			let $fragmentNav = $('<nav class="jsMobileNavigation buttonGroupNavigation">\n	<ul class="bcplusFragmentsDialogFragmentOptions">\n		<li class="bcplusFragmentsDialogEditButton">\n			<a class="jsTooltip" href="#" title="Bearbeiten">\n				<span class="icon icon16 icon-pencil"></span>\n				<span class="invisible">Bearbeiten</span>\n			</a>\n		</li>\n		<li class="bcplusFragmentsDialogDeleteButton">\n			<a class="jsTooltip" href="#" title="Löschen">\n				<span class="icon icon16 icon-remove"></span>\n				<span class="invisible">Löschen</span>\n			</a>\n		</li>\n	</ul>\n</nav>');
			
			$fragmentNav.find('.bcplusFragmentsDialogEditButton a').on('click', function(event) {
				event.preventDefault();
				event.stopPropagation();
				
				$('#bcplusFragmentsDialogFragmentKeyInput').val($(this).closest('dt, dd').data('fragmentKey'));
				$('#bcplusFragmentsDialogFragmentContentInput').val(fragments[$(this).closest('dt, dd').data('fragmentKey')]);
			});
			
			$fragmentNav.find('.bcplusFragmentsDialogDeleteButton a').on('click', function(event) {
				event.preventDefault();
				event.stopPropagation();
				
				removeFragment($(this).closest('dt, dd').data('fragmentKey'));
				
				$(this).closest('dd').prev('dt').first().remove();
				$(this).closest('dd').remove();
				
				checkFragmentListEmpty();
			});
			
			$('<dt />').data({
				fragmentKey: fragmentKey
			}).text(fragmentKey).appendTo($fragmentList);
			$('<dd />').data({
				fragmentKey: fragmentKey
			}).text(fragments[fragmentKey]).append($fragmentNav).appendTo($fragmentList);
		});
		
		$fragmentList.appendTo($fragmentListContainer);
		
		WCF.DOMNodeInsertedHandler.execute();
	};
	
	let checkFragmentListEmpty = function() {
		if (0 === fragmentKeys.length) {
			$('<p>Keine Textfragmente vorhanden</p>').appendTo($fragmentDialog.find('#bcplusFragmentsDialogFragmentList'));
		}
	};
	
	let addFragment = function(fragmentKey, fragment, overwrite) {
		if (typeof(fragmentKey) !== 'string') {
			// TODO: error
		}
		
		if (typeof(fragment) !== 'string') {
			// TODO: error
		}
		
		fragmentKey = fragmentKey.toLowerCase();
		
		if (fragmentKeys.indexOf(fragmentKey) > -1) {
			// TODO: error
		}
		
		// TODO: character check
		
		fragments[fragmentKey] = fragment;
		bcplus.getStorage().setValue('textFragments', fragments);
		fragmentKeys = Object.keys(fragments);
		fragmentKeysRegex = new RegExp(fragmentKeys.map(function(fragmentKey) {
			return RegExp.escape(fragmentKey);
		}).join('|'), 'gi');
	};
	
	let removeFragment = function(fragmentKey) {
		if (typeof(fragmentKey) !== 'string') {
			// TODO: error
		}
		
		fragmentKey = fragmentKey.toLowerCase();
		
		if (fragmentKeys.indexOf(fragmentKey) === -1) {
			// TODO: error
		}
		
		delete fragments[fragmentKey];
		bcplus.getStorage().setValue('textFragments', fragments);
		fragmentKeys = Object.keys(fragments);
		fragmentKeysRegex = new RegExp(fragmentKeys.map(function(fragmentKey) {
			return RegExp.escape(fragmentKey);
		}).join('|'), 'gi');
	};
	
	return {
		initialize:	initialize,
		addFragment:	addFragment,
		removeFragment:	removeFragment
	};
})();
