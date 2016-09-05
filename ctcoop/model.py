from cantools import db
from ctuser.model import CTUser

class Member(CTUser):
    roles = db.String(repeated=True)
