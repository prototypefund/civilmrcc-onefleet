import pouchwrapper from 'pouchwrapper';
import * as moment from 'moment';
import config from '../../config/config.js';

import { serverBus } from '../main';
pouchwrapper.setConfig(config);

pouchwrapper.getPositionsForItem = function(identifier, cb) {
  var self = this;
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
    .then(function(result) {
      //quick fix
      //this has to be put to the server site
      if (result.rows.length > 1000) {
        result.rows = result.rows.splice(-1000);
      }
      if (result.error) return self.fetchError(result);
      cb(result); 
      // handle result
    })
    .catch(function(err) {
      self.fetchError(err);
    });
};
pouchwrapper.createPosition = function(obj, cb) {
  this.getDB('positions')
    .put(obj)
    .then(function(response) {
      cb(null, response);
    })
    .catch(function(err) {
      cb(err);
    });
};
pouchwrapper.createItem = function(obj, cb) {
  var itemDB = this.getDB('items');
  itemDB
    .put(obj)
    .then(function(response) {
      cb(null, response);
    })
    .catch(function(err) {
      cb(err);
    });
};
pouchwrapper.updateItem = function(obj, cb) {
  //in pouch create and update actually is the same function
  //an item will be updated if the id and a rev already exists
  return this.createItem(obj, cb);
};
pouchwrapper.getItem = function(itemId, cb) {
  var self = this;
  this.getDB('items')
    .get(itemId)
    .then(function(doc) {
      self.getPositionsForItem(doc.identifier, function(positions) {
        var item = {
          id: doc._id,
          doc: doc,
          positions: positions.rows,
        };
        cb(item);
      });
    })
    .catch(function(err) {
      console.error(err);
    });
};
pouchwrapper.getItems = function(cb) {
  var items = this.getDB('items');
  var self = this;
  items
    .allDocs({
      include_docs: true,
      attachments: true,
    })
    .then(function(result) {
      if (result.error) return self.fetchError(result);

      result.rows.forEach(function(v, i) {
        result.rows[i]['positions'] = [];
        self.getPositionsForItem(v.doc.identifier, function(positions) {
          //append positions to vehicles:
          result.rows[i].positions = positions.rows;

          cb(null, result);
        });
      });
      // handle result
    })
    .catch(function(err) {
      cb(err);
    });
};
pouchwrapper.getItemsByTemplate = function(template, cb) {
  var self = this;

  this.getDB('items')
    .allDocs({
      include_docs: true,
      attachments: true,
      startkey: template,
      endkey: template + '\uffff',
    })
    .then(function(result) {
      if (result.error) return self.fetchError(result);
      if (result.rows.length == 0) return cb(null, []);

      result.rows.forEach(function(v, i) {
        //HAS TO BE REPLACED WITH PROMISE!
        self.getPositionsForItem(v.doc.identifier, function(positions) {
          //append positions to vehicles:
          if (positions.rows) result.rows[i].positions = positions.rows;

          if (i >= result.rows.length - 1) cb(null, result);
        });
      });

      // handle result
    })
    .catch(function(err) {
      console.error(err);
      cb(err);
    });
};
pouchwrapper.getVehicles = function(cb) {
  this.getItemsByTemplate('VEHICLE', cb);
};
pouchwrapper.appendItemsToMap = function(map) {
  this.getItems(function(err, result) {
    for (var i in result.rows) {
      var item = result.rows[i];
      //add onclick option to itemobject

      map.addItemToMap(item);
    }
  });
};

pouchwrapper.updateShownItemsOnMap = function(map, options) {
  //item is here not the same as an item in the database
  //it could be a L.marker, L.polygon etc

  var self = this;
  //map.clearMap();

  for (var identifier in options.shown_items) {
    if (options.shown_items[identifier] == 'true')
      self.getItem(identifier, function(result) {
        options.map.updateItemPosition(result);
      });
    else options.map.hideItem(identifier);
  }
};

/** Method starts timelapse replay
* @param {Object} options.map
* @param {String} options.startDate       starting datetime of the replay
* @param {String} options.endDate         ending datetime of the replay
* @param {Number} options.hoursPerFrame   hoursPerFrame added to the animation per frame update
* @param {Number} options.frameLength     length in s in which a frame is shown
*/
pouchwrapper.startReplay = function(options,cb){
    console.log('Start replay with following options:',options);
    let self = this;
    //store old tracking type to
    //to reset map after replay
    let old_tracking_value = {};
    if(localStorage.settings_max_track_type){
      old_tracking_value = {
        tracking_type:localStorage.settings_max_track_type
      }
      if(localStorage.settings_track_startdate)
        old_tracking_value.settings_track_startdate = localStorage.settings_track_startdate;
      if(localStorage.settings_track_enddate)
        old_tracking_value.settings_track_enddate = localStorage.settings_track_enddate;
      if(localStorage.settings_map_track_length)
        old_tracking_value.settings_map_track_length = localStorage.settings_map_track_length;
    }
    
    //set tracking type, start_date and end_date
    localStorage.settings_max_track_type = 'date_range';
    localStorage.settings_track_startdate = options.startDate;
    localStorage.settings_track_enddate = options.endDate;


    //cleanup old positions
    for(let o in options.map.loaded_items){
      if(options.map.loaded_items[o].marker)
        options.map.loaded_items[o].marker.remove();
      if(options.map.loaded_items[o].line)
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
    let replay_items = []
    //loop through items
    for (let identifier in options.shown_items) {
      if (options.shown_items[identifier] == 'true'){
        self.getItem(identifier, function(result) {
         
          replay_items.push(result);

          i++;
          if(i === total_items){
            start_interval(replay_items);
          }

        });
      }
      else{
          options.map.hideItem(identifier)
          i++;
          if(i === total_items){
            start_interval(replay_items);
          }
      }
    }


    let start_interval = function(){
      let currentDate = moment(options.startDate);
      
      let interval = setInterval(()=>{

        currentDate.add(options.hoursPerFrame, 'hours');
        localStorage.settings_track_enddate = currentDate.format('YYYY-MM-DTHH:MM');

        serverBus.$emit('replay_next_tick',currentDate);

        for(let i in replay_items){
          self.getItem(replay_items[i].id, function(loadeditem) {
              let templatedItem = options.map.loadTemplatedItem(loadeditem);
              console.log(templatedItem);
              options.map.updateItemPosition(templatedItem);
          });
        }

        if(currentDate.unix() >= moment(options.endDate).unix()){
          alert('replay finished');
          clearInterval(interval);
          localStorage.settings_max_track_type = old_tracking_value.tracking_type;
          if(old_tracking_value.settings_track_startdate)
            localStorage.settings_track_startdate = old_tracking_value.settings_track_startdate;
          if(old_tracking_value.settings_track_enddate)
            localStorage.settings_track_enddate = old_tracking_value.settings_track_enddate;
          if(old_tracking_value.settings_map_track_length)
            localStorage.settings_map_track_length = old_tracking_value.settings_map_track_length;
          cb();
        }

      }, Number(options.frameLength)*1000);


    }

  }
export default pouchwrapper;
