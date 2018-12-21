
echo "Please enter the URL of your  couchDB instance and press [ENTER]:"

read db_url

#db_url="http://159.89.111.136:5984"

#Create Items DB
curl -X PUT "${db_url}/items"

#Create Positions DB
curl -X PUT "${db_url}/positions"


#Create SW3 Item
curl -X PUT "${db_url}/items/VEHICLE_SW3" -d '{"_id": "VEHICLE_SW3","key": "VEHICLE_SW3","doc": {"identifier": "SW3","template": "vehicle","properties": { "name": "Sea-Watch 3","tracking_type": "AIS","MMSI": "244140096"}}}'