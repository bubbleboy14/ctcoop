from cantools import db, config
from cantools.web import send_mail
from ctuser.model import CTUser

class Member(CTUser):
    roles = db.String(repeated=True)

class Timeslot(db.TimeStampedBase):
    schedule = db.String(choices=["once", "weekly", "daily", "exception", "offday"])
    when = db.DateTime()
    duration = db.Float() # hours

    def stewardship(self):
        return Stewardship.query(Stewardship.timeslots.contains(self.key.urlsafe())).get()

    def task(self):
        return Task.query(Task.timeslots.contains(self.key.urlsafe())).get()

    def slotter(self):
        return self.task() or self.stewardship()

    def beforeedit(self, edits):
        sched = edits.get("sched")
        if sched == "daily" or sched == "weekly" and self.schedule == "once":
            return
        task = self.task()
        task and task.downschedule()

    def beforeremove(self, session):
        slotter = self.slotter()
        if slotter: # no slotter if slotter is deleting itself....
            slotter.timeslots = filter(lambda x : x != self.key, slotter.timeslots)
            slotter.put(session)

class Stewardship(db.TimeStampedBase):
    steward = db.ForeignKey() # CTUser, subclass (such as Member), or custom
    timeslots = db.ForeignKey(kind=Timeslot, repeated=True)

    def task(self):
        return Task.query(Task.commitments.contains(self.key.urlsafe())).get()

    def beforeremove(self, session):
        task = self.task()
        if task: # no task is task is deleting itself...
            task.unsteward(self)
            task.commitments = filter(lambda x : x != self.key, task.commitments)
            task.put(session)

    def afterremove(self, session):
        db.delete_multi(db.get_multi(self.timeslots, session), session)


# TODO: put this somewhere!!!
RESCHED = """Hello!

You volunteered for this task:

%s

The task has been %s, so your commitment record has been removed.

Please click <a href='""" + config.web.protocol + """://""" + config.web.domain + """/coop/cal.html'>here</a> to review your calendar.

That's it!"""

class Task(db.TimeStampedBase):
    editors = db.ForeignKey(repeated=True) # CTUser, subclass (such as Member), or custom
    timeslots = db.ForeignKey(kind=Timeslot, repeated=True)
    commitments = db.ForeignKey(kind=Stewardship, repeated=True)
    name = db.String()
    description = db.Text()
    mode = db.String() # arbitrary
    requirements = db.String(repeated=True)
    steps = db.String(repeated=True)

    def unsteward(self, stewardship, verb="rescheduled"): # just a notifier
        send_mail(to=stewardship.steward.get().email,
            subject="commitment update", body=RESCHED%(self.name, verb))

    def downschedule(self):
        stewz = db.get_multi(self.commitments)
        for stew in stewz:
            self.unsteward(stew, "rescheduled")
        self.commitments = []
        self.put()
        db.delete_multi(stewz)

    def beforeremove(self, session):
        for stew in db.get_multi(self.commitments, session):
            self.unsteward(stew, "removed")

    def afterremove(self, session):
       db.delete_multi(db.get_multi(self.timeslots + self.commitments, session), session)