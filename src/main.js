import Vue from 'vue'
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
    this.map = L.map(mapId).setView([51.505, -0.09], 13);
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'your.mapbox.access.token'
    }).addTo(this.map);
    this.addItemToMap();
  }
  this.addItemToMap = function(item){


    var greenIcon = L.icon({
        iconUrl: 'https://www.bueroshop24.de/ugsshoppictures/img/2/10/Zoom_m1097593.jpg/z/',
        
        iconSize:     [38, 95], // size of the icon
        shadowSize:   [50, 64], // size of the shadow
        iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
        shadowAnchor: [4, 62],  // the same for the shadow
        popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
    });
    L.marker([51.5, -0.09], {icon: greenIcon}).addTo(this.map);
    /*template vehicle
      {
        'type':'point'
        'name':'Vehicle-Title'
        ''

      }

    */



  }
}


var app_db = new function(){
    this.databases = {};
    this.logged_in;

    this.getDB = function(db_name){
        if(typeof this.databases[db_name] == 'undefined')
            this.databases[db_name] = new PouchDB(this.getDBURL()+db_name, {skip_setup:true});
        return this.databases[db_name]
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
    this.init = function(){

        /*var items = this.getDB('items');

        items.allDocs({
          include_docs: true,
          attachments: true
        }).then(function (result) {
            if(result.error)
                this.fetchError(result);
            console.log(result)
          // handle result
        }).catch(function (err) {
          self.fetchError(err);
        });*/
    }
    this.getPositionsForVehicle = function(identifier,cb){
        var items = this.getDB('positions');
        var self = this;
        items.allDocs({
          include_docs: true,
          attachments: true,
          startkey: id,
        }).then(function (result) {
            if(result.error)
                return self.fetchError(result);

            cb(result);
          // handle result
        }).catch(function (err) {

          self.fetchError(err);
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

            console.log(result.rows.length);
            result.rows.forEach(function(v,i){
              console.log(v,i);
              self.getPositionsForVehicle(v.doc.identifier,function(positions){
                console.log('positions received:');
                console.log(positions);
              });
            
            });
            cb(result);
          // handle result
        }).catch(function (err) {

          self.fetchError(err);
        });
    }
}
app_db.getVehicles();

Vue.prototype.$db = app_db;
Vue.prototype.$map = map;
Vue.use(BootstrapVue);
export const serverBus = new Vue();

new Vue({
  render: h => h(App)
}).$mount('#app')

