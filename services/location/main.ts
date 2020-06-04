const pouchDB = require('pouchdb');
const request = require('request');

const moment = require('moment');

const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');

const MailListener = require('mail-listener2');

const config = require('./config.js');
const program = require('commander');

program
  .option('-t <min>', 'run interval')
  .option('-c <number>', 'generate testcases')
  .option('-i <filename>', 'import from csv file')
  .option('-l', 'fetches locations once')
  .option('-d <date>', 'delete locations older than ')
  .option('-m, --mail', 'activate mail')
  .option('-p, --purchase', 'purchase locations if api key is provided')
  .version('0.0.1');

program.parse(process.argv);
let INTERVAL = program.time || 10;

/**
 * LocationService
 */
class LocationService {
  dbConfig: any;
  itemDB: any;
  locationsDB: any;

  public initDBs() {
    this.dbConfig = process.env.DEVELOPMENT
      ? {}
      : {
          auth: {
            username: config.dbUser,
            password: config.dbPassword,
          },
        };
    console.log(this.dbConfig);
    this.itemDB = new pouchDB(
      `${config.dbUrl}/${config.dbPrefix}items`,
      this.dbConfig
    );
    this.locationsDB = new pouchDB(
      `${config.dbUrl}/${config.dbPrefix}positions`,
      this.dbConfig
    );
  }

  public initMail() {
    console.log('starting mail listener...');
    this.initDBs();
    console.log('mail init');
    this.initMailListener({
      imap_username: config.imap_username,
      imap_password: config.imap_password,
      imap_host: config.imap_host,
      mail_callback: (mail, seqno, attributes) => {
        if (mail) this.positionCallback(mail, seqno, attributes);
      },
    });
  }

  public insertLocation(identifier, Position) {
    if (
      typeof Position != 'undefined' &&
      Position != false &&
      Position.timestamp != 'undefined'
    ) {
      console.log(Position);
      let entry = {
        _id: identifier + '_' + new Date(Position.timestamp).toISOString(),
        lat: Position.latitude,
        lon: Position.longitude,
        heading: Position.course,
        speed: Position.speed,
        item_identifier: identifier,
        source: Position.source || 'ais_api',
        altitude: Position.altitude || -1,
        timestamp: new Date(Position.timestamp).toISOString(),
      };
      this.locationsDB
        .put(entry)
        .then(function(response) {
          console.log('location created');
          console.log(entry);
        })
        .catch(function(err) {
          console.log(entry);
          console.log(err);
        });
    } else {
      console.log('there was an error getting the position for ' + identifier);
    }
  }

  public insertItem(obj, cb) {
    var itemDB = this.itemDB;
    itemDB
      .put(obj)
      .then(function(response) {
        cb(null, response);
      })
      .catch(function(err) {
        cb(err);
      });
  }

  public getItems(identifier, callback) {
    var items = this.itemDB;
    items
      .allDocs({
        include_docs: true,
        attachments: true,
        startkey: identifier,
      })
      .then(function(result) {
        if (result.error) callback(result.error);
        else callback(false, result.rows);
        // handle result
      })
      .catch(function(err) {
        console.log('error while getting vehicles: ', err);
      });
  }

  public fetchAPIs() {
    this.initDBs();
    //this.initMail();
    this.getItems('VEHICLE', (err, res) => {
      if (err) {
        console.log(err);
      } else {
        res.forEach((v, i) => {
          switch (v.doc.properties.tracking_type) {
            case 'AIS':
              console.log(
                'get position from AISs for vehicle ' + v.doc.properties.name
              );
              this.getPositionFromAIS(v.doc.properties.MMSI, Position => {
                console.log('got position from AIS:' + v.doc.identifier);
                console.log(Position);
                this.insertLocation(v.doc.identifier, Position);
              });
              console.log(v.doc.properties.get_historical_data_since);
              if (false && v.doc.properties.get_historical_data_since > 0) {
                // this.getHistoricalData(
                //   v.doc.properties.MMSI,
                //   v.doc.properties.get_historical_data_since,
                //   (positions) => {
                //     console.log(positions);
                //     for (let i in positions) {
                //       console.log(
                //         'got historical position from AIS:' + v.doc.identifier
                //       );
                //       console.log(positions[i]);
                //       /*
                //     this.insertLocation(v.doc.identifier,Position);
                //     //update entry in db items, set get_historical_data_since to 0
                //     items.put(v.doc).then(function (response) {
                //       console.log('item created');
                //       console.log(response)
                //     }).catch(function (err) {
                //       cb(err);
                //     });
                //     */
                //       die();
                //     }
                //   }
                // );
              }
              break;
          }
        });
      }
    });
  }

