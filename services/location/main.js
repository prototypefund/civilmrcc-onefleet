const PouchDB = require('pouchdb');
const request = require('request');
const sqlite3 = require('sqlite3').verbose();

const config = {
  aisUrl: process.env.AIS_API,
  dbUrl: process.env.DB_URL,
  dbUser: process.env.DB_USER || null,
  dbPassword: process.env.DB_PASSWORD || null,
};

var service = new function(){

  this.initDBs = function(){
      this.dbConfig = process.env.DEVELOPMENT ? {} : {
        auth: {
          username: config.dbUser,
          password: config.dbPassword,
        }
      };
      this.itemDB = new PouchDB(`${config.dbUrl}/items`, this.dbConfig);
      this.locationsDB = new PouchDB(`${config.dbUrl}/positions`, this.dbConfig);

      //SQLITE is used for long term storage
      this.sqlite =  new sqlite3.Database('./locations.db');
  }
  this.sqlite_query = function(sql,cb){

    var self = this;
    this.sqlite.all(sql, [], (err, rows) => {
      if (err&&err.errno==1) {
        console.log(err);
        self.createTable(function(){
          console.log('locations table created');
          self.sqlite_query(sql,cb);
        });
      }else{
        cb(rows)
      }
    });
  }
  this.createTable = function(cb){
    console.log('creating locations table');
    this.sqlite.run("CREATE TABLE IF NOT EXISTS `locations` ( \
      `id` varchar(255) NOT NULL,\
      `item_identifier` varchar(255) NOT NULL,\
      `lat` decimal(11,8) NOT NULL,\
      `lon` decimal(11,8) NOT NULL,\
      `speed` float NOT NULL,\
      `course` float NOT NULL,\
      `timestamp` int(11) NOT NULL\
    )",{},cb);
  };
  this.insertLocation = function(identifier,Position){
                                  this.locationsDB.put(
                                  {
                                    "_id": identifier+"_"+new Date(Position.timestamp).toISOString(),
                                    "lat": Position.latitude,
                                    "lon": Position.longitude,
                                    "heading": Position.course,
                                    "speed": Position.speed,
                                    "item_identifier":identifier,
                                    "source":"ais_api",
                                    "timestamp":new Date(Position.timestamp).toISOString()
                                  }).then(function (response) {
                                    console.log('location created');
                                  }).catch(function (err) {
                                    console.log(err);
                                  });


                                  var statement = 'INSERT INTO `locations` (`id`, `lat`, `lon`, `speed`, `course`, `timestamp`, `item_identifier`) VALUES ("'+identifier+"_"+new Date(Position.timestamp).toISOString()+'", '+Position.latitude+', '+Position.longitude+', '+Position.speed+', '+Position.course+', '+(new Date(Position.timestamp).getTime()/1000)+', "'+identifier+'")';
                                  //add position for longtime storage
                                  this.sqlite_query(statement,function(){
                                    console.log('location also stored in sqlite');
                                  });
  }

  this.getVehicles = function(callback){

        var items = this.itemDB;
        var self = this;
        items.allDocs({
          include_docs: true,
          attachments: true,
          startkey: 'VEHICLE',
        }).then(function (result) {
            if(result.error)
                callback(err);
            else
                callback(false,result.rows);
          // handle result
        }).catch(function (err) {

          console.log('error while getting vehicles: ',err);
        });
  }

  this.run = function(){
    this.initDBs();
    var self = this;

    this.getVehicles(function(err,res){
      if(err){
        console.log(err);
      }else{
        res.forEach(function(v,i){
          switch(v.doc.properties.tracking_type){
            case 'AIS':
              console.log('get position from AISs for vehicle '+v.doc.properties.name);
              self.getPositionFromAIS(v.doc.properties.MMSI,function(Position){
                                  console.log('got position from AIS:'+v.doc.identifier);
                                  console.log(Position);
                                  self.insertLocation(v.doc.identifier,Position);

              });
            break;
          }
        });
      }
    });

    };
    this.runInterval = function(interval_in_minutes){
      var self = this;
      setInterval(function(){
        self.run()
      },interval_in_minutes*1000*60);
    };
    this.getPositionFromAIS = function(mmsi,cb){
      console.log()
      request(`${config.aisUrl}/getLastPosition/${mmsi}`, { json: true }, (err, res, body) => {
        if (err) { return console.log(err); }
        if (body.error != null) return console.log(body.error);

        cb(body.data);
      });

    }
}

service.runInterval(1);
