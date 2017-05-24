from __future__ import absolute_import, print_function, division, unicode_literals
from gevent.wsgi import WSGIServer
import webbrowser


def launch(app):
    http_server = WSGIServer(('', app.config['XCESSIV_PORT']), app)
    webbrowser.open_new('http://localhost:' + str(app.config['XCESSIV_PORT']))
    http_server.serve_forever()
