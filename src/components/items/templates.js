export default {
  get: function(name) {
    var templates = {
      case: {
        plural: 'Cases',
        pouch_identifier: 'CASE',
        add_initial_position: true,
        type: 'line',
        fields: [
          {
            name: 'status',
            title: 'Status',
            type: 'select',
            options: {
              open_confirmed: 'Open (Confirmed Visually)',
              open_lost: 'Open (Lost Contact)',
              open_unknown: 'Open (unknown)',
              approaching: 'Approaching',
              attending: 'Attending',
              diembarked: 'Disembarked from DV',
              closed: 'Closed',
            },
          },
          {
            name: 'boat_type',
            title: 'Boat Type',
            type: 'select',
            options: {
              wood: 'wood',
              rubber: 'rubber',
              fiberglass: 'fiberglass',
              unknown: 'unknown',
            },
          },
          {
            name: 'confirmation_by',
            title: 'Confirmation by',
            type: 'text',
          },
          {
            name: 'engine_working',
            title: 'Engine Working',
            type: 'select',
            options: {
              yes: 'yes',
              no: 'no',
              unknown: 'unknown',
            },
          },
          {
            name: 'boat_color',
            title: 'Boat Color',
            type: 'color',
          },
          {
            name: 'pob_total',
            title: 'People On Board',
            type: 'number',
            value: 0,
            step: 1,
          },
          {
            name: 'pob_women',
            title: 'Women On Board',
            type: 'number',
            value: 0,
            step: 1,
          },
          {
            name: 'pob_men',
            title: 'Men On Board',
            type: 'number',
            value: 0,
            step: 1,
          },
          {
            name: 'pob_minors',
            title: 'Minors On Board',
            type: 'number',
            value: 0,
            step: 1,
          },
          {
            name: 'pob_medical_cases',
            title: 'Medical Cases On Board',
            type: 'number',
            value: 0,
            step: 1,
          },
          {
            name: 'ap_contact',
            title: 'Alarmphone Contact',
            type: 'select',
            options: {
              yes: 'yes',
              no: 'no',
              no_involvement: 'no involvement',
              unknown: 'unknown',
            },
          },
          {
            name: 'actors_involved',
            title: 'Actors Involved',
            type: 'text',
          },
          {
            name: 'Outcome',
            title: 'Outcome',
            type: 'select',
            options: {
              pos: 'Port of Safty',
              shipwreck: 'Shipwreck',
              arrived_on_its_own: 'Arrived on its own',
              intercepted: 'Intercepted',
              pullback_libya: 'Pullback to Libya',
              pullback_tunisia: 'Pullback to Tunisia',
              other: 'other',
              unknown: 'unknown',
            },
          },
          {
            name: 'people_drowned',
            title: 'People Drowned',
            type: 'number',
            value: 0,
            step: 1,
          },
          {
            name: 'people_missing',
            title: 'People Missing',
            type: 'number',
            value: 0,
            step: 1,
          },
          {
            name: 'airplane_involvement',
            title: 'Airplane Involvement',
            type: 'select',
            options: {
              discovered: 'Discovered',
              verified: 'Verified',
              not_found: 'Not found',
              no_involvement: 'No involvement',
              unknown: 'unknown',
            },
          },
          {
            name: 'authorities_alerted',
            title: 'Authorities Alerted: who & when',
            type: 'text',
          },
          {
            name: 'disembarked_by',
            title: 'Disembarked from DV by',
            type: 'text',
          },
          {
            name: 'arrived_when_where',
            title: 'Arrived: when & where',
            type: 'text',
          },
          {
            name: 'phonenumber',
            title: 'Phonenumber',
            type: 'number',
          },
          {
            name: 'Depature_place_time',
            title: 'Depature place and time',
            type: 'text',
          },
          {
            name: ' Notes',
            title: 'Notes',
            type: 'text',
          },
        ],
      },
      vehicle: {
        plural: 'Vehicles',
        pouch_identifier: 'VEHICLE',
        add_initial_position: false,
        type: 'line',
        fields: [
          {
            name: 'name',
            title: 'title',
            type: 'text',
          },
          {
            name: 'category',
            title: 'Affiliation Category',
            type: 'select',
            options: {
              unknown: 'Still Unknown',
              import: 'Import',
              civilfleet: 'Civilfleet',
              commercial: 'Commercial',
              military: 'Military',
              other: 'Other',
            },
          },
          {
            name: 'air',
            title: 'Air',
            type: 'select',
            options: {
              false: 'false',
              // true: 'true',
            },
          },
          {
            name: 'tracking_type',
            title: 'Tracking Type',
            type: 'select',
            options: {
              AIS: 'AIS',
              IRIDIUMGO: 'IRIDIUMGO',
            },
          },
          {
            name: 'get_historical_data_since',
            title: 'Get historical data since (days)',
            type: 'number',
            value: -1,
            step: 1,
          },
          {
            name: 'MMSI',
            title: 'MMSI',
            type: 'number',
            step: 1,
          },
          {
            name: 'iridium_sender_mail',
            title: 'Iridium Sender Mail (for iridium tracking only)',
            type: 'text',
          },
          {
            name: 'color',
            title: 'Color',
            type: 'color',
          },
          {
            name: 'fleetmon_vessel_id',
            title: 'Fleetmon Vessel ID',
            type: 'number',
            hidden: true,
          },
          {
            name: 'active',
            title: 'Active',
            type: 'select',
            options: {
              true: 'true',
              false: 'false',
            },
          },
        ],
      },
      aircraft: {
        plural: 'Aircraft',
        pouch_identifier: 'AIR',
        add_initial_position: false,
        type: 'line',
        fields: [
          {
            name: 'name',
            title: 'title',
            type: 'text',
          },
          {
            name: 'category',
            title: 'Category',
            type: 'select',
            options: {
              civilfleet: 'Civilfleet',
              import: 'Import',
              commercial: 'Commercial',
              military: 'Military',
              unknown: 'Still Unknown',
              other: 'Other',
            },
          },
          {
            name: 'air',
            title: 'Air',
            type: 'select',
            options: {
              // false: 'false',
              true: 'true',
            },
          },
          {
            name: 'tracking_type',
            title: 'Tracking Type',
            type: 'select',
            options: {
              AIS: 'AIS',
              IRIDIUMGO: 'IRIDIUMGO',
            },
          },
          {
            name: 'get_historical_data_since',
            title: 'Get historical data since (days)',
            type: 'number',
            value: -1,
            step: 1,
          },
          {
            name: 'ADSB',
            title: 'ADS-B',
            type: 'number',
            step: 1,
          },
          {
            name: 'iridium_sender_mail',
            title: 'Iridium Sender Mail (for iridium tracking only)',
            type: 'text',
          },
          {
            name: 'color',
            title: 'Color',
            type: 'color',
          },
          {
            name: 'fleetmon_vessel_id',
            title: 'Fleetmon Vessel ID',
            type: 'number',
          },
          {
            name: 'active',
            title: 'Active',
            type: 'select',
            options: {
              true: 'true',
              false: 'false',
            },
          },
        ],
      },
      landmark: {
        plural: 'Landmarks',
        pouch_identifier: 'LANDMARK',
        add_initial_position: true,
        type: 'line',
        fields: [
          {
            name: 'name',
            title: 'Name',
            type: 'text',
          },
          {
            name: 'category',
            title: 'Landmark Category',
            type: 'select',
            options: {
              oil_field: 'Oil Field / Wind Farm',
              sand_bank: 'Sand Bank',
              island: 'Island Centre',
              beach: 'Beach',
              city: 'City/Port',
            },
          },
          {
            name: 'comment',
            title: 'Comments',
            type: 'text',
          },
          {
            name: 'icon',
            title: 'Icon',
            type: 'icon',
          },
          {
            name: 'testtag',
            title: 'testtag',
            type: 'tag',
          },
        ],
      },
      droppoint: {
        plural: 'Droppoint',
        pouch_identifier: 'DROPPOINT',
        add_initial_position: true,
        type: 'point',
        fields: [
          {
            name: 'name',
            title: 'title',
            type: 'text',
          },
          {
            name: 'created_by_vehicle',
            title: 'Created by vehicle',
            type: 'text',
          },
          {
            name: 'comment',
            title: 'comment',
            type: 'text',
          },
        ],
      },
    };
    if (name == 'all') return templates;
    return templates[name];
  },
};
