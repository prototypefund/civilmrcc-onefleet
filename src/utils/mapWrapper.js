import storage from './storageWrapper';
import { SARZones } from '../constants/sar-zones';

var mapWrapper = function() {
  //** local variables */
  this.map;
  this.loaded_items = {};
  this.sarZoneLayerGroup = L.layerGroup();
  this.sarZoneIsVisible = true;

  this.init = function(mapId) {
    try {
      mapzoom = storage.get('mapzoom');
      mapcenter = JSON.parse(storage.get('mapcenter'));
    } catch (err) {
      console.error('could not load mapcenter and zoom from localstorage', err);
    }
    if (mapcenter == null) var mapcenter = [38.575655, 10.710734];
    if (mapzoom == null) var mapzoom = 5;

    this.map = L.map(mapId).setView(mapcenter, mapzoom);

    /** Title setup */
    let tile_url;
    switch (localStorage.settings_maptiles) {
      default:
        tile_url = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';
        break;
      case 'onefleet':
        tile_url = '/MapTiles/{z}/{x}/{y}.png';
        break;
    }

    L.tileLayer(tile_url, {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetzMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'groundtile',
    }).addTo(this.map);

    if (localStorage.settings_openseamap == 'true') {
      L.tileLayer('http://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', {
        attribution: '',
        maxZoom: 18,
        id: 'openseamap',
        accessToken: '',
      }).addTo(this.map);
    }

    /** Control setup */
    L.control.scale({ imperial: false }).addTo(this.map);
    L.control
      .polylineMeasure({
        position: 'topleft',
        unit: 'nauticalmiles',
        showBearings: true,
        clearMeasurementsOnStop: false,
        showClearControl: true,
        showUnitControl: true,
      })
      .addTo(this.map);

    //** SAR Zones setup */
    this.createSarZoneFeatureGroup(SARZones, this.map);

    //** Init draws on the map after startup. */
    this.initDraw();

    var self = this;
    this.map.on('move', function() {
      storage.set('mapzoom', self.map._zoom);
      storage.set(
        'mapcenter',
        JSON.stringify([self.map.getCenter().lat, self.map.getCenter().lng])
      );
    });

    console.log('map initted');
  };

  /** Creates a featureGroup with polygons of each given SAR Zone from the parameter.
   * Return a leaflet L.featureGroup.
   */
  this.createSarZoneFeatureGroup = function(sarZones, map) {
    map.addLayer(this.sarZoneLayerGroup);

    for (let sarZoneObject of sarZones) {
      const coordinates = sarZoneObject.coordinates;
      const color = sarZoneObject.color;
      const tooltip = sarZoneObject.name;

      let sarZonePolygon = L.polygon(coordinates)
        //** fill the polygon with minimal transparency to force that the tooltip also opens, if user hovers over the whole SAR sone and not only over the colored bounding borders. */
        .setStyle({
          color: color,
          fill: true,
          fillColor: '#000000FF',
          fillOpacity: 0.01,
          weight: 2,
          dashArray: '4',
        })
        .bindTooltip(tooltip + ' SAR Zone');

      this.sarZoneLayerGroup.addLayer(sarZonePolygon);
    }
  };

  /** Method calls the flyTo method from leaflet.js
   * See also: https://leafletjs.com/reference-1.0.0.html
   * Sets the view of the map (geographical center and zoom) performing a smooth pan-zoom animation.
   */
  this.flyTo = function(positions) {
    this.map.flyTo(positions);
  };

  this.initDraw = function() {
    let drawnItems = new L.FeatureGroup();
    this.map.addLayer(drawnItems);

    //** Add a toggle for sar zones in map controls list */
    var toggleSarZoneControl = L.Control.extend({
      options: {
        position: 'topleft',
      },

      onAdd: () => {
        var container = L.DomUtil.create(
          'div',
          'leaflet-bar leaflet-control leaflet-control-custom'
        );

        container.style.backgroundColor = 'white';
        container.style.backgroundSize = '30px 30px';
        container.style.width = '30px';
        container.style.height = '30px';

        let aTag = L.DomUtil.create(
          'a',
          'polyline-measure-unicode-icon',
          container
        );
        aTag.title = 'Turn on/off sar zones.';
        // Set icon
        L.DomUtil.addClass(aTag, 'polyline-measure-controlOnBgColor');
        L.DomUtil.addClass(aTag, 'el-icon-close');

        // We must prevent the double click of the button, otherwise the map zoomes in if button is double clicked.
        container.ondblclick = e => e.stopImmediatePropagation();

        // Toggles the sar zone group visibility.
        container.onclick = () => {
          if (this.sarZoneLayerGroup === undefined) {
            return;
          }

          // if sarZones are visible, remove sar zone layer group from map and set sarZoneIsVisible = false
          if (this.map.hasLayer(this.sarZoneLayerGroup)) {
            this.map.removeLayer(this.sarZoneLayerGroup);
            L.DomUtil.removeClass(aTag, 'polyline-measure-controlOnBgColor');

            // Change icon
            L.DomUtil.addClass(aTag, 'el-icon-view');
            L.DomUtil.removeClass(aTag, 'el-icon-close');
          } else {
            this.map.addLayer(this.sarZoneLayerGroup);
            L.DomUtil.addClass(aTag, 'polyline-measure-controlOnBgColor');

            // Change icon
            L.DomUtil.removeClass(aTag, 'el-icon-view');
            L.DomUtil.addClass(aTag, 'el-icon-close');
          }
        };

        return container;
      },
    });
    this.map.addControl(new toggleSarZoneControl());

    //** Add the standard Map actions. */
    this.map.addControl(
      new L.Control.Draw({
        edit: {
          featureGroup: drawnItems,
          poly: {
            allowIntersection: true,
          },
        },
        draw: {
          polygon: {
            allowIntersection: true,
            showArea: true,
          },
        },
      })
    );

    // Truncate value based on number of decimals
    var _round = function(num, len) {
      return Math.round(num * Math.pow(10, len)) / Math.pow(10, len);
    };
    // Helper method to format LatLng object (x.xxxxxx, y.yyyyyy)
    var strLatLng = function(latlng) {
      return '(' + _round(latlng.lat, 6) + ', ' + _round(latlng.lng, 6) + ')';
    };

    // Generate popup content based on layer type
    // - Returns HTML string, or null if unknown object
    var getPopupContent = function(layer) {
      let latlngs, distance, area;
      // Marker - add lat/long
      if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        return strLatLng(layer.getLatLng());
        // Circle - lat/long, radius
      } else if (layer instanceof L.Circle) {
        var center = layer.getLatLng(),
          radius = layer.getRadius();
        return (
          'Center: ' +
          strLatLng(center) +
          '<br />' +
          'Radius: ' +
          _round(radius, 2) +
          ' m'
        );
        // Rectangle/Polygon - area
      } else if (layer instanceof L.Polygon) {
        (latlngs = layer._defaultShape
          ? layer._defaultShape()
          : layer.getLatLngs()),
          (area = L.GeometryUtil.geodesicArea(latlngs));
        let html =
          '<a href="#">Get historic ais data for this area</a><br><a href="#">add sighting</a><br>';

        return html + 'Area: ' + L.GeometryUtil.readableArea(area, true);
        // Polyline - distance
      } else if (layer instanceof L.Polyline) {
        (latlngs = layer._defaultShape
          ? layer._defaultShape()
          : layer.getLatLngs()),
          (distance = 0);
        if (latlngs.length < 2) {
          return 'Distance: N/A';
        } else {
          for (var i = 0; i < latlngs.length - 1; i++) {
            distance += latlngs[i].distanceTo(latlngs[i + 1]);
          }
          return 'Distance: ' + _round(distance, 2) + ' m';
        }
      }
      return null;
    };

    // Object created - bind popup to layer, add to feature group
    this.map.on(L.Draw.Event.CREATED, function(event) {
      var layer = event.layer;
      var content = getPopupContent(layer);
      if (content !== null) {
        layer.bindPopup(content);
      }
      drawnItems.addLayer(layer);
    });

    // Object(s) edited - update popups
    this.map.on(L.Draw.Event.EDITED, function(event) {
      var layers = event.layers,
        content = null;
      layers.eachLayer(function(layer) {
        content = getPopupContent(layer);
        if (content !== null) {
          layer.setPopupContent(content);
        }
      });
    });
  };
  this.loadTemplatedItem = function(item) {
    let max_positions = localStorage.settings_map_track_length || 100;
    let max_track_type =
      localStorage.settings_max_track_type || 'number_of_positions';

    if (typeof max_positions == 'string')
      max_positions = parseInt(max_positions);

    if (max_track_type == 'number_of_positions') {
      //filter out positions by number of positions
      //cut number of positions only keep
      if (item.positions.length > max_positions) {
        item.positions.splice(0, item.positions.length - max_positions);
      }
    } else {
      //filter out positions by date
      if (max_track_type == 'number_of_days') {
        let min_date = new Date();
        min_date.setDate(min_date.getDate() - max_positions);
        item.positions = item.positions.filter(function(position) {
          return min_date < new Date(position.doc.timestamp);
        });
      } else if (max_track_type == 'date_range') {
        let min_date = new Date(localStorage.settings_track_startdate);
        let max_date = new Date(localStorage.settings_track_enddate);
        item.positions = item.positions.filter(function(position) {
          let date = new Date(position.doc.timestamp);
          return max_date > date && date > min_date;
        });
      }
    }

    //every item is based on one of the following
    //base templates:
    //point: a single point
    //line: a series of n points
    //track: series of n points with a main point
    //polygon: series of points
    switch (item.doc.template) {
      case 'vehicle':
        item.doc.base_template = 'line';
        if (typeof item.doc.properties.icon !== 'undefined')
          item.doc.properties.icon = './vehicle.png';
        break;
      case 'case':
        //item.doc.template = 'point';
        if (typeof item.doc.properties.icon !== 'undefined')
          item.doc.properties.icon = './vehicle.png';
        break;
    }
    return item;
  };
  this.clearMap = function() {
    let i = 0;
    this.map.eachLayer(function(layer) {
      if (i > 0) this.map.removeLayer(layer);
      i++;
    });
  };
  this.showItem = function() {};
  this.clickItem = function() {};
  this.generateLine = function(item) {
    /*let max_length = 5;
    item.positions.slice(-1 * max_length);*/
    var pointList = [];
    if (item.positions.length > 0) {
      for (var i in item.positions) {
        var v = item.positions[i];
        if (v.doc.lat && v.doc.lon) pointList.push([v.doc.lat, v.doc.lon]);
        //pointList.push()
      }

      var color;
      if (typeof item.doc.properties.color != 'undefined')
        color = item.doc.properties.color;
      else color = ['red', 'yellow', 'blue'][Math.floor(Math.random() * 2)];

      return new L.Polyline(pointList, {
        color: color,
        weight: 3,
        opacity: 0.5,
        smoothFactor: 1,
      });
    }
  };
  this.generateMarker = function(item) {
    var self = this;
    var marker;
    var positions = item.positions;
    for (var i in positions) {
      var v = positions[i];
      //last position
      if (positions.length == 1 || i == positions.length - 1) {
        var width = 16;
        var height = 16;
        var rotation = v.doc.heading;
        var style =
          'transform: rotate(' +
          rotation +
          'deg);width: ' +
          width +
          'px; height:' +
          height +
          'px;margin-left:-' +
          width / 2 +
          'px;margin-top:-' +
          height / 2 +
          'px;';
          
        if(item.doc.template!='case'&&
          item.doc.template!='vehicle'&&
          item.doc.properties.icon !== 'undefined'){
          var icon = L.divIcon({
            className: 'vehicle-marker',
            html: '<div><span class="el-icon-'+item.doc.properties.icon+'"></span></div>',
          });
        }else{
          var icon = L.divIcon({
            className: 'vehicle-marker',
            html: '<img src="/gfx/icons/cursor.png" style="' + style + '">',
          });
        }

        if (
          typeof v.doc.lat !== 'undefined' &&
          typeof v.doc.lon !== 'undefined'
        ) {
          marker = L.marker([v.doc.lat, v.doc.lon], { icon: icon });
          marker.on('click', L.bind(self.clickItem, null, item.id));
          let popupcontent = item.doc.identifier;
          if (item.doc.properties.name) {
            popupcontent += ' - ' + item.doc.properties.name;
          }
          marker.bindPopup(popupcontent);
          marker.on('mouseover', function() {
            this.openPopup();
          });
          marker.on('mouseout', function() {
            this.closePopup();
          });
          return marker;
        }
      }
    }
  };
  this.addItemToMap = function(item) {
    item = this.loadTemplatedItem(item);
    this.loaded_items[item.id] = {};

    var line = false;
    var marker = false;

    if (item.positions.length == 1) {
      item.positions[1] = item.positions[0];
    }

    if (typeof item.positions != 'undefined' && item.positions.length > 0) {
      line = this.generateLine(item);
      marker = this.generateMarker(item);
      if (marker) {
        this.loaded_items[item.id].marker = marker;
        this.loaded_items[item.id].marker = marker.addTo(this.map);
      }
      if (item.doc.base_template == 'line' && line) {
        this.loaded_items[item.id].line = line;
        this.loaded_items[item.id].line.addTo(this.map);
      }
    }
  };
  this.updateItemPosition = function(item) {
    if (item.positions.length < 1) {
      return false;
    }
    if (typeof this.loaded_items[item.id] == 'undefined') {
      this.addItemToMap(item);
    } else {
      let lat = item.positions[item.positions.length - 1].doc.lat;
      let lon = item.positions[item.positions.length - 1].doc.lon;
      if (this.loaded_items[item.id].marker) {
        this.loaded_items[item.id].marker
          .setLatLng([lat, lon])
          .setOpacity(1)
          .update();
      }

      if (this.loaded_items[item.id].line) {
        if (lat && lon) this.loaded_items[item.id].line.addLatLng([lat, lon]);

        this.loaded_items[item.id].line.setStyle({
          opacity: 1,
        });
      }
    }
  };
  this.hideItem = function(item_id) {
    if (typeof this.loaded_items[item_id] !== 'undefined') {
      this.loaded_items[item_id].line.setStyle({
        opacity: 0,
      });
      this.loaded_items[item_id].marker.setOpacity(0).update();
    }
  };
  this.getDistance = function(point1, point2) {
    let latlng1 = L.latLng(point1.lat, point1.lon);
    let latlng2 = L.latLng(point2.lat, point2.lon);
    return latlng1.distanceTo(latlng2);
  };
};

export default new mapWrapper();
