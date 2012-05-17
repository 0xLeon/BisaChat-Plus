/* 
 * UpdateUI Module
 * Copyright (C) 2011-2012 Stefan Hahn
 */
Modules.AddOn.UpdateUI = new ClassSystem.Class(Modules.Util.AbstractModule, {
	registerOptions: function() {
		this.callerObj.registerBoolOption('getNonStableReleases', 'Updatesuche nach Entwicklerversionen', 'Unstable-Updates einschließen', 'u', false);
	}
});
