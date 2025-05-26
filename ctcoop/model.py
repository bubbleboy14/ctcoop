from cantools import db
from cantools.web import send_mail
from ctuser.model import CTUser, Conversation, Tag
from coopTemplates import UPDATE

class Member(CTUser):
    roles = db.String(repeated=True)

    def help_match(self, need_or_offer):
        pass

# various ForeignKey()s below (member, sender,
# recipients, steward, editors) require CTUser,
# subclass (such as Member), or custom user table

class Contactable(db.TimeStampedBase):
    tags = db.ForeignKey(kind=Tag, repeated=True)
    member = db.ForeignKey()
    name = db.String()
    email = db.String()
    phone = db.String()
    address = db.String()
    description = db.Text() # only required field
    closed = db.Boolean(default=False)
    ongoing = db.Boolean(default=False)

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