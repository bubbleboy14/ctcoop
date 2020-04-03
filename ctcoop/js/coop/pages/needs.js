CT.require("CT.all");
CT.require("core");
CT.require("user.core");
CT.require("coop.needs");

CT.onload(function() {
	CT.initCore();
	CT.dom.setContent("ctmain", CT.dom.button("need something else?", function() {
		coop.needs.form("need");
	}, "abs ctr"));
	coop.needs.gallery("offering");
});