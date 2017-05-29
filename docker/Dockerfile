FROM python:2

MAINTAINER Reiichiro Nakano <reiichiro.s.nakano@gmail.com>

RUN pip --no-cache-dir install \
        numpy \
        scipy \
        sklearn \
        pandas \
        SQLAlchemy \
        Flask \
        gevent \
        redis \
        rq \
        six \
        xcessiv

RUN mkdir /XcessivProjects

EXPOSE 1994

WORKDIR "/XcessivProjects"

CMD ["xcessiv"]
