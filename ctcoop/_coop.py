from cantools.web import respond, cgi_get, send_mail, send_sms
from model import db, Need, Offering

def response():
	action = cgi_get("action")
	if action == "need":
		Need(**cgi_get("data")).put()
	elif action == "offering":
		Offering(**cgi_get("data")).put()
	elif action == "do":
		need = db.get(cgi_get("need")) # need or offering....
		reminder = cgi_get("reminder")
		task = [need.description]
		for item in ["name", "email", "phone", "address"]:
			val = getattr(need, item)
			if val:
				task.append("%s: %s"%(item, val))
		if need.member:
			nmem = need.member.get()
			task.append("name: %s"%(nmem.firstName,))
			task.append("email: %s"%(nmem.email,))
		task = "you agreed to do this:\n\n%s\n\nplease follow up!"%("\n\n".join(task),)
		if reminder == "text message":
			send_sms(cgi_get("number"), "do this thing", task,
				cgi_get("carrier"))
		elif reminder == "email":
			send_mail(to=cgi_get("email"),
				subject="do this thing", body=task)
		elif reminder == "member":
			mem = db.get(cgi_get("member"))
			send_mail(to=mem.email, subject="do this thing", body=task)
			mem.help_match(need)
		need.closed = True
		need.put()

respond(response)