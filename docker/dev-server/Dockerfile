FROM fedora:latest

# Start dev server with test data on plain docker (w/o docker-compose)

RUN dnf -y upgrade \
        && dnf -y install @development-tools \
        && dnf -y install which git npm python bash-completion g++ sqlite

EXPOSE 5984/tcp 5985/tcp

WORKDIR /db
ENV DATA_ROOT /db
RUN git clone https://gitlab.com/niczem/onefleet

# Prepare packages
RUN cd onefleet/services/location \
        && npm install \
        && cd ../database \
        && npm install

# Prepare requirements for testdata injection
RUN cd onefleet/services/location \
        && npm install commander

COPY docker-entrypoint.sh /usr/local/bin/
RUN ln -s /usr/local/bin/docker-entrypoint.sh / # backwards compat
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["database_with_testdata"]
