from __future__ import absolute_import, print_function, division, unicode_literals
from gevent.wsgi import WSGIServer
import webbrowser
from xcessiv import app


def launch(port=1994):
    http_server = WSGIServer(('', port), app)
    webbrowser.open_new('http://localhost:' + str(port))
    http_server.serve_forever()
