Installation and Configuration
==============================

Xcessiv is currently tested on Python ``2.7`` and Python ``3.5``. Because of its dependency on RQ, Xcessiv does not support Windows but should work on any Unix-based OS.

Installing and running Redis
----------------------------

For Xcessiv to work properly, it must be able to access a running Redis server.

Instructions for installing and running Redis are OS dependent and can be found at https://redis.io/topics/quickstart.

Make sure to take note of the port at which Redis is running, especially if it is not running at the default Redis port 6379.

Installing Xcessiv
------------------

The easiest and recommended way to install Xcessiv is to use pip::

   pip install xcessiv

If you want to install the latest version of Xcessiv from the master branch, you need some extra JavaScript tools to build the ReactJS application.

First, you need to `install Node>=6 <https://docs.npmjs.com/getting-started/installing-node>`_ and `Create React App <https://github.com/facebookincubator/create-react-app#getting-started>`_.

Then, run the following commands to clone the Xcessiv master branch and build and install Xcessiv.::

   git clone https://github.com/reiinakano/xcessiv.git
   cd xcessiv/xcessiv/ui
   npm run build
   cd ..
   cd ..
   python setup.py install

