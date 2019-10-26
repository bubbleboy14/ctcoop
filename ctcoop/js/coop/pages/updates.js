CT.require("CT.all");
CT.require("core");
CT.require("user.core");
CT.require("coop.Updates");

CT.onload(function() {
	CT.initCore();
	new coop.Updates(core.config.ctcoop.updates);
});