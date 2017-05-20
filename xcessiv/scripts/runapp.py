from __future__ import absolute_import, print_function, division, unicode_literals
import os
import sys
import argparse
from multiprocessing import Process, Pipe
from redis import Redis
from xcessiv.server import launch
from xcessiv.scripts.runworker import runworker


def wrap(task, pipe):
    def wrapper(*args, **kwargs):
        sys.stdout = pipe
        task(*args, **kwargs)
    return wrapper


def main():
    parser = argparse.ArgumentParser(description='Launch Xcessiv server and workers')
    parser.add_argument('-w', '--worker', help='Define number of workers', default=1, type=int)
    parser.add_argument('-p', '--port', help='Port number to be used by web server',
                        default=1994, type=int)
    parser.add_argument('-H', '--host', help='Redis host', default='localhost')
    parser.add_argument('-P', '--redisport', help='Redis port', default=6379, type=int)
    parser.add_argument('-D', '--redisdb', help='Redis database number', default=8, type=int)
    args = parser.parse_args()

    cli_config = {
        'REDIS_HOST': args.host,
        'REDIS_PORT': args.redisport,
        'REDIS_DB': args.redisdb
    }

    redis_conn = (Redis(cli_config['REDIS_HOST'],
                        cli_config['REDIS_PORT'],
                        cli_config['REDIS_DB']))
    redis_conn.get(None)  # will throw exception if Redis is unvailable

    cwd = os.getcwd()
    print(cwd)

    processes = []
    try:
        conn1, conn2 = Pipe(duplex=False)
        server_proc = Process(target=wrap(launch, conn2), args=(args.port, cli_config))
        server_proc.start()

        for i in range(args.worker):
            p = Process(target=wrap(runworker, conn2), args=(cli_config,))
            processes.append(p)
            p.start()

        server_proc.join()
    finally:
        for proc in processes:
            proc.terminate()
            proc.join()
        server_proc.terminate()
        server_proc.join()


if __name__ == '__main__':
    main()
