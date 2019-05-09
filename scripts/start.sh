
screen -dmS onefleet_database bash -c 'cd ../services/database && npm run start'
screen -dmS onefleet_location_service bash -c 'cd ../services/location && npm run start'
screen -dmS onefleet_ais_service bash -c 'cd ../services/ais && npm run start'

echo 'asd';