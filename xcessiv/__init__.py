from __future__ import absolute_import, print_function, division, unicode_literals
from flask import Flask
from redis import Redis


__version__ = '0.1.0.dev1'


app = Flask(__name__, static_url_path='/static', static_folder='ui/build/static')
app.config.from_object('xcessiv.config')
redis_conn = (Redis(app.config['REDIS_HOST'], app.config['REDIS_PORT'], app.config['REDIS_DB']))


import xcessiv.views
