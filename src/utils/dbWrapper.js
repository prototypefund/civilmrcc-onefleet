import PouchDB from 'pouchdb-browser'
import PouchDBAuthentication from 'pouchdb-authentication'
import config from '../../config/config.js';
import { serverBus } from '../main';
PouchDB.plugin(PouchDBAuthentication);

var dbWrapper = function(){
    this.databases = {};
    this.logged_in;

    this.initDB = function(db_name){
      var self = this;
      if(typeof this.databases[db_name] == 'undefined'){
            this.databases[db_name] = {
              local: new PouchDB(db_name, {skip_setup:false}),
              remote: new PouchDB(this.getDBURL()+config.db_prefix+db_name+'?include_docs=true&descending=true', {skip_setup:false}),   
            }

            this.databases[db_name].local.replicate.from(this.databases[db_name].remote).on('complete', function (r,a,n) {
            // yay, we're done!
            console.log('initial replication done!');
            console.log('starting sync..');

            self.databases[db_name].remote.sync(db_name, {
              live: true,
              retry: true
            }).on('change', function (change) {
              console.log('data ch change', change);
              //each database can contain multiple onchange listeners, defined by index n
              for(let n in self.databases[db_name].onChange){
                if(typeof(self.databases[db_name].onChange[n]) == 'function'){
                  self.databases[db_name].onChange[n]();
                }
              }
            }).on('error', function (err) {
              console.log('sync error', err);
              if(err.error === 'unauthorized'){
                localStorage.removeItem(username);
                localStorage.removeItem(password);
                window.location.reload();
              }
            });

          }).on('error', function (err) {

            console.log('error during inital replication:');
            console.log(err);
            if(err.error === 'unauthorized'){
                localStorage.clear();
                window.location.reload();
            }
            // boo, something went wrong!
          });

      }
    }
   /**
   * Sets onchange funtions for a specified database
   *
   * @param {string} db_name - Database selector
   * @param {string} method_name - Index of the method
   * @param {functoin} method - Function that is executed on db-change
   */
    this.setOnChange = function(db_name,method_name,method){
        var db = this.getDB(db_name);
        if(typeof this.databases[db_name].onChange == 'undefined'){
          this.databases[db_name].onChange = {}
        }
        this.databases[db_name].onChange[method_name] = method;
    }
    this.getDB = function(db_name){
        
        if(typeof this.databases[db_name] == 'undefined'){
            this.initDB(db_name)
        }
        return this.databases[db_name].local;
    };
    this.showLogin = function(){
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
        if(typeof localStorage.username != 'undefined' && localStorage.username.length > 0)

            return 'http://'+localStorage.username+':'+localStorage.password+'@'+config.db_remote_host+':'+config.db_remote_port+'/';
        else    
            this.showLogin();
    }
    this.getPositionsForItem = function(identifier,cb){
        var self = this;
        let result  = [];
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