  public fetchAPIInterval(interval_in_minutes) {
    //run on startup at function
    this.fetchAPIs();
    setInterval(() => {
      this.fetchAPIs();
    }, interval_in_minutes * 1000 * 60);
  }

  public parsePositionFromFleetmonApi(apiResult) {
    if (!apiResult) return false;
    //die();
    return {
      mmsi: apiResult.mmsi,
      latitude: apiResult.latitude,
      longitude: apiResult.longitude,
      speed: apiResult.speed,
      heading: apiResult.heading,
      course: apiResult.course,
      timestamp: apiResult.timestamp,
      source: apiResult.source,
    };
  }

  public getHistoricalData(mmsi, days, cb) {
    console.log('implement me!');
  }

  public getPositionFromAIS(mmsi, cb) {
    let url =
      'https://apiv2.fleetmon.com/ais/position/?limit=1&sort=desc&mmsi=' +
      mmsi +
      '&apikey=' +
      config.fleetmon_api_key;
    let fallbackCallback = () => {
      console.log(`requesting ${config.aisUrl}/getLastPosition/${mmsi}`);
      request(
        `${config.aisUrl}/getLastPosition/${mmsi}`,
        { json: true },
        (err, res, body) => {
          if (err) {
            return console.log(err);
          } else {
          }
          if (body.error != null) return console.log(body.error);

          cb(body.data);
        }
      );
    };
    if (config.fleetmon_api_key) {
      request(url, { json: true }, (err, res, body) => {
        if (err && err.length > 0) {
          console.log('error fetching position from fleetmon:', err);
          console.log('retry with ais api');
          config.fleetmon_api_key = false;
          this.getPositionFromAIS(mmsi, cb);
        }
        if ((body && body.ais_position_items >= 1) || typeof body != 'string') {
          if (typeof body.errors != 'undefined') {
            console.log('error fetching position from fleetmon:', err);
            console.log('retry with ais api');
            config.fleetmon_api_key = false;
            this.getPositionFromAIS(mmsi, cb);
          } else {
            let i = 0;
            console.log(body);
            if (typeof body.ais_position_items != 'undefined')
              cb(this.parsePositionFromFleetmonApi(body.ais_position_items[0]));
            else fallbackCallback();
          }
        }
      });
    } else fallbackCallback();
  }

