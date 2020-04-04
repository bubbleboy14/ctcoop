var cfg = core.config.ctcoop.needs, reflections = cfg.reflections;

coop.needs = {
	gallery: function(gtype) {
		CT.db.get(gtype, function(needs) {
			CT.dom.addContent("ctmain", needs.length ? needs.map(function(n) {
				var cname = "big bordered padded margined round pointer inline-block";
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
						(n.closed || gtype == "offering") ? reflections[gtype].closed : CT.dom.button("i'll do it", function() {
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
			}) : "no " + gtype + "s :'(");
		});
	},
	form: function(ftype) {
		var fieldz = {}, f, data = {};
		fieldz.description = CT.dom.smartField({
			isTA: true,
			classname: "w1",
			blurs: reflections[ftype].description
		});
		var mod = CT.modal.modal([
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
			}),
			reflections[ftype].prompt,
			CT.dom.div([
				"Description",
				fieldz.description
			], "bordered padded margined round"),
			CT.dom.button("submit", function() {
				for (f in fieldz)
					data[f] = fieldz[f].fieldValue();
				if (!data.description)
					return alert(reflections[ftype].please);
				if (!data.phone && !data.email)
					return alert(cfg.prompts.phone_or_email);
				CT.net.post({
					path: "/_coop",
					params: {
						action: ftype,
						data: data
					},
					cb: function() {
						alert(reflections[ftype].follow);
						mod.hide();
					}
				});
			})
		]);
	}
};