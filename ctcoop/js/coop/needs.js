coop.needs = {
	button: function(n, cb) {
		var cfg = core.config.ctcoop.needs, u = user.core.get(),
			gtype = n.modelName, reflections = cfg.reflections[gtype];
		if (n.closed) return reflections.closed;
		var doit = function(params) {
			CT.net.post({
				path: "/_coop",
				params: params,
				cb: cb
			});
		}, params = {
			action: "do",
			need: n.key
		};
		if (u && u.key == n.member) {
			return CT.dom.button("close " + gtype, function() {
				n.ongoing = false;
				doit(CT.merge(params, {
					member: u.key
				}));
			});
		}
		return CT.dom.button(reflections.doit, function() {
			u ? doit(CT.merge(params, {
				reminder: "member",
				member: u.key
			})) : CT.modal.choice({
				prompt: cfg.prompts.save + " supported sms carriers: " + cfg.carriers.join(", "),
				data: ["text message", "email", "i'll write it down myself"],
				cb: function(reminder) {
					params.reminder = reminder;
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
		});
	},
	appender: function(pnode) {
		return function(item) {
			var gal = CT.dom.className("cgal", pnode)[0],
				inode = coop.needs.item(item);
			if (gal)
				gal.appendChild(inode);
			else
				CT.dom.setContent(pnode, CT.dom.div([inode], "cgal"));
		};
	},
	item: function(n) {
		var cname = "big bordered padded margined round pointer inline-block";
		if (n.closed)
			cname += " closed";
		var dnode = CT.dom.div(n.description, cname);
		dnode.onclick = function() {
			var details = [];
			core.config.ctcoop.needs.fnames.forEach(function(key) {
				if (n[key])
					details.push(key + ": " + n[key]);
			});
			details.push("ongoing: " + n.ongoing);
			var modal = CT.modal.modal([
				n.description,
				CT.dom.div(details, "pv10"),
				coop.needs.button(n, function() {
					alert("you did it! now do it.");
					n.ongoing || dnode.classList.add("closed");
					modal.hide();
				})
			]);
		};
		return dnode;
	},
	items: function(needs, gtype, pnode) {
		CT.dom.addContent(pnode, needs.length ? CT.dom.div(needs.map(function(n) {
			return coop.needs.item(n);
		}), "cgal") : CT.dom.div("no " + gtype + "s :'("));
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
				full.length ? CT.db.multi(full, function() {
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
				}) : CT.dom.addContent(pnode, "nothing yet!");
			});
		} else
			coop.needs.gallery(gtype, pnode);
	},
	form: function(ftype, onsubmit) {
		var cfg = core.config.ctcoop.needs,
			reflections = cfg.reflections[ftype],
			fieldz = {}, f, data = {},
			u = user.core.get("key"),
			ogcb = CT.dom.checkboxAndLabel("ongoing " + ftype);
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
			CT.dom.div([
				"One Time or Ongoing",
				ogcb
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
				data.ongoing = ogcb.isChecked();
				CT.net.post({
					path: "/_coop",
					params: {
						action: ftype,
						data: data
					},
					cb: function(item) {
						alert(reflections.follow);
						mod.hide();
						onsubmit && onsubmit(item);
					}
				});
			})
		]);
	},
	init: function(gtype, pnode, onsubmit) {
		var cfg = core.config.ctcoop.needs,
			refs = cfg.reflections,
			opposite = refs[gtype].reflection;
		pnode = pnode || "ctmain";
		cfg.gal.nobutts || CT.dom.setContent(pnode,
			CT.dom.button(refs[opposite].button, function() {
				coop.needs.form(opposite, onsubmit);
			}, "abs ctr")
		);
		coop.needs.galleries(gtype, pnode);
	}
};