import * as L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-mouse-position';
import { SARZones } from '../constants/sar-zones';
import storage from './storageWrapper';
import { SARZone } from '@/types/sar-zone';
import { MapItem } from '../types/map-item';
import { DbItem } from '@/types/db-item';
import { DbPosition } from '@/types/db-position';

/**
 * The mapWrapper is an abstraction layer from the underlying mapping backend. (Currently leaflet.js)
 * It also provides some convenience methods for recurring map-related tasks.
 */
class mapWrapper {
  public map!: L.Map;
  public popup_contents!: any;
  public loaded_items: {
    [index: string]: {
      marker: L.Marker<any>;
      lineCaptions: L.Marker<any>[];
      line: L.Polyline<any, any>;
    };
  } = {};
  public sarZoneLayerGroup = L.layerGroup();
  public sarZoneIsVisible = true;
  public markerGroup = L.layerGroup();

  /**
   * Initialises the map backend component.
   * @param mapId The id of the div element that this map will be placed in
   * @param popup_contents A callable that provides a div element for popups when requested.
   * @memberof mapWrapper
   */
  public init(mapId: string, popup_contents: any): void {
    this.popup_contents = popup_contents;

    /** Map Zoom and Center */
    let mapcenter: [number, number];
    let mapzoom: number;
    try {
      mapzoom = storage.get('mapzoom');
      mapcenter = JSON.parse(storage.get('mapcenter'));
    } catch (err) {
      console.error('could not load mapcenter and zoom from localstorage', err);
      mapcenter = [38.57, 10.7];
      mapzoom = 5;
    }
    if (!mapzoom) mapzoom = 5;
    if (!mapcenter) mapcenter = [38.57, 10.7];

    /** prepare Tiles start */
    let onefleet_tiles = L.tileLayer('/MapTiles/{z}/{x}/{y}.png', {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetzMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 10, // onefleet map tiles don't exist above 10
      minZoom: 3,
      noWrap: true,
      id: 'groundtile',
    });
    let openstreetmap_tiles = L.tileLayer(
      'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
      {
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetzMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        minZoom: 3,
        noWrap: true,
        id: 'groundtile',
      }
    );
    let seamap_tiles = L.tileLayer(
      'http://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',
      {
        attribution: '',
        maxZoom: 18,
        minZoom: 9, // seamap tiles don't exists below 9
        noWrap: true,
        id: 'openseamap',
        accessToken: '',
      }
    );
    /** prepare Tiles end */

    /* prepare LayerGroups start */
    // var item_group_one = L.layerGroup([]); // placeholders
    // var item_group_two = L.layerGroup([]);
    // var item_group_three = L.layerGroup([]);
    // var item_group_four = L.layerGroup([]);
    /* prepare LayerGroups end */

    var baseMaps = {
      'Onefleet Map': onefleet_tiles,
      OpenStreetMap: openstreetmap_tiles,
    };
    var overlayMaps = {
      OpenSeamap: seamap_tiles,
      // Cases: item_group_one,
      // 'Civil Fleet': item_group_two,
      // 'Other Actors': item_group_three,
      // 'SAR Zones': item_group_four,
    };
    var startingMaps = [
      localStorage.settings_maptiles == 'onefleet'
        ? onefleet_tiles
        : openstreetmap_tiles,
      // item_group_one,
    ];
    if (localStorage.settings_openseamap == 'true')
      startingMaps.push(seamap_tiles);

    /** instantiate Map object start */
    this.map = L.map(mapId, {
      center: mapcenter,
      zoom: mapzoom,
      layers: startingMaps,
    });
    /** instantiate Map object end */

    /** Control setup */
    L.control.layers(baseMaps, overlayMaps).addTo(this.map);

    L.control.scale({ imperial: false }).addTo(this.map);

    /* Measurement Tools for measuringdistances and angles */
    (L.control as any)
      .polylineMeasure({
        // config follows https://developer.aliyun.com/mirror/npm/package/leaflet.polylinemeasure
        position: 'topright',
        unit: 'nauticalmiles',
        measureControlTitleOn: 'Measure Distances and Angles', // Title for the control going to be switched on
        measureControlTitleOff: 'Clear Measurements', // Title for the control going to be switched off
        measureControlLabel: '&#8614;', // HTML to place inside the control. Default: &#8614;
        backgroundColor: '#8f8', // Background color for control when selected. Default: #8f8
        showBearings: true,
        // clearMeasurementsOnStop: false,
        // showClearControl: true,
        // showUnitControl: false,
      })
      .addTo(this.map);

    /* Allows us to draw shapes on the map, including dropping markers and what to do when clicked. */
    this._initShapeDrawing();

    //** SAR Zones setup (to be replaced with zones from database) */
    this._initSarZones(SARZones);
    this.map.addControl(this._createSarZoneToggleControl());

    //** Add mouse coordinates */
    L.control
      .mousePosition({
        position: 'bottomright',
        emptyString: '',
        formatter: (lng: number, lat: number) => {
          return (
            this.asDMS({ lat: lat, lon: lng }) +
            ' | ' +
            this.asDD({ lat: lat, lon: lng })
          );
        },
      })
      .addTo(this.map);

    this.map.on('move', () => {
      storage.set('mapzoom', (this.map as any)._zoom);
      storage.set(
        'mapcenter',
        JSON.stringify([this.map.getCenter().lat, this.map.getCenter().lng])
      );
    });

    console.log('map initiated');
  }

