from math import ceil
from cantools import db, config
from cantools.web import send_mail
from ctuser.model import CTUser, Conversation
from coopTemplates import RESCHED, UPDATE

class Member(CTUser):
    roles = db.String(repeated=True)

# various ForeignKey()s below (member, sender,
# recipients, steward, editors) require CTUser,
# subclass (such as Member), or custom user table

class Contactable(db.TimeStampedBase):
    member = db.ForeignKey()
    name = db.String()
    email = db.String()
    phone = db.String()
    address = db.String()
    description = db.Text() # only required field
    closed = db.Boolean(default=False)

class Need(Contactable):
    pass

class Offering(Contactable):
    pass

class Update(db.TimeStampedBase):
    sender = db.ForeignKey()
    subject = db.String()
    message = db.Text()
    recipients = db.ForeignKey(repeated=True)
    conversation = db.ForeignKey(kind=Conversation)
    label = "subject"

    def oncreate(self):
        convo = Conversation(topic=self.subject)
        convo.put()
        self.conversation = convo.key
        if self.recipients:
            recipients = db.get_multi(self.recipients)
        else:
            recipients = Member.query().all()
        bod = UPDATE%(self.sender.get().email, self.message)
        for recip in recipients:
            send_mail(to=recip.email, subject=self.subject, body=bod)

class Timeslot(db.TimeStampedBase):
    schedule = db.String(choices=["once", "weekly", "daily", "exception",
        "offday", "monthly (date)", "monthly (day)"])
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
            slotter.timeslots = list(filter(lambda x : x != self.key, slotter.timeslots))
            slotter.put(session)

class Stewardship(db.TimeStampedBase):
    steward = db.ForeignKey()
    timeslots = db.ForeignKey(kind=Timeslot, repeated=True)

    def task(self):
        return Task.query(Task.commitments.contains(self.key.urlsafe())).get()

    def happening(self, now):
        slots = []
        if self.task().happening(now):
            for slot in db.get_multi(self.timeslots):
                if isDay(slot, now):
                    slots.append(slot)
        if len(slots) is 1: # if 2, one is exception
            return slots[0]

    def beforeremove(self, session):
        task = self.task()
        if task: # no task is task is deleting itself...
            task.unsteward(self)
            task.commitments = list(filter(lambda x : x != self.key, task.commitments))
            task.put(session)

    def afterremove(self, session):
        db.delete_multi(db.get_multi(self.timeslots, session), session)

def isDay(slot, now):
    sched = slot.schedule
    when = slot.when
    if sched == "daily":
        return True
    elif sched == "weekly" or sched == "offday":
        return when.weekday() == now.weekday()
    elif sched == "once" or sched == "exception":
        return when.date() == now.date()
    elif sched == "monthly (date)":
        return when.day == now.day
    elif sched == "monthly (day)":
        return when.weekday() == now.weekday() and ceil(when.day / 7.0) == ceil(now.day / 7.0)

class Task(db.TimeStampedBase):
    editors = db.ForeignKey(repeated=True)
    timeslots = db.ForeignKey(kind=Timeslot, repeated=True)
    commitments = db.ForeignKey(kind=Stewardship, repeated=True)
    name = db.String()
    description = db.Text()
    mode = db.String() # arbitrary
    requirements = db.String(repeated=True)
    steps = db.String(repeated=True)

    def happening(self, now):
        slots = []
        for slot in db.get_multi(self.timeslots):
            if isDay(slot, now):
                slots.append(slot)
        if len(slots) is 1: # if 2, one is exception
            return slots[0]

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