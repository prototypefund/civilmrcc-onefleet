export default {
  get_filter_groups: function() {
    /** Defines which types of items should be shown in which navigation bar tab and/or map layer in the UI */
    return [
      {
        title: 'Cases',
        selectable_in_sidebar: true,
        selectable_on_map: true,
        initially_selected_on_map: true,
        filters: [
          {
            name: 'Filtergroup Template',
            field: 'template',
            values: ['case'],
            always_active: true,
          },
          {
            name: 'Status: Open',
            field: 'properties.status',
            values: [
              'open_confirmed',
              'open_attended',
              'open_lost',
              'attended', // deprecated, but some cases might still use this status
              'unattended', // deprecated, but some cases might still use this status
              'critical', // deprecated, but some cases might still use this status
            ],
            initially_active: true,
          },
          {
            name: 'Status: Closed',
            field: 'properties.status',
            values: [
              'closed_rescued',
              'closed_intercepted',
              'closed_shipwrecked',
              'closed_arrived',
              'closed', // deprecated, but some cases might still use this status
            ],
          },
          // Not yet implemented:
          // {
          //   name: 'First Seen in last 7 days',
          //   field: 'properties.first_seen',
          //   values: ['$gte(now - 7)'],
          // },
          // {
          //   name: 'Last Position < 2 days ago',
          //   field: 'position.timestamp',
          //   values: ['$gte(now - 2)'],
          // },
        ],
        sortings: [],
      },
      {
        title: 'Civil Fleet',
        selectable_in_sidebar: true,
        selectable_on_map: true,
        initially_selected_in_sidebar: true,
        initially_selected_on_map: true,
        filters: [
          {
            name: 'Filtergroup Templates',
            field: 'template',
            values: ['vehicle', 'aircraft'],
            always_active: true,
          },
          {
            name: 'Filtergroup Categories',
            field: 'properties.category',
            values: ['civilfleet'],
            always_active: true,
          },
          {
            name: 'Active Vehicles',
            field: 'properties.active',
            values: ['true'],
            initially_active: true,
          },
          {
            name: 'Inactive Vehicles',
            field: 'properties.active',
            values: ['false'],
          },
          {
            name: 'Aircraft',
            field: 'properties.air',
            values: ['true'],
          },
          {
            name: 'Ships',
            field: 'properties.air',
            values: ['false'],
          },
          // Not yet implemented:
          // {
          //   name: 'Last Position < 5 days ago',
          //   field: 'position.timestamp',
          //   values: ['$gte($now - 5)'],
          // },
        ],
        sortings: [],
      },
      {
        title: 'Other',
        selectable_in_sidebar: true,
        selectable_on_map: false,
        filters: [
          {
            name: 'Filtergroup Templates',
            field: 'template',
            values: ['landmark', 'vehicle', 'aircraft'],
            always_active: true,
          },
          {
            name: 'Filtergroup Categories',
            field: 'properties.category',
            values: ['!civilfleet'],
            always_active: true,
          },
          {
            name: 'Only Ships & Aircraft',
            field: 'template',
            values: ['vehicle', 'aircraft'],
          },
          {
            name: 'Only Landmarks',
            field: 'template',
            values: ['landmark'],
          },
          {
            name: 'Only Commercial & Military',
            field: 'properties.category',
            values: ['commercial', 'military'],
          },
          {
            name: 'Only Cities & Beaches',
            field: 'properties.category',
            values: ['city', 'beach'],
          },
          {
            name: 'Only Wind & Oil Fields',
            field: 'properties.category',
            values: ['oil_field', 'wind_farm'],
          },
          {
            name: 'Hide Commercial Vessels',
            field: 'properties.category',
            values: ['!commercial'],
            initially_active: true,
          },
          {
            name: 'Hide Military Vessels',
            field: 'properties.category',
            values: ['!military'],
          },
        ],
        sortings: [],
      },
      {
        title: 'SAR Zones',
        selectable_in_sidebar: false,
        selectable_on_map: true,
        initially_selected_on_map: true,
        filters: [
          {
            name: 'Filtergroup Templates',
            field: 'template',
            values: ['sarzone'],
            always_active: true,
          },
          {
            name: 'Only Central Med',
            field: 'properties.category',
            values: ['centralmed'],
          },
        ],
        sortings: [],
      },
    ];
  },

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
              open_attended: 'Open (Attended)',
              open_lost: 'Open (Lost Contact)',
              closed_rescued: 'Closed (Rescued)',
              closed_intercepted: 'Closed (Intercepted)',
              closed_shipwrecked: 'Closed (Shipwrecked)',
              closed_arrived: 'Closed (Arrived)',
            },
          },
          {
            name: 'boat_type',
            title: 'Boat Type',
            type: 'select',
            options: {
              wood: 'wood',
              rubber: 'rubber',
              other: 'other',
            },
          },
          {
            name: 'first_seen',
            title: 'First Seen',
            type: 'datetime',
          },
          {
            name: 'engine_working',
            title: 'Engine Working',
            type: 'select',
            options: {
              true: 'yes',
              false: 'no',
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
            step: 1,
          },
          {
            name: 'pob_women',
            title: 'Women On Board',
            type: 'number',
            step: 1,
          },
          {
            name: 'pob_men',
            title: 'Men On Board',
            type: 'number',
            step: 1,
          },
          {
            name: 'pob_minors',
            title: 'Minors On Board',
            type: 'number',
            step: 1,
          },
          {
            name: 'pob_medical_cases',
            title: 'Medical Cases On Board',
            type: 'number',
            step: 1,
          },
          {
            name: 'ap_contact',
            title: 'Alarmphone Contact',
            type: 'select',
            options: {
              true: 'yes',
              false: 'no',
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
              pullback_libya: 'Pullback to Libya',
              closed: 'Rescued/Closed',
            },
          },
          {
            name: 'people_drowned',
            title: 'People Drowned',
            type: 'number',
            step: 1,
          },
          {
            name: 'people_missing',
            title: 'People Missing',
            type: 'number',
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
            },
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
        },
      },
    };
    if (name == 'all') return templates;
    return templates[name];
  },
};
