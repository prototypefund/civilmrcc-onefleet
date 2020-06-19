import moment from 'moment';
import config from '../../config/config.js';
import { serverBus } from '../main';
import { PouchWrapper } from './pouchWrapper';
import { ReplayOptions } from '../types/replay-options';
import { DbItem } from '../types/db-item';
import { DbPosition } from '../types/db-position';

export class DbWrapper extends PouchWrapper {
  constructor() {
    super(config);
  }

  public getPositionsForItem(identifier: string, cb: Function) {
    this.getDB('positions')
      .allDocs({
        include_docs: true,
        attachments: true,
        startkey: identifier,
        endkey: identifier + '\uffff',
        limit: 10000,
        skip: 0,
        descending: false,
      })
      .then(result => {
        //quick fix
        //this has to be put to the server site
        if (result.rows.length > 1000) {
          result.rows = result.rows.splice(-1000);
        }
        if (result.error) return this.fetchError(result);
        cb(result);
        // handle result
      })
      .catch(err => {
        this.fetchError(err);
      });
  }

  public createPosition(obj: DbPosition, cb: Function) {
    this.getDB('positions', false, 'remote')
      .put(obj)
      .then(response => {
        cb(null, response);
      })
      .catch(err => {
        cb(err);
      });
  }

  public createItem(obj: DbItem, cb: Function) {
    var itemDB = this.getDB('items');
    itemDB
      .put(obj)
      .then(response => {
        cb(null, response);
      })
      .catch(err => {
        cb(err);
      });
  }

  public updateItem(obj: DbItem, cb: Function) {
    //in pouch create and update actually is the same function
    //an item will be updated if the id and a rev already exists
    return this.createItem(obj, cb);
  }

  public getItem(itemId: string, cb: Function) {
    this.getDB('items')
      .get(itemId)
      .then(doc => {
        this.getPositionsForItem(doc.identifier, positions => {
          var item = {
            id: doc._id,
            doc: doc,
            positions: positions.rows,
          };
          cb(item);
        });
      })
      .catch(err => {
        console.error(err);
      });
  }

  public getBaseItems() {
    return this.getDB('items').allDocs({
      include_docs: true,
      attachments: true,
    });
  }

  public getBasePositions() {
    return this.getDB('positions').allDocs({
      include_docs: true,
      attachments: true,
      limit: 10000,
      skip: 0,
      descending: false,
    });
  }

  public getItems(cb: Function) {
    var items = this.getDB('items');
    items
      .allDocs({
        include_docs: true,
        attachments: true,
      })
      .then(result => {
        if (result.error) return this.fetchError(result);

        result.rows.forEach((v, i) => {
          result.rows[i]['positions'] = [];
          this.getPositionsForItem(v.doc.identifier, positions => {
            //append positions to vehicles:
            result.rows[i].positions = positions.rows;

            cb(null, result);
          });
        });
        // handle result
      })
      .catch(err => {
        cb(err);
      });
  }

  public getItemsByTemplate(template: string, cb: Function) {
    this.getDB('items')
      .allDocs({
        include_docs: true,
        attachments: true,
        startkey: template,
        endkey: template + '\uffff',
      })
      .then(result => {
        if (result.error) return this.fetchError(result);
        if (result.rows.length == 0) return cb(null, []);

        result.rows.forEach((v, i) => {
          //HAS TO BE REPLACED WITH PROMISE!
          this.getPositionsForItem(v.doc.identifier, positions => {
            //append positions to vehicles:
            if (positions.rows) result.rows[i].positions = positions.rows;

            if (i >= result.rows.length - 1) cb(null, result);
          });
        });

        // handle result
      })
      .catch(err => {
        console.error(err);
        cb(err);
      });
  }
  public getVehicles(cb: Function) {
    this.getItemsByTemplate('VEHICLE', cb);
  }
  public appendItemsToMap(map) {
    this.getItems((err, result) => {
      for (var i in result.rows) {
        var item = result.rows[i];
        //add onclick option to itemobject

        map.addItemToMap(item);
      }
    });
  }

  public updateShownItemsOnMap(map, options) {
    //item is here not the same as an item in the database
    //it could be a L.marker, L.polygon etc

    //map.clearMap();

    for (var identifier in options.shown_items) {
      if (options.shown_items[identifier] == 'true')
        this.getItem(identifier, result => {
          options.map.updateItemPosition(result);
        });
      else options.map.hideItem(identifier);
    }
  }

  /**
   * Method starts timelapse replay
   */
  public startReplay(options: ReplayOptions, cb: Function) {
    let start_interval = () => {
      let currentDate = moment(options.startDate);

      let interval = setInterval(() => {
        currentDate.add(options.hoursPerFrame, 'hours');
        localStorage.settings_track_enddate = currentDate.format(
          'YYYY-MM-DTHH:MM'
        );

        serverBus.$emit('replay_next_tick', currentDate);

        for (let i in replay_items) {
          this.getItem(replay_items[i].id, loadeditem => {
            let templatedItem = options.map.loadTemplatedItem(loadeditem);
            console.log(templatedItem);
            options.map.updateItemPosition(templatedItem);
          });
        }

        if (currentDate.unix() >= moment(options.endDate).unix()) {
          alert('replay finished');
          clearInterval(interval);
          localStorage.settings_max_track_type =
            old_tracking_value.tracking_type;
          if (old_tracking_value.settings_track_startdate)
            localStorage.settings_track_startdate =
              old_tracking_value.settings_track_startdate;
          if (old_tracking_value.settings_track_enddate)
            localStorage.settings_track_enddate =
              old_tracking_value.settings_track_enddate;
          if (old_tracking_value.settings_map_track_length)
            localStorage.settings_map_track_length =
              old_tracking_value.settings_map_track_length;
          cb();
        }
      }, Number(options.frameLength) * 1000);
    };

    console.log('Start replay with following options:', options);
    //store old tracking type to
    //to reset map after replay
    let old_tracking_value: any = {};
    if (localStorage.settings_max_track_type) {
      old_tracking_value = {
        tracking_type: localStorage.settings_max_track_type,
      };
      if (localStorage.settings_track_startdate)
        old_tracking_value.settings_track_startdate =
          localStorage.settings_track_startdate;
      if (localStorage.settings_track_enddate)
        old_tracking_value.settings_track_enddate =
          localStorage.settings_track_enddate;
      if (localStorage.settings_map_track_length)
        old_tracking_value.settings_map_track_length =
          localStorage.settings_map_track_length;
    }

    //set tracking type, start_date and end_date
    localStorage.settings_max_track_type = 'date_range';
    localStorage.settings_track_startdate = options.startDate;
    localStorage.settings_track_enddate = options.endDate;

    //cleanup old positions
    for (let o in options.map.loaded_items) {
      if (options.map.loaded_items[o].marker)
        options.map.loaded_items[o].marker.remove();
      if (options.map.loaded_items[o].line)
        options.map.loaded_items[o].line.remove();

      delete options.map.loaded_items[o];
    }

    //get total numbers of items to call start_interval()
    //once they are loaded async
    let total_items = 0;
    /* eslint-disable-next-line */
    for (let identifier in options.shown_items) {
      total_items++;
    }

    let i = 0;
    let replay_items: any[] = [];
    //loop through items
    for (let identifier in options.shown_items) {
      if (options.shown_items[identifier] == 'true') {
        this.getItem(identifier, result => {
          replay_items.push(result);

          i++;
          if (i === total_items) {
            start_interval();
          }
        });
      } else {
        options.map.hideItem(identifier);
        i++;
        if (i === total_items) {
          start_interval();
        }
      }
    }
  }
}
