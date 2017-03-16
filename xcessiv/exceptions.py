"""This module contains specific exceptions to be handled by Flask"""


class UserError(Exception):
    def __init__(self, message, status_code=400, **kwargs):
        super(UserError, self).__init__(self)
        self.message = message
        self.status_code = status_code
        self.kwargs = kwargs

    def to_dict(self):
        rv = dict(self.kwargs or ())
        rv['message'] = self.message
        return rv
