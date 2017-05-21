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

This will run the Xcessiv server and a single worker process with the default settings. You can view the Xcessiv application by pointing your browser at localhost:1994 by default.

To view the full range of settings you can configure using the command line, type::

   xcessiv -h

For example, to run the Xcessiv server along with 3 separate worker processes, run::

   xcessiv -w 3

.. admonition:: A note about worker processes

   Xcessiv doesn't do the heavy processing in its application server. Instead, Xcessiv hands the jobs off to separate RQ worker processes. If you have more than one worker process running, then you will be able to process jobs in parallel without any additional configuration. However, keep in mind that each worker will consume its own CPU and memory. The optimal number of workers will then depend on your dataset size, number of cores, and available system memory.

Creating/Opening a Project
--------------------------

When you open Xcessiv for the first time, you'll see a plain screen and a single button. Click on the button to open the ``Create New Project`` modal. This modal provides all functionality needed to create and open an Xcessiv project.

.. image:: _static/create_open_project.png
   :align: center
   :alt: Create/Open Project Modal

Since XcessivProjects is an empty folder, we won't see any existing projects yet. Create a new project then open it.

Now would be a good time to explain the structure of an Xcessiv project. An Xcessiv project is essentially a folder with a SQLite database and a sub-folder for storing saved meta-features. When you want to share your project with other people, all you need to do is give them a copy of this folder and they will be able to open it using their own Xcessiv installation. Keep in mind that this folder might get very big for large projects with a large number of saved meta-features.

Importing your dataset into Xcessiv
-----------------------------------

After opening your new project, the first thing to do is to define your dataset.

Define the main dataset
~~~~~~~~~~~~~~~~~~~~~~~

First, we must define the main dataset.

.. image:: _static/main_data_extraction.png
   :align: center
   :alt: Main Data Extraction

In the code block shown, you must define a function ``extract_main_dataset`` that takes no arguments and returns a tuple ``(X, y)``, where ``X`` is a Numpy array with shape ``(n_samples, n_features)`` corresponding to the features of your main dataset and ``y`` is the Numpy array corresponding to the ground truth labels of each sample.

Experienced **scikit-learn** users will recognize this format as the one accepted by **scikit-learn** estimators. As a project heavily influenced by the wonderful **scikit-learn** API, this is a theme that will come up repeatedly when using Xcessiv.

Since we're going with the breast cancer sample dataset that comes with scikit-learn, copy the following code into the Main Dataset Extraction code block.::

   from sklearn.datasets import load_breast_cancer

   def extract_main_dataset():
       X, y = load_breast_cancer(return_X_y=True)
       return X, y

Xcessiv gives you the flexibility to extract your dataset any way you want with whatever packages are included in your Python installation. You can open up the quintessential csv file with **pandas**. Or directly download the data from Amazon S3 with **boto**. As long as ``extract_main_dataset`` returns the proper format of your data, any way convenient for you will do. One important thing to keep in mind here is that for every process that needs your data, Xcessiv will call ``extract_main_dataset``. Keeping this function as light as possible is recommended.

Save your dataset extraction code and click the **Calculate Extracted Datasets Statistics** button. This will look for the ``extract_main_dataset`` function in your provided code block and display the shape of ``X`` and ``y``. This is a good way to confirm if your code works properly.

Confirm that ``X`` (Features array) has a shape of ``(569, 30)`` and ``y`` (Labels array) has a shape of ``(569,)``.

