CT.require("CT.all");
CT.require("core");
CT.require("user.core");
CT.require("coop.needs");

var cfg = core.config.ctcoop.offerings;
var doit = function() {
	CT.dom.setContent("ctmain", CT.dom.button("want to offer something else?", function() {
		coop.needs.form("offering");
	}, "abs ctr"));
	coop.needs.gallery("need");
};

CT.onload(function() {
	CT.initCore();
	cfg.passord ? CT.modal.prompt({
		style: "password",
		prompt: "password?",
		cb: function(pw) {
			if (pw != cfg.password)
				location = "/";
			else 
				doit();
		}
	}) : doit();
});