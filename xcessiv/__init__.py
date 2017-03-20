from __future__ import absolute_import, print_function, division, unicode_literals
from flask import Flask
from rq import Queue, Connection
from redis import Redis


app = Flask(__name__)
app.config.from_object('config')
redis_conn = (Redis(app.config['REDIS_HOST'], app.config['REDIS_PORT'], app.config['REDIS_DB']))


import xcessiv.views
