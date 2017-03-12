from __future__ import absolute_import, print_function, division, unicode_literals
from flask import Flask


app = Flask(__name__)
app.config.from_object('config')


import xcessiv.views
