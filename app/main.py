from flask import Flask, render_template, redirect, request, url_for, flash, abort
from flask_login import LoginManager, login_user, current_user
from peewee import DoesNotExist

from models import User

app = Flask(__name__)
app.config.from_pyfile('config.py')
app.secret_key = 'secret'

lm = LoginManager()
lm.init_app(app)


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

    return render_template('main.html', name=current_user.name)


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
    return redirect(url_for('index'))


@app.route('/xxx', methods=['POST'])
def add_activity():
    pass