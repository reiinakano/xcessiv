Installation and Configuration
==============================

Xcessiv is currently tested on Python ``2.7`` and Python ``3.5``. Because of its dependency on RQ, Xcessiv does not support Windows but should work on any Unix-based OS.

Installing and running Redis
----------------------------

For Xcessiv to work properly, it must be able to access a running Redis server.

Instructions for installing and running Redis are OS dependent can be found at https://redis.io/topics/quickstart.

Make sure to take note of the port at which Redis is running, especially if it is not running at the default Redis port 6379.

Installing Xcessiv
------------------

Use pip to install Xcessiv::

   pip install xcessiv

You can also directly install the latest version of Xcessiv from the master branch. To do this, clone the repository at https://github.com/reiinakano/xcessiv and run this command at the root folder::

   python setup.py install

