coop.needs = {
	item: function(n, gtype) {
		var cfg = core.config.ctcoop.needs,
			reflections = cfg.reflections[gtype],
			cname = "big bordered padded margined round pointer inline-block";
		if (n.closed)
			cname += " closed";
		var dnode = CT.dom.div(n.description, cname);
		dnode.onclick = function() {
			var doit = function(params) {
				CT.net.post({
					path: "/_coop",
					params: params,
					cb: function() {
						alert("you did it! now do it.");
						dnode.classList.add("closed");
						modal.hide();
					}
				});
			};
			var details = [];
			["name", "email", "phone", "address"].forEach(function(key) {
				if (n[key])
					details.push(key + ": " + n[key]);
			});
			var modal = CT.modal.modal([
				n.description,
				CT.dom.div(details, "pv10"),
				n.closed ? reflections.closed : CT.dom.button(reflections.doit, function() {
					CT.modal.choice({
						prompt: cfg.prompts.save + " supported sms carriers: " + cfg.carriers.join(", "),
						data: ["text message", "email", "i'll write it down myself"],
						cb: function(reminder) {
							var params = {
								action: "do",
								need: n.key,
								reminder: reminder
							};
							if (reminder == "text message") {
								CT.modal.choice({
									prompt: cfg.prompts.carrier,
									data: cfg.carriers,
									cb: function(carrier) {
										params.carrier = carrier;
										CT.modal.prompt({
											style: "phone",
											prompt: cfg.prompts.phone,
											cb: function(number) {
												params.number = number;
												doit(params);
											}
										});
									}
								});
							} else if (reminder == "email") {
								CT.modal.prompt({
									style: "email",
									prompt: cfg.prompts.email,
									cb: function(email) {
										params.email = email;
										doit(params);
									}
								});
							} else
								doit(params);
						}
					});
				})
			]);
		};
		return dnode;
	},
	items: function(needs, gtype, pnode) {
		CT.dom.addContent(pnode, needs.length ? needs.map(function(n) {
			return coop.needs.item(n, gtype);
		}) : CT.dom.div("no " + gtype + "s :'("));
	},
	gallery: function(gtype, pnode, items) {
		var cfg = core.config.ctcoop.needs, gal = function(needs) {
			coop.needs.items(needs, gtype, pnode);
		};
		items ? gal(items) : (cfg.gal.items || CT.db.get)(gtype, gal);
	},
	galleries: function(gtype, pnode) {
		var cfg = core.config.ctcoop.needs, plur = gtype + "s";
		if (cfg.gal.sets) {
			cfg.gal.sets(gtype, function(sets) {
				var full = [];
				sets.forEach(function(gset) {
					full = full.concat(gset[plur]);
				});
				CT.db.multi(full, function() {
					sets.forEach(function(gset) {
						var items = gset[plur].map(function(ikey) {
							return CT.data.get(ikey);
						});
						if (items.length) {
							var n = CT.dom.div(CT.dom.div(gset.name, "biggest"),
								"bordered padded margined round centered");
							coop.needs.items(items, gtype, n);
							CT.dom.addContent(pnode, n);
						}
					});
				});
			});
		} else
			coop.needs.gallery(gtype, pnode);
	},
	form: function(ftype) {
		var cfg = core.config.ctcoop.needs,
			reflections = cfg.reflections[ftype],
			fieldz = {}, f, data = {},
			u = user.core.get("key");
		fieldz.description = CT.dom.smartField({
			isTA: true,
			classname: "w1",
			blurs: reflections.description
		});
		var mod = CT.modal.modal([
			!u && [
				cfg.prompts.form,
				cfg.fnames.map(function(fname) {
					fieldz[fname] = CT.dom.smartField({
						blurs: cfg.blurz[fname],
						classname: "w1"
					});
					return CT.dom.div([
						CT.parse.capitalize(fname),
						fieldz[fname]
					], "bordered padded margined round");
				})
			],
			reflections.prompt,
			CT.dom.div([
				"Description",
				fieldz.description
			], "bordered padded margined round"),
			CT.dom.button("submit", function() {
				for (f in fieldz)
					data[f] = fieldz[f].fieldValue();
				if (!data.description)
					return alert(reflections.please);
				if (u)
					data.member = u;
				else if (!data.phone && !data.email)
					return alert(cfg.prompts.phone_or_email);
				CT.net.post({
					path: "/_coop",
					params: {
						action: ftype,
						data: data
					},
					cb: function() {
						alert(reflections.follow);
						mod.hide();
					}
				});
			})
		]);
	},
	init: function(gtype, pnode) {
		var cfg = core.config.ctcoop.needs,
			refs = cfg.reflections[gtype],
			opposite = refs.reflection;
		pnode = pnode || "ctmain";
		cfg.gal.nobutts || CT.dom.setContent(pnode,
			CT.dom.button(refs.button, function() {
				coop.needs.form(opposite);
			}, "abs ctr")
		);
		coop.needs.galleries(gtype, pnode);
	}
};