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
	timeslot: function(task, schedule, when) {
		var hours, minutes, cal = this.cal;
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
						coop.cal.edit({
							modelName: "timeslot",
							duration: duration,
							schedule: schedule,
							when: CT.parse.date2string(when, true)
						}, function(slot) {
							task.timeslots.push(slot);
							coop.cal.edit({
								key: task.key,
								timeslots: task.timeslots.map(function(ts) {
									return ts.key;
								})
							}, function() {
								cal.appointment(task);
								cal.orient();
							});
						});
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
						}, cb);
					}
				});
			}
		});
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
	},
	build: function() {
		var cal = this.cal = new CT.cal.Cal({
			appointments: this.tasks,
			click: {
				date: this.once,
				day: this.weekly
			}
		});
		CT.dom.setContent(this.opts.parent, [
			CT.dom.button("help", this.help, "right"),
			CT.dom.button("daily task", this.daily, "left"),
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