import Vue from 'vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import App from './App.vue'
export const serverBus = new Vue();



import PouchDB from 'pouchdb-browser'
import PouchDBAuthentication from 'pouchdb-authentication'


import config from '../config/config.js';

PouchDB.plugin(PouchDBAuthentication);


var map = new function(){
  this.map;
  this.loaded_items = {};
  this.init = function(mapId){
    this.map = L.map(mapId).setView([38.575655,10.710734], 5);
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'your.mapbox.access.token'
    }).addTo(this.map);
  };
  this.loadTemplatedItem = function(item){
    //every item is based on one of the following
    //base templates: 
    //point: a single point
    //line: a series of n points
    //track: series of n points with a main point
    //polygon: series of points


    switch(item.doc.template){
      case 'vehicle':
        item.doc.template = 'line';
        if(typeof item.doc.properties.icon !== 'undefined')
          item.doc.properties.icon = './vehicle.png';
      break;
      case 'case':
        item.doc.template = 'line';
        if(typeof item.doc.properties.icon !== 'undefined')
          item.doc.properties.icon = './vehicle.png';
      break;
    }
    return item;
  };
  this.showItem = function(){

  };
  this.addItemToMap = function(item){
    item = this.loadTemplatedItem(item);
    var self = this;

    if(item.positions)

        if(item.doc.template == 'line'){
            var pointList = [];

            item.positions.forEach(function(v,i){
              pointList.push(new L.LatLng(v.doc.lat, v.doc.lon));
              //pointList.push()
            });

            var firstpolyline = new L.Polyline(pointList, {
                color: 'red',
                weight: 3,
                opacity: 0.5,
                smoothFactor: 1
            });
            firstpolyline.addTo(self.map);

            //add item add the end
            item.doc.template = 'point'

        }
        if(item.doc.template == 'point'){

            item.positions.forEach(function(v,i){
              //first position
              if(i == 0){

              }
              //last position
              if(i == item.positions.length-1){

                var width = 16;
                var height = 16;
                var rotation = v.doc.heading;
                var style = "transform: rotate("+rotation+"deg);width: "+width+"px; height:"+height+"px;margin-top:-"+(height/2)+"px;margin-left:"+(width/2)+"px;";
                var icon = L.divIcon({className: 'my-div-icon',html:'<img src="/gfx/icons/cursor.png" style="'+style+'">'});

                var marker = L.marker([v.doc.lat,v.doc.lon], {icon: icon}).addTo(self.map);
                if(typeof item.onClick == 'function'){
                  marker.on('click',L.bind(item.onClick, null,item.id));
                  self.loaded_items[item.id] = marker;
                }

              }
            });






        }










     



    }
}



var app_db = new function(){
    this.databases = {};
    this.logged_in;





    this.initDB = function(db_name){
      var self = this;
      if(typeof this.databases[db_name] == 'undefined'){
            this.databases[db_name] = {
              local: new PouchDB(db_name, {skip_setup:true}),
              remote: new PouchDB(this.getDBURL()+db_name)
            }

            this.databases[db_name].local.sync(this.databases[db_name].remote, {
              live: true,
              retry: true
            }).on('change', function (change) {
              console.log('data ch change', change);
              if(typeof(self.databases[db_name].onChange) == 'function'){
                self.databases[db_name].onChange();
              }
            }).on('error', function (err) {
              console.log('sync error', err);
            });
      }
      this.setOnChange = function(db_name,method){
        this.databases[db_name].onChange = method;
      }
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
    this.getItem = function(itemId,cb){
      var self = this;
      this.getDB('items').get(itemId).then(function (doc) {
        self.getPositionsForItem(doc.identifier,function(positions){
          doc.positions = positions.rows;
          cb(doc);
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
      console.log('whoat',template);
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
                console.log('check here nic',positions);
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
      console.log('append items to map');
      this.getItems(function(err,result){
        console.log('got items',err,result);
        result.rows.forEach(function(item,i){
          console.log('append item',item,i);

          //add onclick option to itemobject
          if(typeof options.onClick == 'function'){
            item.onClick = function(itemId){
              options.onClick(itemId);
            }
          }

          map.addItemToMap(item);
        });
      });
    }
    this.updateShownItemsOnMap = function(map,options){
      console.log(options);
      //item is here not the same as an item in the database
      //it could be a L.marker, L.polygon etc
      for(var identifier in map.loaded_items){

        if(options.shown_items.indexOf(identifier) > -1){
          //show item
          console.log(map.loaded_items[identifier].options.opacity = 0);

        }else{
          //hide item
          console.log(map.loaded_items[identifier].options.opacity = 1);

        }
        console.log(map.loaded_items[identifier]);
      }
    };
}
Vue.prototype.$db = app_db;
Vue.prototype.$map = map;
Vue.use(ElementUI);

new Vue({
  render: h => h(App)
}).$mount('#app')