  public initMailListener(listener_config) {
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
      mailbox: 'INBOX', // mailbox to monitor
      searchFilter: ['UNSEEN'], // the search filter being used after an IDLE notification has been retrieved
      markSeen: true, // all fetched email willbe marked as seen and not fetched next time
      fetchUnreadOnStart: true, // use it only if you want to get all unread email on lib start. Default is `false`,
      mailParserOptions: { streamAttachments: true }, // options to be passed to mailParser lib.
      attachments: true, // download attachments as they are encountered to the project directory
      attachmentOptions: { directory: 'attachments/' }, // specify a download directory for attachments
    });
    console.log('asdfg');
    mailListener.start(); // start listening

    console.log('asdfg');
    // stop listening
    //mailListener.stop();

    mailListener.on('server:connected', function() {
      console.log('imapConnected');
    });

    mailListener.on('server:disconnected', function() {
      console.log('imapDisconnected');
    });

    mailListener.on('error', function(err) {
      console.log('err:');
      console.log(err);
    });

    mailListener.on('mail', function(mail, seqno, attributes) {
      console.log('got mail!');
      listener_config.mail_callback(mail, seqno, attributes);
    });
  }

  public positionCallback(mail, seqno, attributes) {
    var sender_mail = this.getEmailsFromString(mail.headers.from);

    console.log('getting vehicles...');

    this.getItems('VEHICLE', (err, res) => {
      console.log('got items');
      if (err) console.log(err);

      //loop through vehicles
      for (let i in res) {
        if (typeof res[i].doc != 'undefined') {
          console.log('item #' + i);

          let item = res[i].doc;
          console.log(item._id);
          if (item.properties && item.properties.tracking_type)
            switch (item.properties.tracking_type) {
              case 'IRIDIUMGO':
                //message looks like "I am here Lat+35.777135 Lon+14.291735 Alt+2554ft GPS Sats seen 09 http://map.iridium.com/m?lat=35.777135&lon=14.291735 http://map.iridium.com/m?lat=35.777135&lon=14.291735 Sent via Iridium GO!"

                if (
                  sender_mail.indexOf(item.properties.iridium_sender_mail) > -1
                ) {
                  console.log('Mail from gateway sender received:');

                  if (mail.text.indexOf('I am here') > -1) {
                    let lat = parseFloat(
                      mail.text
                        .substring(
                          mail.text.indexOf('Lat+') + 4,
                          mail.text.indexOf('Lon')
                        )
                        .trim()
                    );

                    let lon = parseFloat(
                      mail.text
                        .substring(
                          mail.text.indexOf('Lon+') + 4,
                          mail.text.indexOf('Alt')
                        )
                        .trim()
                    );

                    let alt = mail.text
                      .substring(
                        mail.text.indexOf('Alt+') + 4,
                        mail.text.indexOf('GPS')
                      )
                      .trim();

                    alt = parseFloat(alt.replace('ft', ''));

                    console.log('adding position to db:');
                    this.insertLocation(res[i].doc.identifier, {
                      timestamp: new Date(mail.headers.date),
                      latitude: lat,
                      longitude: lon,
                      altitude: alt,
                      speed: -1,
                      course: -1,
                      source: 'iridium_mailservice',
                    });
                  } else {
                    // TODO: alke + jula: Add else branch for DropPoint
                    console.log('not a position update, so a new case!');
                  }
                } else {
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
  public getEmailsFromString(StrObj) {
    var separateEmailsBy = ', ';
    var email = '<none>'; // if no match, use this
    var emailsArray = StrObj.match(
      /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi
    );
    if (emailsArray) {
      email = '';
      for (var i = 0; i < emailsArray.length; i++) {
        if (i != 0) email += separateEmailsBy;
        email += emailsArray[i];
      }
    }
    return email;
  }

  private getRandomElement(inputArray: any[]) {
    return inputArray[Math.floor(Math.random() * inputArray.length)];
  }

  //@int i number of cases
  public generateTestCases(number_of_cases) {
    this.initDBs();
    //start identifier
    let start_identifier = 13;

    let objects = [];
    let i = 0;
    while (i <= number_of_cases) {
      //NEEDS TO BE UPDATED AFTER EVERY CHANGE OF template.js!!!
      let item = {
        _id: 'CASE_' + (start_identifier + i),
        properties: {
          status: this.getRandomElement([
            'closed',
            'attended',
            'possible_target',
            'confirmed',
            'critical',
          ]),
          boat_type: this.getRandomElement(['wood', 'rubber']),
          pob_total: Math.round(Math.random() * 100),
          pob_women: Math.round(Math.random() * 100),
          pob_men: Math.round(Math.random() * 100),
          pob_minors: Math.round(Math.random() * 100),
          pob_medical_cases: Math.round(Math.random() * 100),
          actors_involved: this.getRandomElement([
            'SW3, COL',
            'SW3',
            'LYCG, MOO',
          ]),
          people_drowned: Math.round(Math.random() * 100),
          people_missing: Math.round(Math.random() * 100),
        },
        template: 'case',
        identifier: start_identifier + i,
      };

      this.itemDB
        .put(item)
        .then(
          (i => {
            return response => {
              console.log('item created');

              let entry = {
                _id: start_identifier + i + '_' + new Date().toISOString(),
                lat: 35 + Math.random(),
                lon: 13 + Math.random(),
                heading: Math.round(Math.random() * 100),
                speed: Math.round(Math.random() * 10),
                item_identifier: start_identifier + i,
                source: 'testcase',
                altitude: null,
                timestamp: new Date().toISOString(),
              };
              this.locationsDB
                .put(entry)
                .then(function(response) {
                  console.log('location created');
                  console.log(entry);
                })
                .catch(function(err) {
                  console.log(entry);
                  console.log(err);
                });
            };
          })(i)
        )
        .catch(function(err) {
          console.log(err);
        });
      i++;
    }
    console.log(objects);
  }

  public importFromCSV(filename) {
    /*
    usage for large csv:
    1. split up file to smaller filers:
    split -l 100 import.csv split/
    2. read header:
      FILES=./split/*
      for f in $FILES
      do
        echo -e "\"timestamp\",\"mmsi\",\"lat\",\"lon\",\"status\",\"course\",\"speed\",\"heading\",\"name\",\"callsign\",\"imo\",\"vt_id\",\"vt_code\",\"vt_verbose\",\"destination\",\"eta\",\"draught\",\"length\",\"width\",\"timestamp_svd\",\"sat\"\n$(cat $f)" > $f
      done
    */

    this.initDBs();
    //get all vehicles from db
    this.getItems('VEHICLE', (err, res) => {
      console.log('got items');
      if (err) throw err;

      //restore items with mmsi as identifier
      let vehiclesByMMSI = {};
      for (let i in res) {
        if (typeof res[i].doc.properties.MMSI != 'undefined') {
          vehiclesByMMSI[res[i].doc.properties.MMSI] = res[i];
        }
      }

      console.log(path.resolve(__dirname, '', filename));
      //loop one time over import.csv to add all items upfront
      /*fs.createReadStream(path.resolve(__dirname, '', filename))
        .pipe(csv.parse({ headers: true }))
        .on('error', error => console.error('ERRRRROR',error))
        .on('data', row => {

          console.log('DATA123');


          if(row.callsign.length === 0)
            row.callsign = row.mmsi;
          if(row.name.length === 0)
            row.name = row.callsign;

          console.log('get vehicle with mmsi '+row.mmsi);
          if(!vehiclesByMMSI[parseInt(row.mmsi)]){
            let identifier = String('VEHICLE' + '_' + row.name.replace(/[&\/\\#,+ ()$~%.'":*?<>{}]/g, '')).toUpperCase();
            console.log('no found! create item '+identifier);
            let item = {
              //generate id like VEHICLE_SHIPSNAME
              _id: identifier,
              template:'vehicle',
              identifier:identifier,
              properties:{
                MMSI:row.mmsi,
                active: "true",
                air: "false",
                get_historical_data_since: "0",
                name: row.name,
                tracking_type: "ais"
              }
            }
            this.insertItem(item, function(err, result) {
              if (err) {
                if (err.name == 'conflict')
                  console.log('The id is already taken, please choose another one');
                else console.log('An unknown error occured while creating the item');
              } else if (result.ok == true) {
                vehiclesByMMSI[parseInt(row.mmsi)] = item;
                console.log(`Vehicle ${row.name} created. add position...`);
              }else{
                console.log(result);
              }
            });
          }else{
            console.log('vehicle exists')
          }
        })
        .on('end', rowCount => function(){
          this.insertPositions(vehiclesByMMSI);
        });*/

      this.insertPositions(vehiclesByMMSI, filename);
    });
  }

  private insertPositions(vehiclesByMMSI, filename) {
    fs.createReadStream(path.resolve(__dirname, '', filename))
      .pipe(csv.parse({ headers: true }))
      .on('error', error => console.error(error))
      .on('data', row => {
        let vehicle = vehiclesByMMSI[parseInt(row.mmsi)];
        let pos = {
          timestamp: new Date(row.timestamp),
          latitude: parseFloat(row.lat),
          longitude: parseFloat(row.lon),
          altitude: null,
          speed: parseFloat(row.speed),
          course: parseFloat(row.course),
          source: 'import',
        };

        if (vehiclesByMMSI[parseInt(row.mmsi)]) {
          if (row.callsign.length === 0) row.callsign = row.mmsi;
          if (row.name.length === 0) row.name = row.callsign;

          let identifier = String(
            'VEHICLE' +
              '_' +
              row.name.replace(/[&\/\\#,+ ()$~%.'":*?<>{}]/g, '')
          ).toUpperCase();
          let vehicle = vehiclesByMMSI[parseInt(row.mmsi)];
          console.log(`vehicle ${row.name} exists in db. add position...`);
          this.insertLocation(vehicle.doc.identifier, pos);
        }
      })
      .on(
        'end',
        rowCount2 =>
          function() {
            console.log('fin.');
          }
      );
  }

  private importHistoricalData() {}

  public deletePositionsOlderThan = async function(olderThanDate) {
    console.log('delete positions older than ' + olderThanDate);

    const parsedDate = moment(olderThanDate, [
      'DD/MM/YYYY',
      'DD.MM.YYYY',
      'DD-MM-YYYY',
    ]);
    if (!parsedDate.isValid()) {
      return console.error('error! date should be in the format DD/MM/YYYY');
    }
    olderThanDate = parsedDate.toDate();

    this.initDBs();
    let locations = this.locationsDB;
    const self = this;

    let toDelete = 0;
    let deleted = 0;
    let result = await locations.allDocs({
      include_docs: true,
      attachments: true,
    });

    if (result.error) console.log(result.error);
    else {
      // handle result
      for (let i in result.rows) {
        let position = result.rows[i];
        let positionDate = new Date(position.id.split('_')[1]);

        if (positionDate.getTime() <= olderThanDate.getTime()) {
          toDelete++;
          console.log('deleting ' + position.id + ' ...');
          let res = await locations.remove(position.doc._id, position.doc._rev);
          console.log(res);
          deleted++;
          console.log(deleted + '/' + toDelete);
        }
      }
    }
  };
}

let service = new LocationService();

if (program.T) {
  service.fetchAPIInterval(program.T);
}
if (program.L) {
  service.fetchAPIs();
}
if (program.mail) {
  service.initMail();
}
if (program.C) {
  service.generateTestCases(program.C);
}
if (program.I) {
  service.importFromCSV(program.I);
}
if (program.D) {
  service.deletePositionsOlderThan(program.D);
}
//service.initMail();
