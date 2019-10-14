from cantools import db
from ctuser.model import CTUser

class Member(CTUser):
    roles = db.String(repeated=True)

class Timeslot(db.TimeStampedBase):
	schedule = db.String(choices=["once", "weekly",
		"daily", "exception", "offday"])
	when = db.DateTime()
	duration = db.Float() # hours

class Stewardship(db.TimeStampedBase):
	steward = db.ForeignKey() # CTUser, subclass (such as Member), or custom
	timeslots = db.ForeignKey(kind=Timeslot, repeated=True)

	def task(self):
		return Task.query(Task.commitments.contains(self.key.urlsafe())).get()

def slot2stewardship(slot):
	return Stewardship.query(Stewardship.timeslots.contains(slot.key.urlsafe())).get()

class Task(db.TimeStampedBase):
	editors = db.ForeignKey(repeated=True) # CTUser, subclass (such as Member), or custom
	timeslots = db.ForeignKey(kind=Timeslot, repeated=True)
	commitments = db.ForeignKey(kind=Stewardship, repeated=True)
	name = db.String()
	description = db.Text()
	mode = db.String() # arbitrary
	requirements = db.String(repeated=True)
	steps = db.String(repeated=True)