const PouchDB = require('pouchdb');
const request = require('request');
const sqlite3 = require('sqlite3').verbose();

const MailListener = require("mail-listener2");


const config = require('./config.js');
const program = require('commander');

program
  .option('-t <min>', 'run interval')
  .option('-l', 'fetches locations once')
  .option('-m, --mail', 'activate mail')
  .option('-p, --purchase', 'purchase locations if api key is provided')
  .version('0.0.1');

program.parse(process.argv);
let INTERVAL = program.time || 10;

let service = new function(){
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
  this.initMail = function(){
    console.log('starting mail listener...');
    this.initDBs();
    var self = this;
    console.log('mail init');
    this.initMailListener({
      imap_username:config.imap_username,
      imap_password:config.imap_password,
      imap_host:config.imap_host
      ,

      mail_callback:function(mail, seqno, attributes){
        if(mail)
        self.positionCallback(mail, seqno, attributes);
      }
    });
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
          if(typeof Position != 'undefined' && Position != false && Position.timestamp != 'undefined'){
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
            console.log('there was an error getting the position for '+identifier);
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
  this.fetchAPIs = function(){
    this.initDBs();
    //this.initMail();
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
              if(false&&v.doc.properties.get_historical_data_since > 0){
                self.getHistoricalData(v.doc.properties.MMSI,v.doc.properties.get_historical_data_since, function(positions){
                  console.log(positions);
                  for(let i in positions){
                    
                    console.log('got historical position from AIS:'+v.doc.identifier);
                    console.log(positions[i]);
                    /*
                    self.insertLocation(v.doc.identifier,Position);

                    //update entry in db items, set get_historical_data_since to 0
                    
                    items.put(v.doc).then(function (response) {
                      console.log('item created');
                      console.log(response)
                    }).catch(function (err) {
                      cb(err);
                    });
                    */
                    die();
                  }
                })
              }
            break;

          }
        });
      }
    });

  };
    this.fetchAPIInterval = function(interval_in_minutes){
      var self = this;
      //run on startup at function
      this.fetchAPIs();
      setInterval(function(){
        self.fetchAPIs()
      },interval_in_minutes*1000*60);
    };
    this.parsePositionFromFleetmonApi = function(apiResult){
      if(!apiResult)
        return false
      //die();
        return {
          'mmsi':apiResult.mmsi,
          'latitude':apiResult.latitude,
          'longitude':apiResult.longitude,
          'speed':apiResult.speed,
          'heading':apiResult.heading,
          'course':apiResult.course,
          'timestamp':apiResult.timestamp,
          'source':apiResult.source
        }
    }
    this.getHistoricalData = function(mmsi,days,cb){
      console.log('implement me!');
    }
    this.getPositionFromAIS = function(mmsi,cb){

      let url = 'https://apiv2.fleetmon.com/ais/position/?limit=1&mmsi='+mmsi+'&apikey='+config.fleetmon_api_key;
      let self = this;
      if(config.fleetmon_api_key){
        console.log(url);
        request(url, {json:true}, (err, res, body) => {
          console.log(res);
          if(err&&err.length>0){
            console.log('error fetching position from fleetmon:', err);
            console.log('retry with ais api')
            config.fleetmon_api_key = false;
            self.getPositionFromAIS(mmsi,cb);
          }
          if((body &&(body.ais_position_items >= 1)||typeof body != 'string')){
            if(typeof body.errors != 'undefined'){
              console.log('error fetching position from fleetmon:', err);
              console.log('retry with ais api');
              config.fleetmon_api_key = false;
              self.getPositionFromAIS(mmsi,cb);
            }else{
      console.log(url);
              let i = 0;
              cb(self.parsePositionFromFleetmonApi(body.ais_position_items[0]));
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

  this.initMailListener = function(listener_config){
    var self = this;
    console.log(listener_config);
    var mailListener = new MailListener({
      
      username: listener_config.imap_username,
      password: listener_config.imap_password,
      host: listener_config.imap_host,

      port: 993, // imap port
      tls: true,
      connTimeout: 10000, // Default by node-imap
      authTimeout: 5000, // Default by node-imap,
      debug: console.log, // Or your custom function with only one incoming argument. Default: null
      tlsOptions: { rejectUnauthorized: false },
      mailbox: "INBOX", // mailbox to monitor
      searchFilter: ["UNSEEN"], // the search filter being used after an IDLE notification has been retrieved
      markSeen: true, // all fetched email willbe marked as seen and not fetched next time
      fetchUnreadOnStart: true, // use it only if you want to get all unread email on lib start. Default is `false`,
      mailParserOptions: {streamAttachments: true}, // options to be passed to mailParser lib.
      attachments: true, // download attachments as they are encountered to the project directory
      attachmentOptions: { directory: "attachments/" } // specify a download directory for attachments
    });
    console.log('asdfg');
    mailListener.start(); // start listening

    console.log('asdfg');
    // stop listening
    //mailListener.stop();

    mailListener.on("server:connected", function(){
      console.log("imapConnected");
    });

    mailListener.on("server:disconnected", function(){
      console.log("imapDisconnected");
    });

    mailListener.on("error", function(err){
      console.log('err:');
      console.log(err);
    });

    mailListener.on("mail", function(mail, seqno, attributes){
      console.log('got mail!');
      listener_config.mail_callback(mail, seqno, attributes);
    });
  }
  this.positionCallback = function(mail, seqno, attributes){
        var self = this;
        var sender_mail = this.getEmailsFromString(mail.headers.from);

        console.log('getting vehicles...');

        this.getVehicles(function(err,res){

          console.log('got items');
              if(err)
                console.log( err );

              //loop through vehicles
              for(let i in res){
                if(typeof res[i].doc != 'undefined'){
                  console.log('item #'+i);

                  let item = res[i].doc;
                  console.log(item._id);
                  if(item.properties && item.properties.tracking_type)
                  switch(item.properties.tracking_type){
                    case'IRIDIUMGO':

                      //message looks like "I am here Lat+35.777135 Lon+14.291735 Alt+2554ft GPS Sats seen 09 http://map.iridium.com/m?lat=35.777135&lon=14.291735 http://map.iridium.com/m?lat=35.777135&lon=14.291735 Sent via Iridium GO!"

                      if(sender_mail.indexOf(item.properties.iridium_sender_mail)>-1){
                        
                        console.log('Mail from gateway sender received:');

                        if(mail.text.indexOf('I am here')>-1){
                          let lat = parseFloat(mail.text.substring( mail.text.indexOf('Lat+') + 4,
                                                         mail.text.indexOf('Lon')).trim());

                          let lon = parseFloat(mail.text.substring( mail.text.indexOf('Lon+') + 4,
                                                         mail.text.indexOf('Alt')).trim());

                          let alt = mail.text.substring( mail.text.indexOf('Alt+') + 4,
                                                         mail.text.indexOf('GPS')).trim();

                          alt = parseFloat(alt.replace('ft',''))

                          console.log('adding position to db:')
                          self.insertLocation(res[i].doc.identifier,{
                            timestamp:new Date(mail.headers.date),
                            latitude:lat,
                            longitude:lon,
                            altitude:alt,
                            speed:-1,
                            course:-1
                          });
                        }else{
                          console.log('not a position update, so a new case!');
                        }

                      }else{
                        console.log('Mail is not from gateway sender');
                      }





                    break;
                  }
                }
              }

            });

  }
  /*
  *@strObj string String containg a mail like "Joe Smith <joe.smith@somemail.com>"
  *returns mail (e.g. joe.smith@somemail.com)
  */
  this.getEmailsFromString = function(StrObj) {

        var separateEmailsBy = ", ";
        var email = "<none>"; // if no match, use this
        var emailsArray = StrObj.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
        if (emailsArray) {
            email = "";
            for (var i = 0; i < emailsArray.length; i++) {
                if (i != 0) email += separateEmailsBy;
                email += emailsArray[i];
            }
        }
        return email;
  }

}

  console.log(program.opts());


if (program.T) {
  service.fetchAPIInterval(program.T);
}
if (program.L) {
  service.this.fetchAPIs();
}
if (program.mail) {
  service.initMail();
}

//service.initMail();


