CT.require("CT.all");
CT.require("core");
CT.require("user.core");
CT.require("edit.core");

CT.onload(function() {
	CT.initCore();
	user.core.results(core.config.ctcoop.members);
	edit.core.override();
});