CT.require("CT.all");
CT.require("core");
CT.require("user.core");

CT.onload(function() {
	var cfg = core.config.ctcoop.about;
	CT.initCore();
	user.core.all(function(users) {
		var slider, content = [ CT.dom.node(cfg.header, "div", "biggest pv10") ];
		if (cfg.slider) {
			slider = CT.dom.node(null, "div", "abs ctr top50 w2-3 h250p");
			content = content.concat([
				slider,
				CT.dom.node(cfg.blurb, "div", "w3-10 h250p justified scrolly")
			]);
		} else
			content.push(cfg.blurb);
		content = content.concat([
			CT.dom.node(cfg.members.header, "div", "bigger pv10"),
			users.map(function(u) {
				return CT.dom.node(CT.dom.node([
					CT.dom.node(u.name, "div", "big"),
					CT.dom.img(u.img, "right w1-3 ph10"),
					u.blurb,
				], "div", "h300p margined padded round bordered justified"),
					"div", "w1-3 vtop inline-block");
			})
		]);
		CT.dom.setContent("ctmain", CT.dom.node(content, "div", "abs all10"));
		if (slider) {
			(new CT.slider.Slider({
				parent: slider,
				frames: cfg.slider,
				navButtons: false
			})).show();
		}
	}, cfg.members.model, cfg.members.filters);
});