from cantools.web import respond, succeed, cgi_get, send_mail, send_sms
from model import db, Need, Offering

def response():
	action = cgi_get("action")
	if action == "need":
		need = Need(**cgi_get("data"))
		need.put()
		succeed(need.data())
	elif action == "offering":
		offering = Offering(**cgi_get("data"))
		offering.put()
		succeed(offering.data())
	elif action == "close":
		need = db.get(cgi_get("need")) # need or offering....
		need.closed = True
		need.put()
	elif action == "do":
		need = db.get(cgi_get("need")) # need or offering....
		memkey = cgi_get("member", required=False)
		reminder = cgi_get("reminder", required=False)
		task = [need.description]
		if need.member:
			nmem = need.member.get()
			task.append("name: %s"%(nmem.firstName,))
			task.append("email: %s"%(nmem.email,))
		for item in ["name", "email", "phone", "address"]:
			val = getattr(need, item)
			if val:
				task.append("%s: %s"%(item, val))
		task = "you agreed to do this:\n\n%s\n\nplease follow up!"%("\n\n".join(task),)
		if reminder == "text message":
			send_sms(cgi_get("number"), "do this thing", task,
				cgi_get("carrier"))
		elif reminder == "email":
			send_mail(to=cgi_get("email"),
				subject="do this thing", body=task)
		elif reminder == "member":
			mem = db.get(memkey)
			send_mail(to=mem.email, subject="do this thing", body=task)
			mem.help_match(need)
		if not need.ongoing:
			need.closed = True
			need.put()

respond(response)