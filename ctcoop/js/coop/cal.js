coop.cal = {};

coop.cal.Cal = CT.Class({
	CLASSNAME: "coop.cal.Cal",
	dateClick: function(node, cal, day, date, month, year) {
		this.log(date, month, year);
		CT.modal.modal([
			CT.cal.stamp(day, date, month, year),
			"[add stuff here...]"
		]);
	},
	dayClick: function(day) {
		this.log(day);
		CT.modal.modal([
			day,
			"[add stuff here...]"
		]);
	},
	daily: function() {

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
				date: this.dateClick,
				day: this.dayClick
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