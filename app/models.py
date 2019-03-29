from datetime import datetime
import string
import random
import hashlib
import io

from peewee import SqliteDatabase, Model, CharField, TextField, BooleanField, ForeignKeyField, DateField, DateTimeField, IntegerField
import qrcode

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

    @staticmethod
    def generate_code():
        return ''.join(random.choice(string.ascii_letters + string.digits) for _ in range(12))

    @staticmethod
    def generate_hash(code):
        return hashlib.md5(code.encode('utf-8')).hexdigest()

    def get_qrcode(self):
        img_buff = io.BytesIO()
        pwd_hash = self.generate_hash(self.code)
        img = qrcode.make(f'http://svod.ga/qr_login/{pwd_hash}')
        img.save(img_buff, format='PNG')
        img_bytes = img_buff.getvalue()
        img_buff.close()
        return img_bytes

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
    activity_type = CharField()

    date = DateField()
    name = TextField()
    description = TextField(null=True)


db.create_tables([User, Activity], safe=True)
