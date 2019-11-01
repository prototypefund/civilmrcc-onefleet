import pouchwrapper from 'pouchwrapper'
import config from '../../config/config.js';

pouchwrapper.setConfig(config);

pouchwrapper.getPositionsForItem = function(identifier,cb){
        var self = this;
        this.getDB('positions').allDocs({
          include_docs: true,
          attachments: true,
          startkey: identifier,
          endkey: identifier+'\uffff',
          limit:10000,
          skip:0,
          descending: false
        }).then(function (result) {
          //quick fix
          //this has to be put to the server site
           if(result.rows.length>1000){
            result.rows=result.rows.splice(-1000);
           }
            if(result.error)
                return self.fetchError(result);


            cb(result);
          // handle result
        }).catch(function (err) {

          self.fetchError(err);
        });

}
pouchwrapper.createPosition = function(obj,cb){
      this.getDB('positions').put(obj).then(function (response) {
        console.log('position created');
        console.log(response)
        cb(null,response)
      }).catch(function (err) {
        cb(err);
      });
    };
pouchwrapper.createItem = function(obj,cb){
      var itemDB = this.getDB('items');
      itemDB.put(obj).then(function (response) {
        console.log('item created');
        console.log(response)
        cb(null,response)
      }).catch(function (err) {
        cb(err);
      });
    };
pouchwrapper.updateItem = function(obj,cb){
      //in pouch create and update actually is the same function
      //an item will be updated if the id and a rev already exists
      return this.createItem(obj,cb);
    }
pouchwrapper.getItem = function(itemId,cb){
      var self = this;
      this.getDB('items').get(itemId).then(function (doc) {
        self.getPositionsForItem(doc.identifier,function(positions){
          var item = {
            id:doc._id,
            doc:doc,
            positions:positions.rows
          }
          cb(item);
        });
      }).catch(function (err) {
        console.log(err);
      });
    }
pouchwrapper.getItems = function(cb){
        var items = this.getDB('items');
        var self = this;
        items.allDocs({
          include_docs: true,
          attachments: true
        }).then(function (result) {
            if(result.error)
                return self.fetchError(result);

            result.rows.forEach(function(v,i){

              result.rows[i]['positions'] = [];
              self.getPositionsForItem(v.doc.identifier,function(positions){

                //append positions to vehicles:
                result.rows[i].positions = positions.rows;
                
                cb(null,result);
              });
            
            });
          // handle result
        }).catch(function (err) {

          cb(err);
        });
    }
pouchwrapper.getItemsByTemplate = function(template,cb){
        var self = this;

        console.log('getItemsByTemplate');
        console.log(template);
        this.getDB('items').allDocs({
          include_docs: true,
          attachments: true,
          startkey: template,
          endkey: template+'\uffff'
        }).then(function (result) {
            if(result.error)
                return self.fetchError(result);
            if(result.rows.length == 0)
              return cb(null,[]); 

            result.rows.forEach(function(v,i){

              //HAS TO BE REPLACED WITH PROMISE!
              self.getPositionsForItem(v.doc.identifier,function(positions){

                //append positions to vehicles:
                if(positions.rows)
                  result.rows[i].positions = positions.rows;

                
                if(i >= result.rows.length-1)
                  cb(null,result);
              });
            
            });


          // handle result
        }).catch(function (err) {
          console.log('err');
          console.log(err);
          cb(err)
        });
    }
pouchwrapper.getVehicles = function(cb){
        this.getItemsByTemplate('VEHICLE',cb);
    }
pouchwrapper.appendItemsToMap = function(map){
      this.getItems(function(err,result){
        for(var i in result.rows){
          var item = result.rows[i];
          //add onclick option to itemobject

          map.addItemToMap(item);
        }
      });
    }

pouchwrapper.updateShownItemsOnMap = function(map,options){
        //item is here not the same as an item in the database
        //it could be a L.marker, L.polygon etc
        
        var self = this;
        //map.clearMap();

        for(var identifier in options.shown_items){
          if(options.shown_items[identifier] == 'true')
            self.getItem(identifier,function(result){
              options.map.updateItemPosition(result);
            });
          else
            options.map.hideItem(identifier)
        }

        
    }
export default pouchwrapper;
