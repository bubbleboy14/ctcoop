coop.cal = {};

coop.cal.Cal = CT.Class({
	CLASSNAME: "coop.cal.Cal",
	dayClick: function(node, cal, day, date, month, year) {
		this.log(date, month, year);
		(new CT.modal.Modal({
			transition: "slide",
			content: [
				CT.cal.stamp(day, date, month, year),
				"[add stuff here...]"
			]
		})).show();
	},
	build: function() {
		var cal = this.cal = new CT.cal.Cal({
			dayClick: this.dayClick,
			appointments: this.tasks
		});
		CT.dom.setContent(this.opts.parent, cal.node);
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