from rq import Connection, Worker
from redis import Redis


def runworker(app):

    REDIS_HOST = app.config['REDIS_HOST']
    REDIS_PORT = app.config['REDIS_PORT']
    REDIS_DB = app.config['REDIS_DB']
    QUEUES = app.config['QUEUES']

    redis_conn = Connection(Redis(REDIS_HOST,
                                  REDIS_PORT,
                                  REDIS_DB))
    with redis_conn:
        w = Worker(QUEUES)
        w.work()
