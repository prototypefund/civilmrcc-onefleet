import storage from './storageWrapper';
import { SARZones } from '../constants/sar-zones';

/**
 * The mapWrapper is an abstraction layer from the underlying mapping backend. (Currently leaflet.js)
 * It also provides some convenience methods for recurring map-related tasks.
 */
var mapWrapper = function() {
  //** local variables */
  this.map;
  this.loaded_items = {};
  this.sarZoneLayerGroup = L.layerGroup();
  this.sarZoneIsVisible = true;

  /**
   * Initialises the map backend component.
   * @param {string} mapId
   */
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

    /** Tile setup */
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
   * @param {Object[]} sarZones The constant sarZones object that is stored separately.
   * @param {string} sarZones.name The name of the SAR zone. Used as tooltip.
   * @param {string} sarZones.color A color by a SAR zone can be quickly identified on the map.
   * @param {Object[]} sarZones.coordinates An array of lat/lon coordinates.
   * @param {number} sarZones.coordinates.lat A latitude coordinate.
   * @param {number} sarZones.coordinates.lon A longitude coordinate.
   * @param {L.Map} map The map to which the sarZones should be added.
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
   * @param {[number, number]} positions The latitude/longitude coordinates.
   */
  this.flyTo = function(positions) {
    this.map.flyTo(positions);
  };

  /**
   * Initialise the SAR-zone-toggle and popups and keep track of drawn items.
   */
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

  /**
   * Prepares the given item for UI by converting templates to known base
   * templates, defining icons, and cropping the loaded number of positions
   * to an amount that can be handled by interactive display.
   * @param {Object} item The item that should be updated.
   * @param {Object} item.doc The item's database document object.
   * @param {string} item.doc.template The template of the item
   * @param {Object} item.doc.properties The item's properties.
   * @param {string} item.doc.properties.icon The icon file name for the item
   * @param {Object[]} item.positions The array of positions of the item.
   * @param {Object} item.positions.doc A position's database document object.
   * @param {number} item.positions.doc.timestamp The timestamp of a position.
   * @returns
   */
  this.loadTemplatedItem = function(item) {
    console.log('loadTemplatedItem');
    let max_positions = localStorage.settings_map_track_length || 100;
    let max_track_type =
      localStorage.settings_max_track_type || 'number_of_positions';

    if (typeof max_positions == 'string')
      max_positions = parseInt(max_positions);

    if (max_track_type == 'number_of_positions') {
      // filter out positions by number of positions (default: 100 positions)
      if (item.positions.length > max_positions) {
        // crop number of positions to max_positions
        item.positions.splice(0, item.positions.length - max_positions);
      }
    } else if (max_track_type == 'number_of_days') {
      // filter out positions by number of days in the past (defaut: 100 days)
      let min_date = new Date();
      min_date.setDate(min_date.getDate() - max_positions);
      item.positions = item.positions.filter(function(position) {
        return min_date < new Date(position.doc.timestamp);
      });
    } else if (max_track_type == 'date_range') {
      // filter out positions by date range from local storage
      let min_date = new Date(localStorage.settings_track_startdate);
      let max_date = new Date(localStorage.settings_track_enddate);
      item.positions = item.positions.filter(function(position) {
        let date = new Date(position.doc.timestamp);
        return max_date > date && date > min_date;
      });
    }

    // Every item is based on one of the following base templates:
    // point: a single point
    // line: a series of n points
    // track: series of n points with a main point
    // polygon: series of points
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

  /**
   * Removes all layers from the map, thereby clearing it.
   */
  this.clearMap = function() {
    let i = 0;
    this.map.eachLayer(function(layer) {
      if (i > 0) this.map.removeLayer(layer);
      i++;
    });
  };

  /**
   * Not implemented. But see src/components/items/ShowItem.vue
   */
  this.showItem = function() {};

  /**
   * Implemented in src/components/MapArea.vue
   * @param {string} item_id The ID of the item that was clicked
   */
  this.clickItem = function() {};


  this.generateLineCaption = function(item) {
    /*let max_length = 5;
    item.positions.slice(-1 * max_length);*/
    var markers = [];
    if (item.positions.length > 0) {
      for (var i in item.positions) {
        var v = item.positions[i];
        if (v.doc.lat && v.doc.lon){
          let date = new Date(v.doc.timestamp);
          let caption = date.toISOString().slice(0,10)+' - '+String(date.getHours()).padStart(2, "0")+':'+String(date.getMinutes()).padStart(2, "0");
          let icon = L.divIcon({
            className: 'lineCaption',
            html: '<div>'+caption+'</div>',
          });
          //let marker = new L.marker([v.doc.lat, v.doc.lon], { opacity: 0.5 }); //opacity may be set to zero

          let marker = L.marker([v.doc.lat, v.doc.lon], { icon: icon });
          markers.push(marker);
        }
        //pointList.push()
      }

      return markers;
    }
  };
  /**
   * Return a new leaflet.Polyline consisting of the positions of the item.
   * @param {Object} item The item that should be updated.
   * @param {string} item.id The ID of the item.
   * @param {Object} item.doc The item's database document object.
   * @param {Object} item.doc.properties The item's properties.
   * @param {string} item.doc.properties.color The item's color.
   * @param {Object[]} item.positions The array of positions of the item.
   * @param {Object} item.positions.doc A position's database document object.
   * @param {number} item.positions.doc.lat The latitude coordinate.
   * @param {number} item.positions.doc.lon The longitude coordinate.
   * @returns L.Polyline
   */
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
      else color = ["AliceBlue", "AntiqueWhite", "Aqua", "Aquamarine", "Azure", "Beige", "Bisque", "Black", "BlanchedAlmond", "Blue", "BlueViolet", "Brown", "BurlyWood", "CadetBlue", "Chartreuse", "Chocolate", "Coral", "CornflowerBlue", "Cornsilk", "Crimson", "Cyan", "DarkBlue", "DarkCyan", "DarkGoldenRod", "DarkGray", "DarkGrey", "DarkGreen", "DarkKhaki", "DarkMagenta", "DarkOliveGreen", "DarkOrange", "DarkOrchid", "DarkRed", "DarkSalmon", "DarkSeaGreen", "DarkSlateBlue", "DarkSlateGray", "DarkSlateGrey", "DarkTurquoise", "DarkViolet", "DeepPink", "DeepSkyBlue", "DimGray", "DimGrey", "DodgerBlue", "FireBrick", "FloralWhite", "ForestGreen", "Fuchsia", "Gainsboro", "GhostWhite", "Gold", "GoldenRod", "Gray", "Grey", "Green", "GreenYellow", "HoneyDew", "HotPink", "IndianRed", "Indigo", "Ivory", "Khaki", "Lavender", "LavenderBlush", "LawnGreen", "LemonChiffon", "LightBlue", "LightCoral", "LightCyan", "LightGoldenRodYellow", "LightGray", "LightGrey", "LightGreen", "LightPink", "LightSalmon", "LightSeaGreen", "LightSkyBlue", "LightSlateGray", "LightSlateGrey", "LightSteelBlue", "LightYellow", "Lime", "LimeGreen", "Linen", "Magenta", "Maroon", "MediumAquaMarine", "MediumBlue", "MediumOrchid", "MediumPurple", "MediumSeaGreen", "MediumSlateBlue", "MediumSpringGreen", "MediumTurquoise", "MediumVioletRed", "MidnightBlue", "MintCream", "MistyRose", "Moccasin", "NavajoWhite", "Navy", "OldLace", "Olive", "OliveDrab", "Orange", "OrangeRed", "Orchid", "PaleGoldenRod", "PaleGreen", "PaleTurquoise", "PaleVioletRed", "PapayaWhip", "PeachPuff", "Peru", "Pink", "Plum", "PowderBlue", "Purple", "RebeccaPurple", "Red", "RosyBrown", "RoyalBlue", "SaddleBrown", "Salmon", "SandyBrown", "SeaGreen", "SeaShell", "Sienna", "Silver", "SkyBlue", "SlateBlue", "SlateGray", "SlateGrey", "Snow", "SpringGreen", "SteelBlue", "Tan", "Teal", "Thistle", "Tomato", "Turquoise", "Violet", "Wheat", "White", "WhiteSmoke", "Yellow", "YellowGreen" ][Math.floor(Math.random() * 148)];

      return new L.Polyline(pointList, {
        color: color,
        weight: 3,
        opacity: 0.5,
        smoothFactor: 1,
      });
    }
    // return 'undefined' if the item has no positions
  };

  /**
   * Return a new leaflet.Marker at the last position of the item.
   * The marker uses a "cursor" icon and is rotated to reflect the heading
   * of the item at its last known position.
   *
   * This function also configures the following event handlers:
   * @see this.clickItem() The function to call when clicking on the marker.
   * @see L.Marker.openPopup() The function to call on mouseover.
   * @see L.Marker.closePopup() The function to call on mouseout.
   *
   * @param {Object} item The item that should be updated.
   * @param {string} item.id The ID of the item.
   * @param {Object} item.doc The item's database document object.
   * @param {string} item.doc.identifier The item's identifier.
   * @param {Object} item.doc.properties The item's properties.
   * @param {string} item.doc.properties.name The item's name.
   * @param {Object[]} item.positions The array of positions of the item.
   * @param {Object} item.positions.doc A position's database document object.
   * @param {number} item.positions.doc.lat The latitude coordinate.
   * @param {number} item.positions.doc.lon The longitude coordinate.
   * @param {number} item.positions.doc.heading The heading direction at a position.
   * @returns L.Marker
   */
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


        let icon;
        let caption = '';
        console.log(item.doc);
        if(localStorage.settings_showcaptions === 'true'&&
          typeof item.doc.properties.name !== undefined){
          caption = '<span class="itemCaption">'+item.doc.properties.name+'</span>';
        }

        if (
          item.doc.template !== 'case' &&
          item.doc.template !== 'vehicle' &&
          typeof item.doc.properties.icon !== undefined
        ) {
          icon = L.divIcon({
            className: 'vehicle-marker',
            html:
              '<div><span class="el-icon-' +
              item.doc.properties.icon +
              '"></span>'+caption+'</div>',
          });
        } else {
          icon = L.divIcon({
            className: 'vehicle-marker',
            html: '<div><img src="/gfx/icons/cursor.png" style="' + style + '">'+caption+'</div>',
          });
        }

        if (
          typeof v.doc.lat !== 'undefined' &&
          typeof v.doc.lon !== 'undefined'
        ) {
          // create a new marker with the given lat/lon position and icon
          marker = L.marker([v.doc.lat, v.doc.lon], { icon: icon });
          // on click, call this mapWrapper's clickItem() function
          // without overwriting its "this" module (?), but
          // with binding its first parameter to the item's ID:
          marker.on('click', L.bind(self.clickItem, null, item.id));
          // Use the item's identifier (and its name if applicable) as Pop-up
          let popupcontent = item.doc.identifier.toString();
          if (item.doc.properties.name) {
            popupcontent += ' - ' + item.doc.properties.name;
          }
          // bind the popupcontent to the marker. Used by openPopup() below
          marker.bindPopup(popupcontent);
          // on mouseover, the marker's openPopup() function shall be called
          marker.on('mouseover', function() {
            // call leaflet's Marker.openPopup() function, displaying the
            // popupcontent that has been bound to this marker just above.
            this.openPopup();
          });
          // on mouseout, the marker's closePopup() function shall be called
          marker.on('mouseout', function() {
            // call leaflet's Marker.closePopup() function
            this.closePopup();
          });
          return marker;
        }
      }
      // return 'undefined' if lat or lon are 'undefined'
    }
    // return 'undefined' if the item has no positions
  };

  /**
   * Adds the given item onto the map.
   * The given item will be prepared and replaces any previous
   * instances of this item on the map.
   *
   * @see this.loadTemplatedItem() Used to prepare item for display on map.
   * @see this.generateLine() Used to generate a polyline for the item.
   * @see this.generateMarker() Used to generate a marker for the item
   *
   * @param {Object} item The item that should be updated.
   * @param {string} item.id The ID of the item.
   * @param {Object} item.doc The item's database document object.
   * @param {string} item.doc.template The template of the item
   * @param {Object[]} item.positions The array of positions of the item.
   */
  this.addItemToMap = function(item) {
    item = this.loadTemplatedItem(item);

    var line = false,
    marker = false,
    lineCaptions = false;

    if (item.positions.length == 1) {
      item.positions[1] = item.positions[0];
    }
    if (typeof item.positions != 'undefined' && item.positions.length > 0) {
      line = this.generateLine(item);
      marker = this.generateMarker(item);

      //load linecaptions only if it is set in settings
      if(localStorage.settings_positiontimestamps == 'true')
        lineCaptions = this.generateLineCaption(item,true);

      this.loaded_items[item.id] = {};
      if (marker) {
        this.loaded_items[item.id].marker = marker;
        this.loaded_items[item.id].marker = marker.addTo(this.map);

      }
      if (lineCaptions) {
        this.loaded_items[item.id].lineCaptions = lineCaptions;
        for(let i in this.loaded_items[item.id].lineCaptions){
          this.loaded_items[item.id].lineCaptions[i].addTo(this.map);
        }
      }
      if (item.doc.base_template == 'line' && line) {
        this.loaded_items[item.id].line = line;
        this.loaded_items[item.id].line.addTo(this.map);
      }
    }
  };

  /**
   * Updates a loaded item's position on the map and ensures it is visible.
   *
   * @see this.addItemToMap() Used to add an item to the map if not present.
   *
   * @param {Object} item The item that should be updated.
   * @param {string} item.id The ID of the item.
   * @param {Object[]} item.positions The array of positions of the item.
   * @param {Object} item.positions.doc A position's database document object.
   * @param {number} item.positions.doc.lat The latitude coordinate.
   * @param {number} item.positions.doc.lon The longitude coordinate.
   * @returns {boolean} False if the item has no positions; undefined otherwise.
   */
  this.updateItemPosition = function(item) {
    console.log('updateItemPosition');
    console.log(item);
    if (item.positions.length < 1) {
      console.log('no positions available')
      return false;
    }
    if (typeof this.loaded_items[item.id] == 'undefined') {

      console.log('add item');
      this.addItemToMap(item);


    } else {

      console.log('update item', this.loaded_items[item.id]);
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


      if(this.loaded_items[item.id].lineCaptions){
        for(let i in this.loaded_items[item.id].lineCaptions){
            this.loaded_items[item.id].lineCaptions[i].setOpacity(1).update();
        }
      }
    }
  };

  /**
   * Hides the given item from the map.
   * @param {string} item_id The ID of the item that should be hidden
   */
  this.hideItem = function(item_id) {
    if (typeof this.loaded_items[item_id] !== 'undefined') {
      this.loaded_items[item_id].line.setStyle({
        opacity: 0,
      });
      this.loaded_items[item_id].marker.setOpacity(0).update();


      for(let i in this.loaded_items[item_id].lineCaptions){
          this.loaded_items[item_id].lineCaptions[i].setOpacity(0).update();
      }
    }
  };

  /**
   * Calculates the geographical distance between two points on the map, in meters.
   * @param {Object} point1 The first point for distance calculation
   * @param {number} point1.lat Latitude of first point
   * @param {number} point1.lon Longitude of first point
   * @param {Object} point2 The second point for distance calculation
   * @param {number} point2.lat Latitude of second point
   * @param {number} point2.lon Longitude of second point
   * @returns {number} The distance in meters (CI unit)
   */
  this.getDistance = function(point1, point2) {
    let latlng1 = L.latLng(point1.lat, point1.lon);
    let latlng2 = L.latLng(point2.lat, point2.lon);
    return latlng1.distanceTo(latlng2);
  };
};

export default new mapWrapper();
