FROM node:0.12.4
MAINTAINER Emiliano Burgos <emiliano@wework.com>

ENV TARGET_DIR /opt/menagerie

RUN mkdir $TARGET_DIR
WORKDIR $TARGET_DIR

ENV DEBIAN_FRONTEND noninteractive

RUN npm i -g pm2@0.15.7

# ADD .ssh/id_rsa /root/.ssh/id_rsa
# RUN ssh-keyscan -t rsa github.com > /root/.ssh/known_hosts
# RUN echo "IdentityFile ~/.ssh/id_rsa" >> /etc/ssh/ssh_config

# add package.json files to the /tmp director and npm install
# each component
COPY package.json /tmp/package.json
RUN grep MemFree /proc/meminfo
RUN cd /tmp && npm install --quiet

# Move each of the main components node_modules files
RUN cp -a /tmp/node_modules $TARGET_DIR

ENV DEBUG *

#COPY . $TARGET_DIR <= we copy everything, including node_modules :(
COPY api $TARGET_DIR/api
COPY assets $TARGET_DIR/assets
COPY config $TARGET_DIR/config
COPY lib $TARGET_DIR/lib
COPY tasks $TARGET_DIR/tasks
COPY views $TARGET_DIR/views
COPY test $TARGET_DIR/test
COPY Makefile $TARGET_DIR/Makefile
COPY Gruntfile.js $TARGET_DIR/Gruntfile.js
COPY package.json $TARGET_DIR/package.json
COPY app.js $TARGET_DIR/app.js

COPY data $TARGET_DIR/data
COPY init-data $TARGET_DIR/init-data

EXPOSE 1337

CMD ["node", "app.js"]
