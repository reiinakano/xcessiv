## Using Xcessiv via Docker

This directory contains a `Dockerfile` for Xcessiv to work regardless of platform.

### Install Docker

The first step is to [install Docker](https://docs.docker.com/installation/) for your operating system.

### Steps to use this image

First, you must run a Redis server that Xcessiv will be able to connect to. You can run the [Redis Docker image](https://hub.docker.com/_/redis/) here if you want. Ensure that your Docker container will be able to communicate with the Redis server by properly configuring [container networking](https://docs.docker.com/engine/userguide/networking/). Additionally, here is a great [StackOverflow post](https://stackoverflow.com/questions/24319662/from-inside-of-a-docker-container-how-do-i-connect-to-the-localhost-of-the-mach) that covers communication from within a Docker container.

Let's say you've figured that our Docker container will be able to communicate with Redis at `172.17.42.1:6379`.

To start Xcessiv with Redis at `172.17.42.1:6379`, simply run:

`$ docker run -P --name='xcessiv' reiinakano/xcessiv xcessiv -H "172.17.42.1" -P 6379`

The `-P` flag for Docker is used to expose port 1994 to the host, so you can use your web browser to interact with Xcessiv at `localhost:1994`.

To save any projects you make with Xcessiv, you'll want to mount your own project folder into the Xcessiv Docker container's project folder. To do this, run:

`$ docker run -P --name='xcessiv' -v /myxcessiv/XcessivProjects/:/XcessivProjects/ reiinakano/xcessiv`

where `/myxcessiv/XcessivProjects/` is the host directory you want to save projects to.

To start Xcessiv with your own configuration file, run:

`$ docker run -P --name='xcessiv' -v /myxcessiv/myconf/config.py:/root/.xcessiv/config.py reiinakano/xcessiv`

where `/myxcessiv/myconf/` is a local directory containing the `config.py` file you want to use.
