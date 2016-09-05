CT.require("CT.all");
CT.require("core");
CT.require("user.core");

CT.onload(function() {
	CT.initCore();
	user.core.results(core.config.ctcoop.members);
});