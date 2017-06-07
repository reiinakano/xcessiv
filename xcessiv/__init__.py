from __future__ import absolute_import, print_function, division, unicode_literals
from flask import Flask


__version__ = '0.3.8'


app = Flask(__name__, static_url_path='/static', static_folder='ui/build/static')
app.config.from_object('xcessiv.config')


import xcessiv.views
