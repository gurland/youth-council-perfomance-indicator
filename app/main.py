from functools import wraps

from wtforms import Form, StringField, DateField, validators, RadioField
from flask import Flask, render_template, redirect, request, url_for, flash, jsonify
from flask_login import LoginManager, login_user, current_user
from peewee import DoesNotExist

from models import User, Activity
from config import MEMBER, MODERATOR, ADMIN, ANY

app = Flask(__name__)
app.config.from_pyfile('config.py')
app.secret_key = 'secret'

lm = LoginManager()
lm.init_app(app)


class ActivityForm(Form):
    name = StringField('Назва', [validators.DataRequired()])
    description = StringField('Опис', [validators.Optional()])

    activity_type = RadioField('Тип', [validators.DataRequired()],
                               choices=[('organized', 'Організував, провів, зробив'),
                                        ('collaborated', 'Долучився'),
                                        ('visited', 'Відвідав')])

    date = DateField('Дата', [validators.DataRequired()])


def login_required(role=ANY):
    def wrapper(fn):
        @wraps(fn)
        def decorated_view(*args, **kwargs):
            if not current_user.is_authenticated:
                return lm.unauthorized()

            if role == ANY:
                return fn(*args, **kwargs)

            elif current_user.role < role:
                return lm.unauthorized()

            else:
                return fn(*args, **kwargs)

        return decorated_view
    return wrapper


@lm.user_loader
def load_user(user_id):
    try:
        return User.get(code=user_id)
    except DoesNotExist:
        return


@app.route("/")
def index():
    if not current_user.is_authenticated:
        return redirect(url_for('auth'))

    return render_template('main.html')


@app.route('/auth')
def auth():
    if current_user.is_authenticated:
        return redirect(url_for('index'))

    return render_template('auth.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    def bad_login_redirect():
        flash('Введений код невірний!')
        return redirect(url_for('index'))

    if not request.method == 'POST':
        return redirect(url_for('index'))

    code = request.form['code']

    try:
        user = User.get(code=code)

    except DoesNotExist:
        return bad_login_redirect()

    login_user(user)
    user.authenticated = True
    user.save()
    return redirect(url_for('index'))


@app.route('/add_activity', methods=['POST'])
@login_required()
def add_activity():
    form = ActivityForm(request.form)
    if form.validate():
        name, description, activity_type, date = form.name.data, form.description.data, \
                                                 form.activity_type.data, form.date.data

        Activity.create(user=current_user.id, name=name, date=date, description=description)

        flash('Звіт надіслано!')
        return redirect(url_for('index'))

    else:
        flash('Невірно заповнена форма')
        return redirect(url_for('index'))


@app.route('/admin')
@login_required(ADMIN)
def admin():
    return render_template('admin.html', users=User.select().order_by(User.name))


@app.route('/save_roles', methods=['POST'])
@login_required(ADMIN)
def save_roles():
    json = request.get_json()
    if json:
        for user_role in json:
            pk, role = int(user_role['_pk']), int(user_role['role'])
            if 0 <= role < 2:
                user = User.get(id=pk)
                user.role = role
                user.save()

        return jsonify({'success': True, 'msg': 'Привілегії змінено!'})