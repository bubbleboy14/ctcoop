from cantools import db
from ctuser.model import CTUser

class Member(CTUser):
    roles = db.String(repeated=True)

class Timeslot(db.TimeStampedBase):
    schedule = db.String(choices=["once", "weekly", "daily", "exception", "offday"])
    when = db.DateTime()
    duration = db.Float() # hours

    def slotter(self):
        k = self.key.urlsafe()
        return Stewardship.query(Stewardship.timeslots.contains(k)).get() or Task.query(Task.timeslots.contains(k)).get()

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
            task.commitments = filter(lambda x : x != self.key, task.commitments)
            task.put(session)

    def afterremove(self, session):
        db.delete_multi(db.get_multi(self.timeslots, session), session)

class Task(db.TimeStampedBase):
    editors = db.ForeignKey(repeated=True) # CTUser, subclass (such as Member), or custom
    timeslots = db.ForeignKey(kind=Timeslot, repeated=True)
    commitments = db.ForeignKey(kind=Stewardship, repeated=True)
    name = db.String()
    description = db.Text()
    mode = db.String() # arbitrary
    requirements = db.String(repeated=True)
    steps = db.String(repeated=True)

    def afterremove(self, session):
       db.delete_multi(db.get_multi(self.timeslots + self.commitments, session), session)