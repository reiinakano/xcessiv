from __future__ import print_function
from setuptools import setup, find_packages
from setuptools.command.test import test as TestCommand
import io
import os
import sys

here = os.path.abspath(os.path.dirname(__file__))


def read(*filenames, **kwargs):
    encoding = kwargs.get('encoding', 'utf-8')
    sep = kwargs.get('sep', '\n')
    buf = []
    for filename in filenames:
        with io.open(filename, encoding=encoding) as f:
            buf.append(f.read())
    return sep.join(buf)

long_description = read('README.md')


class PyTest(TestCommand):
    def finalize_options(self):
        TestCommand.finalize_options(self)
        self.test_args = []
        self.test_suite = True

    def run_tests(self):
        import pytest
        errcode = pytest.main(self.test_args)
        sys.exit(errcode)

setup(
    name='xcessiv',
    version='0.4.0',
    url='https://github.com/reiinakano/xcessiv',
    license='Apache License 2.0',
    author='Reiichiro Nakano',
    tests_require=['pytest'],
    install_requires=[
        'bayesian-optimization',
        'Flask>=0.11.0',
        'gevent>=1.1.0',
        'numpy>=1.12.0',
        'redis>=2.10.0',
        'rq>=0.7.0',
        'scikit-learn>=0.18.0',
        'scipy>=0.18.0',
        'six>=1.10.0',
        'SQLAlchemy>=1.1.0',
        'TPOT>=0.8'
    ],
    cmdclass={'test': PyTest},
    author_email='reiichiro.s.nakano@gmail.com',
    description='A web-based application for quick and '
                'scalable construction of massive machine learning ensembles.',
    long_description=long_description,
    packages=find_packages(),
    include_package_data=True,
    platforms='any',
    test_suite='xcessiv.tests',
    classifiers = [
        'Programming Language :: Python',
        'Programming Language :: Python :: 2',
        'Programming Language :: Python :: 2.7',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.5',
        'Programming Language :: JavaScript',
        'Natural Language :: English',
        'Intended Audience :: Developers',
        'Intended Audience :: Science/Research',
        'License :: OSI Approved :: Apache Software License',
        'Operating System :: Unix',
        'Topic :: Scientific/Engineering :: Artificial Intelligence',
        ],
    extras_require={
        'testing': ['pytest'],
    },
    entry_points={
        'console_scripts': [
            'xcessiv = xcessiv.scripts.runapp:main'
        ]
    }
)
