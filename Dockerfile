FROM ubuntu:rolling

MAINTAINER cgrant@ou.edu

RUN apt-get update && apt-get install -y locales && rm -rf /var/lib/apt/lists/* \
    && localedef -i en_US -c -f UTF-8 -A /usr/share/locale/locale.alias en_US.UTF-8
ENV LANG en_US.utf8

RUN apt-get update && apt-get upgrade -y && apt-get install -y python3-pip ipython3

RUN python3 -m pip install --upgrade pip && python3 -m pip install click grpcio grpcio-tools pipenv

RUN apt install -y htop vim 

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Copy python code to /user/src/app
COPY requirements.txt /usr/src/app/
RUN python3 -m pip install --ignore-installed --no-cache-dir -r requirements.txt
COPY . /usr/src/app

EXPOSE 5000

ENV PYTHONUNBUFFERED=0

CMD ["python3", "run.py"]
