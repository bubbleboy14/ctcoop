CT.require("CT.all");
CT.require("core");
CT.require("user.core");

CT.onload(function() {
	var cfg = core.config.ctcoop.about;
	CT.initCore();
	user.core.all(function(users) {
		var slider, content = [ CT.dom.div(cfg.header, "biggest pv10") ];
		if (cfg.slider) {
			slider = CT.dom.div(null, "abs ctl top50 w3-10 h250p");
			content = content.concat([
				CT.dom.div(cfg.blurb, "w2-3 h250p justified scrolly", "aboutblurb"),
				slider
			]);
		} else
			content.push(cfg.blurb);
		content = content.concat([
			CT.dom.div(cfg.members.header, "bigger pv10"),
			users.map(function(u) {
				return CT.dom.div(CT.dom.div([
					CT.dom.img(u.img, "right w1-3 ph10"),
					CT.dom.div(u.firstName + " " + u.lastName.charAt(0), "big"),
					u.blurb,
				], "h300p margined padded round bordered justified"),
					"w1-3 vtop inline-block");
			})
		]);
		CT.dom.setContent("ctmain", CT.dom.div(content, "abs all10"));
		if (slider) {
			(new CT.slider.Slider({
				parent: slider,
				frames: cfg.slider,
				navButtons: false,
				circular: true
			})).show();
		}
	}, cfg.members.model, cfg.members.filters);
});