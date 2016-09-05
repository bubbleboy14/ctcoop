CT.require("CT.all");
CT.require("core");
CT.require("user.core");

CT.onload(function() {
	CT.initCore();
	CT.dom.setContent("ctmain", core.config.ctcoop.about);
});