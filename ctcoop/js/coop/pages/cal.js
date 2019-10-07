CT.require("CT.all");
CT.require("core");
CT.require("user.core");
CT.require("coop.cal");

CT.onload(function() {
	CT.initCore();
	new coop.cal.Cal();
});