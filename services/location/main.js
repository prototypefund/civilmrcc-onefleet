const PouchDB = require('pouchdb');
const request = require('request');
const sqlite3 = require('sqlite3').verbose();

const config = require('./config.js');

console.log(config);

var service = new function(){

  this.initDBs = function(){
      this.dbConfig = process.env.DEVELOPMENT ? {} : {
        auth: {
          username: config.dbUser,
          password: config.dbPassword,
        }
      };
      console.log(this.dbConfig);
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
          if(typeof Position != 'undefined' && Position.timestamp != 'undefined'){
                                  console.log(Position);
                                  let entry = {
                                    "_id": identifier+"_"+new Date(Position.timestamp).toISOString(),
                                    "lat": Position.latitude,
                                    "lon": Position.longitude,
                                    "heading": Position.course,
                                    "speed": Position.speed,
                                    "item_identifier":identifier,
                                    "source":Position.source||"ais_api",
                                    "timestamp":new Date(Position.timestamp).toISOString()
                                  };
                                  this.locationsDB.put(entry).then(function (response) {
                                    console.log('location created');
                                    console.log(entry);
                                  }).catch(function (err) {
                                    console.log(entry);
                                    console.log(err);
                                  });


                                  var statement = 'INSERT INTO `locations` (`id`, `lat`, `lon`, `speed`, `course`, `timestamp`, `item_identifier`) VALUES ("'+identifier+"_"+new Date(Position.timestamp).toISOString()+'", '+Position.latitude+', '+Position.longitude+', '+Position.speed+', '+Position.course+', '+(new Date(Position.timestamp).getTime()/1000)+', "'+identifier+'")';
                                  //add position for longtime storage
                                  this.sqlite_query(statement,function(){
                                    console.log('location also stored in sqlite');
                                  });

          }else{
            console.log('there was an error getting the position');
          }
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
              console.log(v.doc.properties.get_historical_data_since);
              if(v.doc.properties.get_historical_data_since > -1){
                self.getHistoricalData(v.doc.properties.MMSI,v.doc.properties.get_historical_data_since, function(positions){
                  console.log(positions);
                  for(let i in positions){
                    let Position = {
                      speed:positions[i][2],
                      status:positions[i][1],
                      longitude:positions[i][3],
                      latitude:positions[i][4],
                      course:positions[i][5],
                      heading:positions[i][6],
                      timestamp:positions[i][7]
                    };
                    console.log('got position from AIS:'+v.doc.identifier);
                    console.log(Position);
                    self.insertLocation(v.doc.identifier,Position);

                    //update entry in db items, set get_historical_data_since to 0
                    
                    items.put(v.doc).then(function (response) {
                      console.log('item created');
                      console.log(response)
                    }).catch(function (err) {
                      cb(err);
                    });
                  }
                })
              }
            break;

          }
        });
      }
    });

    };
    this.runInterval = function(interval_in_minutes){
      var self = this;
      //run on startup at function
      this.run();
      setInterval(function(){
        self.run()
      },interval_in_minutes*1000*60);
    };
    this.parsePositionFromMarineTrafficApi = function(apiResult){
        return {
          'mmsi':apiResult[0],
          'latitude':apiResult[1],
          'longitude':apiResult[2],
          'speed':apiResult[3],
          'heading':apiResult[4],
          'course':apiResult[5],
          'status':apiResult[6],
          'timestamp':apiResult[7],
          'source':apiResult[8]
        }
    }
    this.getHistoricalData = function(mmsi,days,cb){
      console.log('get historical data')
      let url = 'https://services.marinetraffic.com/api/exportvesseltrack/'+config.marine_traffic_exportvesseltrack_api_key+'/v:2/period:hourly/days:'+days+'/mmsi:'+mmsi+'/protocol:json';
      let self = this;
      if(config.marine_traffic_exportvesseltrack_api_key){
        request(url, {json:true}, (err, res, body) => {
          if(err){
            console.log('error fetching position from marine traffic:', err);
            console.log('retry with ais api')
            config.marine_traffic_api_key = false;
            self.getPositionFromAIS(mmsi,cb);
          }
          console.log(body)
          if(body && body.length >= 1){
            cb(body);
          }
        });
      }
    }
    this.getPositionFromAIS = function(mmsi,cb){
      let url = 'https://services.marinetraffic.com/api/exportvessel/v:5/'+config.marine_traffic_exportvessel_api_key+'/timespan:2880/mmsi:'+mmsi+'/protocol:json';
      let self = this;
      if(config.marine_traffic_exportvessel_api_key){
        console.log(url);
        request(url, {json:true}, (err, res, body) => {
          if(err){
            console.log('error fetching position from marine traffic:', err);
            console.log('retry with ais api')
            config.marine_traffic_exportvessel_api_key = false;
            self.getPositionFromAIS(mmsi,cb);
          }

            console.log('body');
            console.log(body);
            console.log(body.length);
          if((body &&(body.length >= 1)||typeof body != 'string')){
            console.log('body2');
            console.log(body);
            if(typeof body.errors != 'undefined'){
              console.log('error fetching position from marine traffic:', err);
              console.log('retry with ais api');
              config.marine_traffic_exportvessel_api_key = false;
              self.getPositionFromAIS(mmsi,cb);
            }else{
              let i = 0;
              cb(self.parsePositionFromMarineTrafficApi(body[i]));
            }
          }
        });
      }else{

        console.log(`requesting ${config.aisUrl}/getLastPosition/${mmsi}`);
        request(`${config.aisUrl}/getLastPosition/${mmsi}`, { json: true }, (err, res, body) => {
          if (err) { return console.log(err); }
          if (body.error != null) return console.log(body.error);

          cb(body.data);
        });

      }
    }
}

service.runInterval(5);
