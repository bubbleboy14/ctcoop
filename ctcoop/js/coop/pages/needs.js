CT.require("CT.all");
CT.require("core");
CT.require("user.core");
CT.require("coop.needs");

CT.onload(function() {
	CT.initCore();
	coop.needs.init("need");
});