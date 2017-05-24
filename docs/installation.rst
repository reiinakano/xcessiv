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

Configuration
-------------

To configure Xcessiv outside the default settings, create a Python file at ``{HOME_FOLDER}/.xcessiv/config.py``. Here are the parameters (at their default values) you can copy / paste in that configuration module.::

   #---------------------------------------------------
   # Xcessiv config
   #---------------------------------------------------
   REDIS_HOST = 'localhost'  # Host address of Redis server
   REDIS_PORT = 6379  # Port of Redis Server
   REDIS_DB = 8  # Redis database number to use

   XCESSIV_PORT = 1994  # Port at which to start the Xcessiv server
   NUM_WORKERS = 1  # Number of RQ workers to start

Please note that aside from this configuration file, another way to configure Xcessiv is to directly pass the parameters when starting Xcessiv from the command line. In this case, the configuration variables passed through the command line overrides the the configuration found in ``config.py``. See :ref:`Starting Xcessiv` for details.