  /**
   * Creates a featureGroup with polygons of each given SAR Zone from the parameter.
   */
  private _initSarZones(sarZones: SARZone[]): void {
    this.map.addLayer(this.sarZoneLayerGroup);

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
  }

  //** Add a toggle for sar zones in map controls list */
  private _createSarZoneToggleControl() {
    var toggleSarZoneControl = L.Control.extend({
      options: {
        position: 'topright',
      },

      onAdd: () => {
        var container = L.DomUtil.create(
          'div',
          'leaflet-bar leaflet-control leaflet-control-custom'
        );

        let aTag = L.DomUtil.create(
          'a',
          'polyline-measure-unicode-icon',
          container
        );
        aTag.title = 'Turn on/off sar zones.';
        // Set icon
        L.DomUtil.addClass(aTag, 'polyline-measure-controlOnBgColor');
        L.DomUtil.addClass(aTag, 'el-icon-view');

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
          } else {
            this.map.addLayer(this.sarZoneLayerGroup);
            L.DomUtil.addClass(aTag, 'polyline-measure-controlOnBgColor');
          }
        };

        return container;
      },
    });
    return new toggleSarZoneControl();
  }

  /** Method calls the flyTo method from leaflet.js
   * See also: https://leafletjs.com/reference-1.0.0.html
   * Sets the view of the map (geographical center and zoom) performing a smooth pan-zoom animation.
   * @param {[number, number]} positions The latitude/longitude coordinates.
   */
  public flyTo(positions: [number, number]) {
    this.map.flyTo(positions);
  }

  // Truncate value based on number of decimals
  private _round(num: number, len: number): number {
    return Math.round(num * Math.pow(10, len)) / Math.pow(10, len);
  }

  private _getDms(val: number, is_lat: boolean): string {
    let valDeg, valMin, valSec, hemi;

    if (is_lat) hemi = val >= 0 ? 'N' : 'S';
    else hemi = val >= 0 ? 'E' : 'W';

    val = Math.abs(val);
    valDeg = Math.floor(val);
    valMin = Math.floor((val - valDeg) * 60);
    valSec = Math.round((val - valDeg - valMin / 60) * 3600 * 10) / 10;
    return valDeg + 'º ' + valMin + "' " + valSec + '" ' + hemi;
  }

  // Public helper method to format UI position objects
  public asDMS(position: { lat: number; lon: number }): string {
    if (!position) return 'No Position';
    let latDms = this._getDms(position.lat, true);
    let lngDms = this._getDms(position.lon, false);
    return latDms + ', ' + lngDms;
  }

  // Public helper method to format UI position objects
  public asDD(position: { lat: number; lon: number }): string {
    if (!position) return 'No Position';
    let len = 5;
    return (
      '' +
      Math.round(position.lat * Math.pow(10, len)) / Math.pow(10, len) +
      'º, ' +
      Math.round(position.lon * Math.pow(10, len)) / Math.pow(10, len) +
      'º'
    );
  }

  // Generate popup content based on layer type
  // - Returns HTML string, or null if unknown object
  private _getDrawnShapePopupContent(layer): string | null | any {
    let latlngs, distance: number, area;
    if (
      layer instanceof L.Marker ||
      layer instanceof L.CircleMarker ||
      layer instanceof L.Circle
    )
      // Marker - add lat/long
      return map_object =>
        this.popup_contents('drawn_marker_popup', {
          position: {
            lat: map_object.getLatLng().lat,
            lon: map_object.getLatLng().lng,
          },
          // radius: map_object.getRadius ? map_object.getRadius() : 0,
          item_id: '',
          item_title: 'Unknown Item',
        });
    else if (layer instanceof L.Polygon)
      // Rectangle/Polygon - area
      return map_object => {
        let area_positions = map_object._defaultShape
          ? map_object._defaultShape()
          : map_object.getLatLngs();
        let area_geodesic = L.GeometryUtil.geodesicArea(area_positions);
        let popup_data: {
          area_readable: String;
          positions: { lat: number; lon: number }[];
        } = {
          area_readable: L.GeometryUtil.readableArea(area_geodesic, true),
          positions: this._convertPositionTypes(area_positions),
        };
        return this.popup_contents('drawn_area_popup', popup_data);
      };
    else if (layer instanceof L.Polyline)
      // Polyline - distance
      return map_object => {
        let popup_data: {
          distance_in_meters: number;
          positions: { lat: number; lon: number }[];
        } = {
          distance_in_meters: -1,
          positions: [],
        };
        layer = layer as any;
        latlngs = layer._defaultShape
          ? layer._defaultShape()
          : layer.getLatLngs();
        distance = 0;
        if (latlngs.length > 1) {
          for (var i = 0; i < latlngs.length - 1; i++) {
            distance += latlngs[i].distanceTo(latlngs[i + 1]);
          }
          popup_data.distance_in_meters = distance;
          popup_data.positions = this._convertPositionTypes(latlngs);
        }
        return this.popup_contents('drawn_track_popup', popup_data);
      };
    return null;
  }

  /**
   * Converts leaflet LatLng objects to general objects.
   * Note: `lng` gets changed to `lon` because the consuming code expects that.
   */
  private _convertPositionTypes(
    latlngs: L.LatLng[]
  ): { lat: number; lon: number }[] {
    return latlngs.map(pos => ({ lat: pos.lat, lon: pos.lng }));
  }

  /**
   * Sets up the ability to draw shapes on the map, including dropping markers and what to do when clicked.
   */
  private _initShapeDrawing(): void {
    /* Add a layer for drawing shapes in. These can then be added to items as positions, areas, etc */
    let drawnItems = new L.FeatureGroup();
    this.map.addLayer(drawnItems);

    //** Add the standard Map actions. */
    let drawing_toolbar = new L.Control.Draw({
      edit: {
        featureGroup: drawnItems,
        poly: {
          allowIntersection: true,
        },
      } as any,
      draw: {
        polyline: {
          metric: false,
          feet: false,
          nautic: true,
        },
        polygon: {
          allowIntersection: true,
          showArea: true,
        },
        circle: false,
        circlemarker: false,
      },
    });
    this.map.addControl(drawing_toolbar);

    // Object created - bind popup to layer, add to feature group
    this.map.on(L.Draw.Event.CREATED, event => {
      var layer = event.layer;
      var content = this._getDrawnShapePopupContent(layer);
      if (content !== null) {
        layer.bindPopup(content);
      }
      drawnItems.addLayer(layer);
    });

    // Object(s) edited - update popups
    this.map.on(L.Draw.Event.EDITED, event => {
      var layers = (event as any).layers;
      layers.eachLayer(layer => {
        var content = this._getDrawnShapePopupContent(layer);
        if (content !== null) {
          layer.setPopupContent(content);
        }
      });
    });
  }

  /**
   * Prepares the given item for UI by converting templates to known base
   * templates, defining icons, and cropping the loaded number of positions
   * to an amount that can be handled by interactive display.
   */
  public prepareTemplatedItem(item: MapItem): MapItem {
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
      item.positions = item.positions.filter(position => {
        return min_date < new Date(position.doc.timestamp);
      });
    } else if (max_track_type == 'date_range') {
      // filter out positions by date range from local storage
      let min_date = new Date(localStorage.settings_track_startdate);
      let max_date = new Date(localStorage.settings_track_enddate);
      item.positions = item.positions.filter(position => {
        let date = new Date(position.doc.timestamp);
        return max_date > date && date > min_date;
      });
    }

    return item;
  }

  /**
   * Removes all layers from the map, thereby clearing it.
   */
  public clearMap(): void {
    let i = 0;
    this.map.eachLayer(layer => {
      if (i > 0) this.map.removeLayer(layer);
      i++;
    });
  }

  /**
   * Implemented in src/components/MapArea.vue
   * @param {string} item_id The ID of the item that was clicked
   */
  public clickItem() {}

  public generateLineCaption(item: MapItem): L.Marker[] | undefined {
    /*let max_length = 5;
    item.positions.slice(-1 * max_length);*/
    var markers: any = [];
    if (item.positions.length > 0) {
      for (var i in item.positions) {
        var v = item.positions[i];
        if (v.doc.lat && v.doc.lon) {
          let date = new Date(v.doc.timestamp);
          let caption =
            date.toISOString().slice(0, 10) +
            ' - ' +
            String(date.getHours()).padStart(2, '0') +
            ':' +
            String(date.getMinutes()).padStart(2, '0');
          let icon = L.divIcon({
            className: 'lineCaption',
            html: '<div>' + caption + '</div>',
          });
          //let marker = new L.marker([v.doc.lat, v.doc.lon], { opacity: 0.5 }); //opacity may be set to zero

          let marker = L.marker([v.doc.lat, v.doc.lon], { icon: icon });
          markers.push(marker);
        }
        //pointList.push()
      }

      return markers;
    }
  }

  /**
   * Return a new leaflet.Polyline consisting of the positions of the item.
   */
  public generateLine(item: MapItem): L.Polyline | undefined {
    /*let max_length = 5;
    item.positions.slice(-1 * max_length);*/
    var pointList: any = [];
    if (item.positions.length > 0) {
      let lastKnownPosition = item.positions[item.positions.length - 1];

      for (var i in item.positions) {
        var v = item.positions[i];
        if (v.doc.lat && v.doc.lon) pointList.push([v.doc.lat, v.doc.lon]);
        //pointList.push()
      }

      // color should always be defined: see this._buildMapItemFromDbItem()

      let color: string;
      if (typeof item.doc.properties.color != 'undefined')
        color = item.doc.properties.color;
      else
        color =
          '#' + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0');

      let track = new L.Polyline(pointList, {
        color: color,
        weight: 3,
        opacity: 1,
        smoothFactor: 1,
      });

      // Use the item's identifier (and its name if applicable) as Pop-up
      let popuptitle = (item.doc.identifier || '').toString();
      if (item.doc.properties.name) {
        popuptitle = item.doc.properties.name;
      } else {
        popuptitle = item.id;
      }
      // bind the popup content to the marker. Used by openPopup() below
      track.bindPopup(() =>
        this.popup_contents('item_track_popup', {
          item_id: item.id,
          item_title: popuptitle,
          latest_position: lastKnownPosition.doc,
        })
      );

      return track;
    }
  }

  /**
   * Generate marker icon HTML content string, using a stored PNG image.
   * @param rotation
   * @param size The size of the icon
   * @param caption The caption to display near the maker. May be an empty string.
   * @returns A HTML String that can be given to a leaflet divIcon constructor.
   */
  private _createImageMarkerHTML(
    rotation: number,
    size: number,
    caption: string
  ): string {
    var css_style = {
      transform: 'rotate(' + rotation + 'deg)',
      width: size + 'px',
      height: size + 'px',
      'margin-left': size / -2 + 'px',
      'margin-top': size / -2 + 'px',
    };
    let iconimg = document.createElement('img');
    iconimg.src = '/gfx/icons/cursor.png';
    for (var k in css_style) {
      iconimg.style.setProperty(k, css_style[k]);
    }
    let iconhtml = document.createElement('div');
    iconhtml.appendChild(iconimg);
    iconhtml.append(caption);
    return iconhtml.outerHTML;
  }

  /**
   * Generate marker icon HTML content string, using any unicode character.
   * @param character The unicode character to use as icon. Some rotation and scaling may be necessary.
   * @param rotation The rotation of the icon. May consist of item's heading plus some constant rotation.
   * @param size The size of the icon. Currently in unit 'pt', but may change.
   * @param color The color for the icon. By using unicode characters, we can easily reflect boat color by icon color.
   * @param caption The caption to display near the maker. May be an empty string.
   * @returns A HTML String that can be given to a leaflet divIcon constructor.
   */
  private _createCharacterMarkerHTML(
    character: string,
    rotation: number,
    size: number,
    color: string,
    caption: string
  ): string {
    let iconhtml = document.createElement('div');

    let iconimg = document.createElement('div');
    iconimg.textContent = character;
    iconimg.style.fontSize = size + 'pt';
    iconimg.style.transform = 'rotate(' + rotation + 'deg)';
    iconimg.style.color = color;
    iconimg.style.width = size + 'pt';
    iconimg.style.textAlign = 'center';
    // iconimg.style.webkitTextStrokeColor = 'black';
    // iconimg.style.webkitTextStrokeWidth = '0.3px';
    iconhtml.appendChild(iconimg);

    if (caption) {
      let span = document.createElement('span');
      span.className = 'itemCaption';
      span.append(caption);
      iconhtml.appendChild(span);
    }

    iconhtml.style.marginLeft = '-15px';
    iconhtml.style.marginTop = '-22px';
    return iconhtml.outerHTML;
  }

  /**
   * Generate marker icon HTML content string, using any unicode character.
   * @param character The unicode character to use as icon. Some rotation and scaling may be necessary.
   * @param rotation The rotation of the icon. May consist of item's heading plus some constant rotation.
   * @param size The size of the icon. Currently in unit 'pt', but may change.
   * @param color The color for the icon. By using unicode characters, we can easily reflect boat color by icon color.
   * @param caption The caption to display near the maker. May be an empty string.
   * @returns A HTML String that can be given to a leaflet divIcon constructor.
   */
  private _createSVGMarkerHTML(
    icon_type: string,
    rotation: number,
    size: number,
    color: string,
    caption: string
  ): string {
    let iconhtml = document.createElement('div');

    let iconimg = document.createElement('div');
    iconimg.className = 'fas fa-' + icon_type;
    // iconimg.style.fontSize = size + 'pt';
    iconimg.style.transform = 'rotate(' + rotation + 'deg)';
    iconimg.style.color = color;
    // iconimg.style.width = size + 'pt';
    // iconimg.style.textAlign = 'center';
    iconimg.style.strokeWidth = '1px';
    iconimg.style.webkitTextStrokeColor = 'black';
    iconimg.style.webkitTextStrokeWidth = '1px';
    iconhtml.appendChild(iconimg);

    if (caption) {
      let span = document.createElement('span');
      span.className = 'itemCaption';
      span.append(caption);
      iconhtml.appendChild(span);
    }

    iconhtml.style.marginLeft = '-7px';
    iconhtml.style.marginTop = '-10px';
    return iconhtml.outerHTML;
  }

  /**
   * Return a new leaflet.Marker at the last position of the item.
   * The marker uses a "cursor" icon and is rotated to reflect the heading
   * of the item at its last known position.
   *
   * This function also configures the following event handlers:
   * @see this.clickItem() The function to call when clicking on the marker.
   * @see L.Marker.openPopup() The function to call on mouseover.
   * @see L.Marker.closePopup() The function to call on mouseout.
   */
  public generateMarker(item: MapItem): L.Marker | undefined {
    if (typeof item.positions === 'undefined' || item.positions.length == 0) {
      return; // 'undefined' if the item has no positions
    }
    // use the last known position for the marker:
    var lastKnownPosition = item.positions[item.positions.length - 1];
    if (
      typeof lastKnownPosition.doc.lat == 'undefined' ||
      typeof lastKnownPosition.doc.lon == 'undefined'
    ) {
      return; // 'undefined' if lat or lon are 'undefined'
    }

    let caption = '';
    if (localStorage.settings_showcaptions === 'true') {
      if (item.doc.properties.name) {
        caption = item.doc.properties.name;
      } else {
        caption = item.doc.template + ' ' + item.doc.identifier;
      }
    }

    let icon;
    if (item.doc.properties.icon) {
      // use item-specific icon if given
      // icon = L.divIcon({
      //   className: 'vehicle-marker',
      //   html:
      //     '<div><span class="fas fa-' +
      //     item.doc.properties.icon +
      //     '"></span>' +
      //     caption +
      //     '</div>',
      // });
      icon = L.divIcon({
        className: 'vehicle-marker',
        html: this._createSVGMarkerHTML(
          item.doc.properties.icon,
          (lastKnownPosition.doc.heading || 0) - 90,
          20,
          item.doc.properties.color || 'black',
          caption
        ),
      });
    } else if (item.doc.template == 'case') {
      // set default case icon
      icon = L.divIcon({
        className: 'case-marker',
        html: this._createCharacterMarkerHTML(
          '⊳', // unicode 0x22B3 / html &#8883;
          (lastKnownPosition.doc.heading || 0) - 90,
          20,
          item.doc.properties.color || 'black',
          caption
        ),
      });
    } else if (item.doc.template == 'landmark') {
      // set default landmark icon
      icon = L.divIcon({
        className: 'landmark-marker',
        html: this._createCharacterMarkerHTML(
          '⟟', // unicode 0x27DF / html &#10207;
          lastKnownPosition.doc.heading || 0,
          20,
          item.doc.properties.color || 'black',
          caption
        ),
      });
    } else if (item.doc.template == 'airplane') {
      // set default airplane icon
      icon = L.divIcon({
        className: 'vehicle-marker',
        html: this._createCharacterMarkerHTML(
          '✈︎', // unicode 0x2708 / html &#9992;
          lastKnownPosition.doc.heading || 0,
          20,
          item.doc.properties.color || 'black',
          caption
        ),
      });
    } else if (
      item.doc.template == 'vehicle' ||
      typeof item.doc.template === 'undefined' // TODO fix (vehicle) items by using classes
    ) {
      // set default vehicle icon
      icon = L.divIcon({
        className: 'vehicle-marker',
        html: this._createCharacterMarkerHTML(
          '⩥', // unicode 0x2A65 / html &#10853;
          (lastKnownPosition.doc.heading || 0) - 90,
          20,
          item.doc.properties.color || 'black',
          caption
        ),
      });
    } else {
      // lazy fail: Do we want to raise an error here instead?
      console.log('Undefined item template for marker generation. Please fix.');
    }

    // create a new marker with the given lat/lon position and icon
    let marker = L.marker(
      [lastKnownPosition.doc.lat, lastKnownPosition.doc.lon],
      { icon: icon }
    );
    // Use the item's identifier (and its name if applicable) as Pop-up
    let popuptitle = (item.doc.identifier || '').toString();
    if (item.doc.properties.name) {
      popuptitle = item.doc.properties.name;
    } else {
      popuptitle = item.id;
    }
    // bind the popup content to the marker. Used by openPopup() below
    marker.bindPopup(() =>
      this.popup_contents('item_marker_popup', {
        item_id: item.id,
        item_title: popuptitle,
        latest_position: lastKnownPosition.doc,
      })
    );
    return marker;
  }

  /**
   * Adds the given item onto the map.
   * The given item will be prepared and replaces any previous
   * instances of this item on the map.
   *
   * @see this.prepareTemplatedItem() Used to prepare item for display on map.
   * @see this.generateLine() Used to generate a polyline for the item.
   * @see this.generateMarker() Used to generate a marker for the item
   */
  public addItemToMap(item: MapItem): void {
    item = this.prepareTemplatedItem(item);

    var line: L.Polyline | undefined,
      marker: L.Marker | undefined,
      lineCaptions: L.Marker[] | undefined;

    if (item.positions.length == 1) {
      item.positions[1] = item.positions[0];
    }
    if (typeof item.positions != 'undefined' && item.positions.length > 0) {
      line = this.generateLine(item);
      marker = this.generateMarker(item);

      //load linecaptions only if it is set in settings
      if (localStorage.settings_positiontimestamps == 'true')
        lineCaptions = this.generateLineCaption(item);

      this.loaded_items[item.id] = {
        line: {} as any,
        marker: {} as any,
        lineCaptions: {} as any,
      };
      if (marker) {
        this.loaded_items[item.id].marker = marker;
        this.loaded_items[item.id].marker = marker.addTo(this.map);
      }
      if (lineCaptions) {
        this.loaded_items[item.id].lineCaptions = lineCaptions;
        for (let i in this.loaded_items[item.id].lineCaptions) {
          this.loaded_items[item.id].lineCaptions[i].addTo(this.map);
        }
      }
      if (line) {
        this.loaded_items[item.id].line = line;
        this.loaded_items[item.id].line.addTo(this.map);
      }
    }
  }

  /**
   * Updates a loaded item's position on the map and ensures it is visible.
   *
   * @see this.addItemToMap() Used to add an item to the map if not present.
   * @returns {boolean} False if the item has no positions; undefined otherwise.
   */
  public updateItemPosition(item: MapItem): false | undefined {
    // console.log('updateItemPosition');
    // console.log(item)
    if (item.positions.length < 1) {
      return false;
    }
    if (typeof this.loaded_items[item.id] == 'undefined') {
      this.addItemToMap(item);
    } else {
      let lat = item.positions[item.positions.length - 1].doc.lat;
      let lon = item.positions[item.positions.length - 1].doc.lon;
      if (this.loaded_items[item.id].marker) {
        (this.loaded_items[item.id].marker
          .setLatLng([lat, lon])
          .setOpacity(1) as any).update();
      }

      if (this.loaded_items[item.id].line) {
        if (lat && lon) this.loaded_items[item.id].line.addLatLng([lat, lon]);

        this.loaded_items[item.id].line.setStyle({
          opacity: 1,
        });
      }

      if (this.loaded_items[item.id].lineCaptions) {
        for (let i in this.loaded_items[item.id].lineCaptions) {
          (this.loaded_items[item.id].lineCaptions[i].setOpacity(
            1
          ) as any).update();
        }
      }
    }
  }

  private _buildMapItemFromDbItem(
    base_item: DbItem,
    item_positions: Array<DbPosition>
  ): MapItem {
    return {
      id: base_item._id,
      doc: {
        template: base_item.template,
        identifier: base_item.identifier,
        properties: {
          name: base_item.properties.hasOwnProperty('name')
            ? base_item.properties['name']
            : base_item.template + ' ' + base_item.identifier,
          color: base_item.properties.hasOwnProperty('color')
            ? base_item.properties['color']
            : base_item.properties.hasOwnProperty('boat_color')
            ? base_item.properties['boat_color']
            : 'Black',
          icon:
            base_item.properties['air'] == 'true'
              ? 'plane'
              : base_item.properties['icon'],
        },
      },
      positions:
        item_positions != undefined
          ? item_positions.map(item => ({ doc: item }))
          : [],
    };
  }

  /**
   * Sets a map item's visibility and adds any new positions it might have gained
   * If the item is not on the map yet, add it to the map.
   */
  public updateItemOnMap(
    base_item: DbItem,
    item_positions: Array<DbPosition>,
    show_item: boolean
  ): void {
    if (show_item) {
      // todo: only build this when really necessary
      let map_item = this._buildMapItemFromDbItem(base_item, item_positions);
      this.updateItemPosition(map_item);
    } else this.hideItem(base_item._id);
  }

  /**
   * Creates a marker at specific coordinates.
   */
  public addMarkerByCoordinates(lat: number, lon: number, show: number): void {
    this.map.addLayer(this.markerGroup);
    let coords = new L.LatLng(lat, lon);
    var marker = new L.Marker(coords);
    marker.addTo(this.markerGroup);
    var marker_id = this.markerGroup.getLayerId(marker);

    let div = document.createElement('div');
    let content = document.createTextNode(
      'Lat: ' + lat + ', Lon: ' + lon + ' '
    );
    //div.innerText = "Lat: " + lat + ", Lon: " + lon +"<br></br>";
    let btn = document.createElement('button');
    div.appendChild(content);
    div.appendChild(btn);
    btn.innerText = 'Delete';
    btn.onclick = () => {
      this.markerGroup.removeLayer(marker_id);
    };
    marker.bindPopup(div).openPopup();
  }

  /**
   * Hides the given item from the map.
   */
  public hideItem(item_id: string): void {
    let item = this.loaded_items[item_id];
    if (item) {
      if (item.marker) {
        (item.marker.setOpacity(0) as any).update();
      }
      if (item.line) {
        item.line.setStyle({ opacity: 0 });
      }
      for (let i in item.lineCaptions) {
        (item.lineCaptions[i].setOpacity(0) as any).update();
      }
    }
  }

  /**
   * Calculates the geographical distance between two points on the map, in meters.
   * @returns {number} The distance in meters (CI unit)
   */
  public getDistance(
    point1: { lat: number; lon: number },
    point2: { lat: number; lon: number }
  ): number {
    let latlng1 = L.latLng(point1.lat, point1.lon);
    let latlng2 = L.latLng(point2.lat, point2.lon);
    return latlng1.distanceTo(latlng2);
  }
}

export default new mapWrapper();
