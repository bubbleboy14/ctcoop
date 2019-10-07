from cantools import db
from ctuser.model import CTUser

class Member(CTUser):
    roles = db.String(repeated=True)

class Timeslot(db.TimeStampedBase):
	schedule = db.String(choices=["once", "weekly", "daily", "exception"])
	when = db.DateTime()
	duration = db.Float() # hours

class Task(db.TimeStampedBase):
	timeslots = db.ForeignKey(kind=Timeslot, repeated=True)
	name = db.String()
	description = db.Text()

class Responsibility(db.TimeStampedBase):
	steward = db.ForeignKey() # CTUser, subclass (such as Member), or custom
	task = db.ForeignKey(kind=Task)
	timeslots = db.ForeignKey(kind=Timeslot, repeated=True)