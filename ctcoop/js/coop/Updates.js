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
			classname: "w1",
			blurs: _.blurs.subject
		}), message = CT.dom.smartField({
			isTA: true,
			classname: "w1",
			blurs: _.blurs.message
		}), oz = this.opts, thaz = this;
		CT.dom.setContent(_.content, [
			CT.dom.div("New Update", "biggest bold pb10"),
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
								t = CT.panel.trigger(thaz.label(up), thaz.single),
								nextSib = tlist.firstChild.nextSibling;
							if (nextSib)
								tlist.insertBefore(t, nextSib);
							else
								tlist.appendChild(t);
							CT.data.add(up);
							t.trigger();
							oz.on.update && oz.on.update(up);
						}
					});
				})
			], "round bordered padded")
		]);
	},
	label: function(up) {
		var oz = this.opts;
		if (oz.shortSub)
			up.label = up.subject.slice(oz.subject.length);
		return up;
	},
	single: function(up) {
		var _ = this._;
		if (up.label == _.newUp)
			return this.fresh();
		CT.dom.setContent(_.content, [
			CT.dom.div("From: <b>" + CT.data.get(up.sender).email + "</b>", "right"),
			CT.dom.div(up.label, "biggest bold pb10"),
			up.message.replace(/\n/g, "<br>"),
			user.core.convo(up.conversation)
		]);
	},
	build: function() {
		var _ = this._, oz = this.opts, thaz = this;
		if (oz.noNew && !oz.updates.length)
			return CT.dom.setContent(oz.parent, "oops, no updates yet!");
		oz.updates.forEach(this.label);
		CT.db.multi(oz.updates.map(function(up) {
			return up.sender;
		}), function() {
			_.content = CT.dom.div(null, "ctcontent");
			_.list = CT.panel.triggerList(oz.noNew ? oz.updates : [{
				label: _.newUp
			}].concat(oz.updates), thaz.single);
			_.list.classList.add("ctlist");
			CT.dom.setContent(oz.parent, [ _.list, _.content ]);
			_.list.firstChild.trigger();
		});
	},
	load: function() {
		var oz = this.opts, thaz = this;
		if (oz.updates)
			return this.build();
		CT.db.get("update", function(uz) {
			oz.updates = uz;
			thaz.build();
		}, null, null, oz.order, oz.filts ? oz.filts() : oz.filters);
	},
	init: function(opts) {
		this.opts = CT.merge(opts, core.config.ctcoop.updates);
		this.load();
	}
});