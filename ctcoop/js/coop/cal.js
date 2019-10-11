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
			return CT.dom.div([
				CT.dom.div("Volunteer", "big"),
				buttz
			], "centered");
		},
		edit: function(slot, date, slots) {
			var _ = this._, task = slot.task, when = slot.when, refresh = function() {
				mod.hide();
				cal.orient();
			}, cal = this.cal, tshow = CT.dom.div(slot.duration), mod = CT.modal.modal([
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
			]);
		},
		help: function() {
			CT.modal.modal([
				CT.dom.div("How does this work?", "biggest centered"),
				CT.dom.div([
					"Click the 'daily task' button to create a new daily task",
					"Click a day name to set up a weekly task.",
					"Click a date to set up a non-recurring task.",
					"Click a task to edit or volunteer."
				], "subpadded")
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
				modelName: "commitment",
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
		CT.modal.prompt({
			prompt: "what is this task called?",
			cb: function(tname) {
				CT.modal.prompt({
					isTA: true,
					prompt: "please describe this task",
					cb: function(tdesc) {
						coop.cal.edit({
							modelName: "task",
							name: tname,
							description: tdesc,
							editors: [ user.core.get("key") ]
						}, function(task) {
							CT.data.add(task);
							cb(task);
						});
					}
				});
			}
		});
	},
	build: function() {
		var cal = this.cal = new CT.cal.Cal({
			appointments: this.tasks,
			click: {
				date: this.click.once,
				day: this.click.weekly,
				edit: this.click.edit,
				appointment: this.click.task
			}
		});
		CT.dom.setContent(this.opts.parent, [
			CT.dom.button("help", this.click.help, "right"),
			CT.dom.button("daily task", this.click.daily, "left"),
			cal.node
		]);
	},
	load: function() {
		var thiz = this;
		CT.db.get("task", function(tasks) {
			thiz.tasks = tasks;
			thiz.build();
		}, null, null, null, this.opts.filters);
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			parent: "ctmain"
		});
		this.load();
	}
});