import subprocess
import os
import sys


def main():
    num_workers = 1
    if len(sys.argv) > 1:
        num_workers = int(sys.argv[1])

    cwd = os.getcwd()
    dirname = os.path.dirname(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))
    processes = []
    try:
        server_proc = subprocess.Popen(['python', os.path.join(dirname, 'runserver.py')], cwd=cwd)

        for i in range(num_workers):
            processes.append(subprocess.Popen(
                ['python', os.path.join(dirname, 'runworker.py')], cwd=cwd)
            )

        server_proc.wait()
    finally:
        for proc in processes:
            proc.terminate()
            proc.terminate()
        server_proc.terminate()


if __name__ == '__main__':
    main()
