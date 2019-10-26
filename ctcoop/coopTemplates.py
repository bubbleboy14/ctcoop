from cantools import config

RESCHED = """Hello!

You volunteered for this task:

%s

The task has been %s, so your commitment record has been removed.

Please click <a href='""" + config.web.protocol + """://""" + config.web.domain + """/coop/cal.html'>here</a> to review your calendar.

That's it!"""

UPDATE = """Hello!

Here is an update from %s:

%s

Please click <a href='""" + config.web.protocol + """://""" + config.web.domain + """/coop/updates.html'>here</a> to review your updates.

That's it!"""