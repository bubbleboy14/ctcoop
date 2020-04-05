CT.require("CT.all");
CT.require("core");
CT.require("user.core");
CT.require("coop.needs");

var cfg = core.config.ctcoop.offerings;

CT.onload(function() {
	CT.initCore();
	cfg.password ? CT.modal.prompt({
		style: "password",
		prompt: "password?",
		cb: function(pw) {
			if (pw != cfg.password)
				location = "/";
			else 
				coop.needs.init("offering");
		}
	}) : coop.needs.init("offering");
});