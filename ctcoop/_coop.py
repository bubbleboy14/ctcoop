from cantools.web import respond, cgi_get, send_mail, send_sms
from model import db, Need, Offering

def response():
	action = cgi_get("action")
	if action == "need":
		Need(**cgi_get("data")).put()
	elif action == "offering":
		Offering(**cgi_get("data")).put()
	elif action == "do":
		need = db.get(cgi_get("need"))
		reminder = cgi_get("reminder")
		task = [need.description]
		for item in ["name", "email", "phone", "address"]:
			val = getattr(need, item)
			if val:
				task.append("%s: %s"%(item, val))
		task = "you agreed to do this:\n\n%s"%("\n\n".join(task),)
		if reminder == "text message":
			send_sms(cgi_get("number"), "do this thing", task,
				cgi_get("carrier"))
		elif reminder == "email":
			send_mail(to=cgi_get("email"),
				subject="do this thing", body=task)
		need.closed = True
		need.put()

respond(response)