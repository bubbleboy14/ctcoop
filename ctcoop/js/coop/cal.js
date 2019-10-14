coop.cal = {
	edit: function(data, cb) {
		CT.net.post({
			path: "/_db",
			params: {
				data: data,
				action: "edit",
				pw: core.config.keys.storage
			},
			cb: cb
		});
	}
};

coop.cal.Cal = CT.Class({
	CLASSNAME: "coop.cal.Cal",
	_: {
		reschedule: function(slot, schedule, which) {
			var fname = which || "slot";
			this.cal["un" + fname](slot);
			slot.schedule = schedule;
			this.cal[fname](slot);
			this.cal.orient();
		},
		task: function(cb, mode) {
			var oz = this.opts, tdata;
			CT.modal.prompt({
				prompt: "what is this task called?",
				cb: function(tname) {
					CT.modal.prompt({
						isTA: true,
						prompt: "please describe this task",
						cb: function(tdesc) {
							tdata = {
								modelName: "task",
								name: tname,
								description: tdesc,
								editors: [ user.core.get("key") ]
							};
							if (mode)
								tdata.mode = mode;
							coop.cal.edit(tdata, function(task) {
								CT.data.add(task);
								oz.ontask && oz.ontask(task);
								cb(task);
							});
						}
					});
				}
			});
		}
	},
	click: {
		once: function(date, month, year) {
			var tslot = this.timeslot;
			this.task(function(task) {
				tslot(task, "once", new Date(year, month, date));
			});
		},
		weekly: function(day, dayindex) {
			var tslot = this.timeslot, d = new Date();
			d.setDate(d.getDate() + dayindex - d.getDay());
			this.task(function(task) {
				tslot(task, "weekly", d);
			});
		},
		daily: function() {
			var tslot = this.timeslot;
			this.task(function(task) {
				tslot(task, "daily");
			});
		},
		task: function(slot, date, slots) {
			var thaz = this, schedz = slots.map(function(s) {
				return s.schedule;
			}), vbutt = function(schedule) {
				if (schedz.includes(schedule))
					return CT.dom.button(schedule + " -- unvolunteer",
						thaz.unvolunteer(schedule, slot, date, slots));
				return CT.dom.button(schedule,
					thaz.volunteer(schedule, slot, date, slots));
			}, buttz = [ vbutt("once") ];
			if (slot.schedule == "daily")
				buttz.push(vbutt("daily"));
			if (slot.schedule != "once")
				buttz.push(vbutt("weekly"));
			return CT.dom.div(buttz, "centered");
		},
		exception: function(slot, date, uslots) {
			var slotter = this.slot, ez = uslots.filter(function(s) {
				return s.schedule == "exception";
			}), eslot = function(etype) {
				return function() {
					date.setHours(slot.when.getHours());
					date.setMinutes(slot.when.getMinutes());
					slotter(slot.task, etype, date, slot.when.duration);
				};
			}, bs = "create exception for ", ebz = [
				CT.dom.button(bs + date.toDateString(),
					eslot("exception"), "w1 block")
			], eline = function(ex) {

				// TODO: move this to task editor....

				return CT.dom.div([
					CT.dom.button("remove exception", function() {

					}, "right"),
					ex.when.toDateString()
				], "bordered padded margined round");


			}, ds = bs + CT.cal.days[date.getDay()] + "s", ebuttz = function() {
				if (slot.schedule == "daily") {
					ebz.push(CT.dom.button(ds, eslot("offday"), "w1 block"));
				}
				return ebz;
			};
			return [
				CT.dom.div("Exceptions", "big"),
				ez.length ? ez.map(eline) : ebuttz()
			];
		},
		edit: function(slot, date, slots) {
			var _ = this._, cal = this.cal, refresh = function() {
				mod.hide();
				cal.orient();
			}, task = slot.task, when = slot.when, eobj = {
				key: task.key
			}, tshow = CT.dom.div(slot.duration), upvals = function(key, arr) {
				task[key] = eobj[key] = arr;
				coop.cal.edit(eobj);
			}, content = [
				CT.dom.div("Edit: " + task.name, "bigger centered"),
				CT.dom.smartField({
					classname: "w1",
					value: task.name,
					cb: function(val) {
						task.name = val;
						coop.cal.edit({
							key: task.key,
							name: task.name
						}, refresh);
					}
				}),
				CT.dom.smartField({
					isTA: true,
					classname: "w1",
					value: task.description,
					cb: function(val) {
						task.description = val;
						coop.cal.edit({
							key: task.key,
							description: task.description
						}, refresh);
					}
				}),
				CT.dom.div([
					"what time?",
					CT.dom.timeSelector(null,
						when.toTimeString().slice(0, 5), function(time) {
							var hours, minutes;
							[hours, minutes] = time.split(":");
							when.setHours(hours);
							when.setMinutes(minutes);
							coop.cal.edit({
								key: slot.key,
								when: CT.parse.date2string(when, true)
							}, refresh);
						})
				], "centered"),
				CT.dom.div([
					"how many hours?",
					tshow,
					CT.dom.range(function(val) {
						CT.dom.setContent(tshow, val);
					}, 0.25, 5, slot.duration, 0.25, null, null, function(val) {
						slot.duration = val;
						coop.cal.edit({
							key: slot.key,
							duration: val
						}, refresh)
					})
				], "centered"),
				CT.dom.div([
					"what kind of schedule?",
					CT.dom.select({
						names: ["once", "weekly", "daily"],
						curvalue: slot.schedule,
						onchange: function(val) {
							coop.cal.edit({
								key: slot.key,
								schedule: val
							}, function() {
								_.reschedule(slot, val);
								mod.hide();
							})
						}
					})
				], "centered")
			], stepper = CT.dom.fieldList({
				bottomadd: true,
				vals: task.steps,
				onchange: function(vals) {
					upvals("steps", vals);
				}
			}), requirer = CT.dom.fieldList({
				vals: task.requirements,
				onchange: function(vals) {
					upvals("requirements", vals);
				}
			}), mod;
			this.opts.mode && content.push(CT.dom.div([
				"what compensation mode?",
				CT.dom.select({
					names: this.opts.mode.choices,
					curvalue: task.mode,
					onchange: function(val) {
						task.mode = val;
						coop.cal.edit({
							key: task.key,
							mode: val
						}, mod.hide);
					}
				})
			], "centered"));
			mod = CT.modal.modal(content.concat([
				CT.dom.div([
					"what are the steps?",
					stepper, stepper.empty, stepper.addButton
				], "centered"),
				CT.dom.div([
					"what are the requirements?",
					requirer.empty, requirer.addButton, requirer
				], "centered")
			]));
		},
		help: function() {
			var steps = this.opts.nonew ? [] : [
				"Click the 'daily task' button to create a new daily task",
				"Click a day name to set up a weekly task.",
				"Click a date to set up a non-recurring task."
			];
			steps.push("Click a task to edit or volunteer.");
			CT.modal.modal([
				CT.dom.div("How does this work?", "biggest centered"),
				CT.dom.div(steps, "subpadded")
			]);
		}
	},
	commit: function(schedule, slot, date, commitment) {
		date.setHours(slot.when.getHours());
		date.setMinutes(slot.when.getMinutes());
		this.slot(commitment, schedule, date, slot.duration, slot.task);
	},
	unvolunteer: function(schedule, slot, date, cslots) {
		var thaz = this;
		return function() {



		};
	},
	volunteer: function(schedule, slot, date, cslots) {
		var thaz = this, _ = this._;
		return function() {
			if (cslots && cslots.length) {
				slot = cslots[0]; // hm...
				return coop.cal.edit({
					key: slot.key,
					schedule: schedule
				}, function() {
					_.reschedule(slot, schedule, "commit");
				});
			}
			var u = user.core.get(),
				commitment = thaz.cal.stewardship(u, slot.task);
			if (commitment)
				return thaz.commit(schedule, slot, date, commitment);
			coop.cal.edit({
				modelName: "stewardship",
				steward: u.key
			}, function(commitment) {
				commitment.steward = u;
				slot.task.commitments.push(commitment);
				coop.cal.edit({
					key: slot.task.key,
					commitments: slot.task.commitments.map(function(c) {
						return c.key;
					})
				}, function() {
					thaz.commit(schedule, slot, date, commitment);
				});
			});
		};
	},
	slot: function(slotter, schedule, when, duration, task) {
		var cal = this.cal;
		coop.cal.edit({
			modelName: "timeslot",
			duration: duration,
			schedule: schedule,
			when: CT.parse.date2string(when, true)
		}, function(slot) {
			CT.data.add(slot);
			slotter.timeslots.push(slot);
			coop.cal.edit({
				key: slotter.key,
				timeslots: slotter.timeslots.map(function(ts) {
					return ts.key;
				})
			}, function() {
				cal[task ? "commitment" : "appointment"](slotter, task);
				cal.orient();
			});
		});
	},
	timeslot: function(task, schedule, when) {
		var hours, minutes, slot = this.slot;
		CT.modal.prompt({
			prompt: "what time does it start?",
			style: "time",
			cb: function(time) {
				[hours, minutes] = time.split(":");
				when = when || new Date();
				when.setHours(hours);
				when.setMinutes(minutes);
				CT.modal.prompt({
					prompt: "how many hours does it last?",
					style: "number",
					cb: function(duration) {
						slot(task, schedule, when, duration);
					}
				});
			}
		});
	},
	task: function(cb) {
		var task = this._.task;
		if (!this.opts.mode)
			return task(cb);
		CT.modal.choice({
			prompt: this.opts.mode.prompt || "select a mode",
			data: this.opts.mode.choices,
			cb: function(mode) {
				task(cb, mode);
			}
		});
	},
	build: function() {
		var cz = {
			edit: this.click.edit,
			appointment: this.click.task,
			exception: this.click.exception
		}, content = [
			CT.dom.button("help", this.click.help, "right")
		];
		if (!this.opts.nonew) {
			cz.date = this.click.once;
			cz.day = this.click.weekly;
			content.push(CT.dom.button("daily task",
				this.click.daily, "left"));
		}
		this.cal = new CT.cal.Cal({
			appointments: this.tasks,
			click: cz
		});
		content.push(this.cal.node);
		CT.dom.setContent(this.opts.parent, content);
	},
	load: function() {
		var thiz = this, oz = this.opts, doit = function(tasks) {
			thiz.tasks = tasks;
			thiz.build();
		};
		if (oz.gettasks)
			oz.gettasks(doit);
		else
			oz.tasks ? CT.db.multi(oz.tasks, doit) :
				CT.db.get("task", doit, null, null, null, oz.filters);
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			parent: "ctmain"
		});
		this.load();
	}
});