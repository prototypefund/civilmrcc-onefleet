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
};
