from __future__ import absolute_import, print_function, division, unicode_literals
import os
import sys
from multiprocessing import Process, Pipe
from xcessiv.server import launch
from xcessiv.scripts.runworker import runworker


def wrap(task, pipe):
    def wrapper(*args, **kwargs):
        sys.stdout = pipe
        task(*args, **kwargs)
    return wrapper


def main():
    num_workers = 1
    if len(sys.argv) > 1:
        num_workers = int(sys.argv[1])

    cwd = os.getcwd()
    print(cwd)

    processes = []
    try:
        conn1, conn2 = Pipe(duplex=False)
        server_proc = Process(target=wrap(launch, conn2))
        server_proc.start()

        for i in range(num_workers):
            p = Process(target=wrap(runworker, conn2))
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
