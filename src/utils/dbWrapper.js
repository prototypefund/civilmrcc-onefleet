import PouchDB from 'pouchdb-browser'
import PouchDBAuthentication from 'pouchdb-authentication'
import config from '../../config/config.js';
PouchDB.plugin(PouchDBAuthentication);

var dbWrapper = function(){
    this.databases = {};
    this.logged_in;

    this.initDB = function(db_name){
      var self = this;
      if(typeof this.databases[db_name] == 'undefined'){
            this.databases[db_name] = {
              local: new PouchDB(db_name, {skip_setup:true}),
              remote: new PouchDB(this.getDBURL()+db_name+'?descending=true')
            }

            this.databases[db_name].local.sync(this.databases[db_name].remote, {
              live: true,
              retry: true
            }).on('change', function (change) {
              console.log('data ch change', change);
              if(typeof(self.databases[db_name].onChange) == 'function'){
                self.databases[db_name].onChange(change);
              }
            }).on('error', function (err) {
              console.log('sync error', err);
            });
      }
    }

    this.setOnChange = function(db_name,method){
        var db = this.getDB(db_name);
        this.databases[db_name].onChange = method;
    }
    this.getDB = function(db_name){
        if(typeof this.databases[db_name] == 'undefined'){
            this.initDB(db_name)
        }
        return this.databases[db_name].local;
    };
    this.showLogin = function(){
        alert('Show Login NOW!');
        serverBus.$emit('modal_modus', 'login');
        //this.login('sw3','password',this.getDB('items'))
    };
    this.login = function(username, password, db){
        db.login(username, password).then(function(res) {
          console.log(res);
          localStorage.username = username;
          localStorage.password = password;
        }).then(function(docs) {

        }).catch(function(error) {
          console.error(error);
        });
    }
    this.fetchError = function(err){
        console.log(err);
        if(err.error == "unauthorized")
            this.showLogin();
    }
    this.getDBURL = function(){
        if(localStorage.username && localStorage.username.length > 0)

            return 'http://'+localStorage.username+':'+localStorage.password+'@'+config.db_remote_host+':'+config.db_remote_port+'/';
        else    
            return 'http://'+config.db_remote_host+':'+config.db_remote_port+'/';
    }
    this.getPositionsForItem = function(identifier,cb){
        var self = this;
        this.getDB('positions').allDocs({
          include_docs: true,
          attachments: true,
          startkey: identifier,
          endkey: identifier+'\uffff'
        }).then(function (result) {
            if(result.error)
                return self.fetchError(result);

           
            cb(result);
          // handle result
        }).catch(function (err) {

          self.fetchError(err);
        });

    }
    this.createPosition = function(obj,cb){
      this.getDB('positions').put(obj).then(function (response) {
        console.log('position created');
        console.log(response)
        cb(null,response)
      }).catch(function (err) {
        cb(err);
      });
    };
    this.createItem = function(obj,cb){
      var itemDB = this.getDB('items');
      itemDB.put(obj).then(function (response) {
        console.log('item created');
        console.log(response)
        cb(null,response)
      }).catch(function (err) {
        cb(err);
      });
    };
    this.updateItem = function(obj,cb){
      //in pouch create and update actually is the same function
      //an item will be updated if the id and a rev already exists
      return this.createItem(obj,cb);
    }
    this.getItem = function(itemId,cb){
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
    this.getItems = function(cb){
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
    this.getItemsByTemplate = function(template,cb){
        var self = this;
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

          cb(err)
        });
    }
    this.getVehicles = function(cb){
        this.getItemsByTemplate('VEHICLE',cb);
    }
    this.appendItemsToMap = function(map, options){
      this.getItems(function(err,result){
        for(var i in result.rows){
          var item = result.rows[i];
          //add onclick option to itemobject

          map.addItemToMap(item);
        };
      });
    }

    this.updateShownItemsOnMap = function(map,options){
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
}
export default new dbWrapper();