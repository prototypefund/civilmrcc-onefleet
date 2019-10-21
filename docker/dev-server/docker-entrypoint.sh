#!/bin/bash

set -e

export DB_URL="http://127.0.0.1:5984"
export DB_USER="admin"
export DB_PASSWORD="empty"
export DB_PREFIX="testprefix_"

NUM_TESTDATA_RECORDS="10"

if [ "$1" = "database_with_testdata" ]; then
    # Activate job control to re-attach to db server after init
    set -m

    # Start server
    cd "${DATA_ROOT}"/onefleet/services/database
    npm run start &
    # Wait for start
    sleep 3

    # Init DB and generate test data
    curl -kv -X PUT "${DB_URL}/_config/admins/${DB_USER}" -d '"'"${DB_PASSWORD}"'"'
    cd "${DATA_ROOT}"/onefleet/services/location
    cp example-config.js config.js
    sed -i '/DB_PASSWORD/ a\    dbPrefix: "'"${DB_PREFIX}"'",' config.js
    node main.js -c "${NUM_TESTDATA_RECORDS}"

    # Get back to DB server
    cd "${DATA_ROOT}"/onefleet/services/database
    fg
    exit 0
fi

exec "$@"
