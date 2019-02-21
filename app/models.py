from datetime import datetime

from peewee import SqliteDatabase, Model, CharField, TextField, BooleanField, ForeignKeyField, DateField, DateTimeField, IntegerField

from config import MEMBER

db = SqliteDatabase('app/users.db')


class BaseModel(Model):
    class Meta:
        database = db


class User(BaseModel):
    name = CharField()
    code = CharField(unique=True)
    authenticated = BooleanField(default=False)
    role = IntegerField(default=MEMBER)

    def is_authenticated(self):
        return self.authenticated

    def is_active(self):
        return True

    def is_anonymous(self):
        return False

    def get_id(self):
        return self.code


class OfficialActivity(BaseModel):
    user = ForeignKeyField(User, backref='official_activities')
    recorded = DateTimeField(default=datetime.now())

    date = DateField()
    name = CharField()
    description = TextField(null=True)


class Activity(BaseModel):
    user = ForeignKeyField(User, backref='activities')
    recorded = DateTimeField(default=datetime.now())

    date = DateField()
    name = TextField()
    description = TextField(null=True)


db.create_tables([User, Activity], safe=True)
