import Vue from 'vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import App from './App.vue'



import PouchDB from 'pouchdb-browser'
import PouchDBAuthentication from 'pouchdb-authentication'



PouchDB.plugin(PouchDBAuthentication);


var map = new function(){
  this.map;
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
        item.doc.template = 'track';
        if(typeof item.doc.properties.icon !== 'undefined')
          item.doc.properties.icon = './vehicle.png';
      break;
    }
    return item;
  }
  this.addItemToMap = function(item){
    //console.log('append item to map'+item.positions[0].doc.lat,item.positions[1].doc.lon);
    item = this.loadTemplatedItem(item);
    var self = this;
    item.positions.forEach(function(v,i){
      //first position
      if(i == 0){

      }
      if(i == item.positions.length-1){
        var greenIcon = L.icon({
            iconUrl: '/gfx/icons/cursor.png',           
            iconSize:     [32, 32], // size of the icon
            shadowSize:   [50, 64], // size of the shadow
            iconAnchor:   [16, 16], // point of the icon which will correspond to marker's location
            shadowAnchor: [4, 62],  // the same for the shadow
            popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
        });
        var width = 32;
        var height = 32;
        var rotation = v.doc.heading;
        var style = "transform: rotate("+rotation+"deg);width: "+width+"px; height:"+height+"px;margin-top:-"+(height/2)+"px;margin-left:"+(width/2)+"px;";
        var icon = L.divIcon({className: 'my-div-icon',html:'<img src="/gfx/icons/cursor.png" style="'+style+'">'});
        if(typeof item.onClick == 'function')
          L.marker([v.doc.lat,v.doc.lon], {icon: icon,rotationAngle: 100}).addTo(self.map).on('click',onClick)
        else
          L.marker([v.doc.lat,v.doc.lon], {icon: icon}).addTo(self.map);
        
      }
    });
   



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

      /*localDB.sync(remoteDB, {
        live: true,
        retry: true
      }).on('change', function (change) {
        // yo, something changed!
      }).on('paused', function (info) {
        // replication was paused, usually because of a lost connection
      }).on('active', function (info) {
        // replication was resumed
      }).on('error', function (err) {
        // totally unhandled error (shouldn't happen)
      });*/

    }
    this.getDB = function(db_name){
        if(typeof this.databases[db_name] == 'undefined'){
            this.initDB(db_name)
        }
        return this.databases[db_name].local;
    };
    this.showLogin = function(){
        alert('Show Login NOW!');
        this.login('sw3','password',this.getDB('items'))
    };
    this.login = function(username, password, db){
        db.login(username, password).then(function(res) {
          console.log(res);
          localStorage.username = username;
          localStorage.password = password;
        }).then(function(docs) {
          console.log(docs);
        }).catch(function(error) {
          console.error(error);
        });
    }
    this.fetchError = function(err){
        console.log(err.error);
        if(err.error == "unauthorized")
            this.showLogin();
    }
    this.getDBURL = function(){
        if(localStorage.username && localStorage.username.length > 0)

            return 'http://'+localStorage.username+':'+localStorage.password+'@localhost:5984/';
        else    
            return 'http://localhost:5984/';
    }
    this.getPositionsForItem = function(identifier,cb){
        var positions = this.getDB('positions');
        var self = this;
        positions.allDocs({
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
              console.log('getting positions for item: ',v.doc.identifier)
              self.getPositionsForItem(v.doc.identifier,function(positions){
                console.log('positions received for item '+v.doc.identifier+':');
                console.log(positions);

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
    this.getVehicles = function(cb){
        var items = this.getDB('items');
        var self = this;
        items.allDocs({
          include_docs: true,
          attachments: true,
          startkey: 'VEHICLE',
        }).then(function (result) {
            if(result.error)
                return self.fetchError(result);

            result.rows.forEach(function(v,i){
              console.log('getting positions for: ',v.doc.identifier)
              self.getPositionsForItem(v.doc.identifier,function(positions){
                console.log('positions received for '+v.doc.identifier+':');
                console.log(positions);

                //append positions to vehicles:
                result.rows[i].positions = positions.rows;
                
                cb(null,result);
              });
            
            });
          // handle result
        }).catch(function (err) {

          cb(err)
        });
    }
    this.appendItemsToMap = function(map){
      console.log('append items to map');
      this.getItems(function(err,result){
        console.log('got items',err,result);
        result.rows.forEach(function(v,i){
          console.log('append item',v,i);
          map.addItemToMap(v);
        });
      });
    }
}
Vue.prototype.$db = app_db;
Vue.prototype.$map = map;
Vue.use(ElementUI);
export const serverBus = new Vue();

new Vue({
  render: h => h(App)
}).$mount('#app')

