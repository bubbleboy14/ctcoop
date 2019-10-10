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
					thaz.volunteer(schedule, slot, date)); // use slots?
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
		help: function() {
			CT.modal.modal([
				CT.dom.div("How does this work?", "biggest centered"),
				CT.dom.div([
					"Click the 'daily task' button to create a new daily task",
					"Click a day name to set up a weekly task.",
					"Click a date to set up a non-recurring task.",
					"Click the task edit button to edit text and timeslots.",
					"Click a task to volunteer."
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
	volunteer: function(schedule, slot, date) {
		var thaz = this;
		return function() {
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
							description: tdesc
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