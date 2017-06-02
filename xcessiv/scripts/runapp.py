from __future__ import absolute_import, print_function, division, unicode_literals
import os
import sys
import argparse
from multiprocessing import Process, Pipe
from redis import Redis
from xcessiv.server import launch
from xcessiv.scripts.runworker import runworker
from xcessiv import app
from six import iteritems


def main():
    parser = argparse.ArgumentParser(description='Launch Xcessiv server and workers')
    parser.add_argument('-w', '--worker', help='Define number of workers', type=int)
    parser.add_argument('-p', '--port', help='Port number to be used by web server',
                        type=int)
    parser.add_argument('-H', '--host', help='Redis host')
    parser.add_argument('-P', '--redisport', help='Redis port', type=int)
    parser.add_argument('-D', '--redisdb', help='Redis database number', type=int)
    args = parser.parse_args()

    # Check if Windows
    if os.name == 'nt':
        raise OSError('Xcessiv has detected that you are using Windows. '
                      'Unfortunately, Xcessiv does not currently support Windows. '
                      'The accepted workaround for this is to use Docker to run '
                      'Xcessiv instead. Please check the Xcessiv documentation for '
                      'more details.')

    # Overwrite configuration from configuration file
    default_config_path = os.path.join(os.path.expanduser('~'), '.xcessiv/config.py')
    if os.path.exists(default_config_path):
        print('Config file found at ' + default_config_path)
        app.config.from_pyfile(default_config_path)

    # Overwrite configuration from command line arguments
    cli_config = {
        'REDIS_HOST': args.host,
        'REDIS_PORT': args.redisport,
        'REDIS_DB': args.redisdb,
        'XCESSIV_PORT': args.port,
        'NUM_WORKERS': args.worker
    }
    cli_config = dict((key, value) for key, value in iteritems(cli_config) if value is not None)
    app.config.update(**cli_config)

    redis_conn = (Redis(app.config['REDIS_HOST'],
                        app.config['REDIS_PORT'],
                        app.config['REDIS_DB']))
    redis_conn.get(None)  # will throw exception if Redis is unavailable

    cwd = os.getcwd()
    print(cwd)

    processes = []
    try:
        server_proc = Process(target=launch, args=(app,))
        server_proc.start()

        for i in range(app.config['NUM_WORKERS']):
            p = Process(target=runworker, args=(app,))
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
