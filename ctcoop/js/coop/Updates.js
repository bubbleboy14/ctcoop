coop.Updates = CT.Class({
	CLASSNAME: "coop.Updates",
	_: {
		newUp: "<b>New Update</b>",
		blurs: {
			subject: ["what's this about?", "what's the subject?", "subject, please"],
			message: ["what is the message?", "this is the email body", "add message here"]
		}
	},
	fresh: function() {
		var _ = this._, subject = CT.dom.smartField({
			blurs: _.blurs.subject
		}), message = CT.dom.smartField({
			isTA: true,
			blurs: _.blurs.message
		}), oz = this.opts, thaz = this;
		CT.dom.setContent(_.content, [
			CT.dom.div("New Update", "biggest bold pv10"),
			CT.dom.div([
				CT.dom.div("subject", "bigger"),
				subject,
				CT.dom.div("message", "bigger"),
				message,
				CT.dom.button("Send", function() {
					if (!subject.fieldValue() || !message.fieldValue())
						return alert("please provide subject and message");
					var data = {
						modelName: "update",
						subject: oz.subject + subject.fieldValue(),
						message: message.fieldValue(),
						sender: user.core.get("key")
					};
					if (oz.recipients)
						data.recipients = oz.recipients;
					CT.net.post({
						path: "/_db",
						params: {
							data: data,
							action: "edit",
							pw: core.config.keys.storage
						},
						cb: function(up) {
							var tlist = _.list,
								t = CT.panel.trigger(up, thaz.single),
								nextSib = tlist.firstChild.nextSibling;
							if (nextSib)
								tlist.insertBefore(t, nextSib);
							else
								tlist.appendChild(t);
							t.trigger();
							oz.on.update && oz.on.update(up);
						}
					});
				})
			], "round bordered padded")
		]);
	},
	single: function(up) {
		var _ = this._;
		if (up.label == _.newUp)
			return this.fresh();
		CT.dom.setContent(_.content, [
			"From: " + CT.data.get(up.sender).email,
			"Subject: " + up.subject,
			up.message,

			"TODO: add conversation!"

		]);
	},
	build: function() {
		var _ = this._, oz = this.opts, thaz = this;
		CT.db.multi(oz.updates.map(function(up) {
			return up.sender;
		}), function() {
			_.content = CT.dom.div(null, "ctcontent");
			_.list = CT.panel.triggerList([{
				label: _.newUp
			}].concat(oz.updates), thaz.single);
			_.list.classList.add("ctlist");
			CT.dom.setContent(oz.parent, [ _.list, _.content ]);
		});
	},
	load: function() {
		var oz = this.opts, thaz = this;
		if (oz.updates)
			return this.build();
		CT.db.get("update", function(uz) {
			oz.updates = uz;
			thaz.build();
		}, null, null, null, oz.filters);
	},
	init: function(opts) {
		var opts = this.opts = CT.merge(opts, {
			parent: "ctmain",
			subject: "", // prepend to subject
			on: {} // update()
		});
		this.load();
	}
});