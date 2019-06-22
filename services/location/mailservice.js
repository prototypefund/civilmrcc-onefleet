const MailListener = require("mail-listener2");
const PouchDB = require('pouchdb');
const dJSON = require('dirty-json');
const nodemailer = require('nodemailer');
const sqlite3 = require('sqlite3').verbose();
const smtpTransport = require("nodemailer-smtp-transport");
const config = require('./config.js');

//mail address of inreach service

var mail_service = new function(){

  this.initMail = function(){
    console.log('db init');
    this.initDBs();

    var self = this;

    console.log('mail init');
    this.initMailListener({
      imap_username:config.imap_username,
      imap_password:config.imap_password,
      imap_host:config.imap_host
      ,

      mail_callback:function(mail, seqno, attributes){
        self.positionCallback(mail, seqno, attributes);
      }
    });

  }
  this.initDBs = function(){
      var dbConfig = {
        auth: {
          username: config.dbUser,
          password: config.dbPassword
        }
      };

      //SQLITE is used for long term storage
      this.sqlite =  new sqlite3.Database('./locations.db');
      this.itemsDB = new PouchDB(config.dbUrl+'/items', dbConfig);
      this.locationsDB = new PouchDB(config.dbUrl+'/positions', dbConfig);

  }
  this.getItems = function(callback){
    this.itemsDB.allDocs({
      include_docs: true,
      attachments: true
    }).then(function (result) {
      // handle result
      callback(false,result.rows);
    }).catch(function (err) {
      callback(err);
    });

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

        this.getItems(function(err,res){

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
  };
  this.insertLocation = function(identifier,Position){
      if(typeof Position != 'undefined' && Position.timestamp != 'undefined'){
                              console.log(Position);
                              this.locationsDB.put(
                              {
                                "_id": identifier+"_"+new Date(Position.timestamp).toISOString(),
                                "lat": Position.latitude,
                                "lon": Position.longitude,
                                "heading": Position.course,
                                "altitude": Position.altitude,
                                "speed": Position.speed,
                                "item_identifier":identifier,
                                "source":"ais_api",
                                "timestamp":new Date(Position.timestamp).toISOString()
                              }).then(function (response) {
                                console.log(response);
                                console.log('location created');
                              }).catch(function (err) {
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

}

mail_service.init();
