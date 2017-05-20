Walkthrough of Typical Xcessiv Workflow
=======================================

This guide aims to demonstrate the power and flexibility of Xcessiv by walking you through a typical Xcessiv workflow. We'll optimize our performance on the breast cancer sample dataset that comes with the scikit-learn library.

Starting Xcessiv
----------------

First, make sure your Redis server is up and running. In most cases, Redis will be running at its default port of 6379.

Open up your terminal and move to your working directory. Let's make a directory called XcessivProjects and move inside it::

   mkdir XcessivProjects
   cd XcessivProjects

XcessivProjects will contain all projects we create with Xcessiv.

To run Xcessiv in the current directory, we simply run::

   xcessiv

This will run the Xcessiv server and a single worker process with the default settings.

To view the full range of settings you can pass using the command line, type::

   xcessiv -h

For example, to run the Xcessiv server along with 3 separate worker processes, run::

   xcessiv -w 3

.. admonition:: A note about worker processes

   Xcessiv doesn't do the heavy processing in its application server. Instead, Xcessiv hands the jobs off to separate RQ worker processes. If you have more than one worker process running, then you will be able to process jobs in parallel without any additional configuration. However, keep in mind that each worker will consume its own memory. The optimal number of workers will then depend on your dataset size, number of cores, and available system memory.
