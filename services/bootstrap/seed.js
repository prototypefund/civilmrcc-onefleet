const PouchDB = require('pouchdb');

const sw3 = {
  "_id": "VEHICLE_SW3",
  "properties": {
    "name": "Sea-Watch 3",
    "tracking_type": "AIS",
    "MMSI": "244140096"
  }
};

const db = new PouchDB(`${process.env.DB_URL}/items`);
db.put(sw3);
db.get('VEHICLE_SW3').then((item) => {
  console.log('Created initial item: ', item);
});
