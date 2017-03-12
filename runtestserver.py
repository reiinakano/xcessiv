from __future__ import absolute_import, print_function, division, unicode_literals
from xcessiv import app
import sys


if __name__ == '__main__':
    port = 8080 if len(sys.argv) < 2 else sys.argv[1]
    app.run(debug=True, port=int(port), host='0.0.0.0')
