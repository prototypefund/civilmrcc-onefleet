var mapWrapper = function(){
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

    L.control.scale({imperial: false}).addTo(this.map);
    this.map.on('move',function(){
      console.log('moved!')
    });
    console.log('map initted');
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
        item.doc.template = 'point';
        if(typeof item.doc.properties.icon !== 'undefined')
          item.doc.properties.icon = './vehicle.png';
      break;
    }
    return item;
  };
  this.clearMap = function(){
    var i = 0;
    this.map.eachLayer(function (layer) {
      console.log(layer);
            if(i > 0)
              map.map.removeLayer(layer);
            i++;
    });

  }
  this.showItem = function(){

  };
  this.clickItem = function(){

  };
  this.generateLine = function(item){
    var pointList = [];
    if(item.positions.length > 0){
      for(var i in item.positions){
        var v = item.positions[i];
        if(v.doc.lat&&v.doc.lon)
        pointList.push([v.doc.lat, v.doc.lon]);
        //pointList.push()
      };

      return new L.Polyline(pointList, {
          color: ['red','yellow','blue'][Math.floor(Math.random()*2)],
          weight: 3,
          opacity: 0.5,
          smoothFactor: 1
      });
    }
  };
  this.generateMarker = function(item){
    var self = this;
    var marker;
    var positions = item.positions;
    for(var i in positions){
              var v = positions[i];
              //first position
              if(i == 0){

              }
              //last position
              if(i == positions.length-1){

                var width = 16;
                var height = 16;
                var rotation = v.doc.heading;
                var style = "transform: rotate("+rotation+"deg);width: "+width+"px; height:"+height+"px;margin-top:-"+(height/2)+"px;margin-left:"+(width/2)+"px;";
                var icon = L.divIcon({className: 'my-div-icon',html:'<img src="/gfx/icons/cursor.png" style="'+style+'">'});

                if(typeof v.doc.lat !== 'undefined' && typeof v.doc.lon !== 'undefined' ){

                  marker = L.marker([v.doc.lat,v.doc.lon], {icon: icon});
                  marker.on('click',L.bind(self.clickItem, null,item.id));
                  return marker;
                }
                
              }
      };
  }
  this.addItemToMap = function(item){
    item = this.loadTemplatedItem(item);
    this.loaded_items[item.id] = {};

    var self = this;
    var line = false;
    var marker = false;

    if(typeof item.positions != 'undefined' && item.positions.length > 0)
        item.doc.template = 'line';
        if(item.doc.template == 'line'){
            line = this.generateLine(item);
            //add item add the end
            item.doc.template = 'point'
        }
        if(item.doc.template == 'point'){
            marker = this.generateMarker(item);
        }
        if(marker)
          marker.addTo(this.map)
          this.loaded_items[item.id].marker = marker;

        if(line){
          this.loaded_items[item.id].line = line;
          this.loaded_items[item.id].line.addTo(this.map);
        }



    };
    this.updateItemPosition = function(item){
      if(typeof this.loaded_items[item.id] == 'undefined'){
        this.addItemToMap(item);
      }else{

        let lat = item.positions[item.positions.length-1].doc.lat;
        let lon = item.positions[item.positions.length-1].doc.lon;
        this.loaded_items[item.id].marker.setLatLng([lat, lon]).setOpacity(1).update();

        this.loaded_items[item.id].line.setStyle({
            opacity: 1
        });
      }
    };
    this.hideItem = function(item_id){
      if(typeof this.loaded_items[item_id] !== 'undefined'){

        this.loaded_items[item_id].line.setStyle({
            opacity: 0
        });
        this.loaded_items[item_id].marker.setOpacity(0).update();
      }
    }
}

export default new mapWrapper();