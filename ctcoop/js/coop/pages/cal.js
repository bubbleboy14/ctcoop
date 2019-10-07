CT.require("CT.all");
CT.require("core");
CT.require("user.core");

CT.onload(function() {
	CT.initCore();
	CT.db.get("task", function(tasks) {
		CT.dom.setContent("ctmain", (new CT.cal.Cal({
			appointments: tasks
		})).node);
	});
});