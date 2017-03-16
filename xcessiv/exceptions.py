"""This module contains specific exceptions to be handled by Flask"""


class UserError(Exception):
    def __init__(self, message, status_code=400, payload=None):
        super(UserError, self).__init__(self)
        self.message = message
        self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv
