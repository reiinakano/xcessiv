from rq import Connection, Worker
from redis import Redis
from xcessiv import app

REDIS_HOST = 'localhost'
REDIS_PORT = 6379
REDIS_DB = 8
QUEUES = ['default']

redis_conn = Connection(Redis(app.config['REDIS_HOST'],
                              app.config['REDIS_PORT'],
                              app.config['REDIS_DB']))
with redis_conn:
    w = Worker(app.config['QUEUES'])
    w.work()
