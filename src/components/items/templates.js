module.exports = {

get:function(name){

    var templates = {
        'case':{
            plural:'Cases',
            pouch_identifier:'CASE',
            add_initial_position:true,
            type:'line',
            fields:[
              {
                'name':'status',
                'title':'Status',
                'type':'select',
                'options':
                  {
                    'closed':'closed',
                    'attended':'attended',
                    'possible_target':'possible_target',
                    'confirmed':'confirmed',
                    'critical':'critical'
                  }
              },
              {
                'name':'boat_type',
                'title':'Boat Type',
                'type':'select',
                'options':
                  {
                    'wood':'wood',
                    'rubber':'rubber',
                    'other':'other',
                  }
              },
              {
                'name':'engine_working',
                'title':'Engine Working',
                'type':'select',
                'options':
                  {
                    'true':'yes',
                    'false':'no'
                  }
              },
              {
                'name':'boat_color',
                'title':'Boat Color',
                'type':'color'
              },
              {
                'name':'pob_total',
                'title':'People On Board',
                'type':'number',
                'step':1
              },
              {
                'name':'pob_women',
                'title':'Women On Board',
                'type':'number',
                'step':1
              },
              {
                'name':'pob_men',
                'title':'Men On Board',
                'type':'number',
                'step':1
              },
              {
                'name':'pob_minors',
                'title':'Minors On Board',
                'type':'number',
                'step':1
              },
              {
                'name':'pob_medical_cases',
                'title':'Medical Cases On Board',
                'type':'number',
                'step':1
              }
            ]
        },
        'vehicle':{
            plural:'Vehicles',
            pouch_identifier:'VEHICLE',
            add_initial_position:false,
            type:'line',
            fields : [
                {
                    'name':'name',
                    'title':'title',
                    'type':'text'
                },
                {
                    'name':'air',
                    'title':'Air',
                    'type':'select',
                    'options':
                      {
                        'false':'false',
                        'true':'true'
                      }
                },
                {
                    'name':'tracking_type',
                    'title':'Tracking Type',
                    'type':'select',
                    'options':
                      {
                        'AIS':'AIS',
                        'IRIDIUMGO':'IRIDIUMGO'
                      }
                },
                {
                    'name':'get_historical_data_since',
                    'title':'Get historical data since (days)',
                    'type':'number',
                    'value':-1,
                    'step':1
                },
                {
                    'name':'MMSI',
                    'title':'MMSI',
                    'type':'number',
                    'step':1
                },
                {
                    'name':'iridium_sender_mail',
                    'title':'Iridium Sender Mail (for iridium tracking only)',
                    'type':'text'
                },
                {
                    'name':'color',
                    'title':'Color',
                    'type':'color'
                },
                {
                    'name':'active',
                    'title':'Active',
                    'type':'select',
                    'options':
                      {
                        'true':'true',
                        'false':'false'
                      }
                },
            ]
        },
        'sighting':{
                plural:'Sightings',
                pouch_identifier:'SIGHTING',
                add_initial_position:false,
                type:'line',
                fields : [
                    {
                        'name':'name',
                        'title':'title',
                        'type':'text'
                    },
                    {
                        'name':'comment',
                        'title':'comment',
                        'type':'text'
                    },
                    {
                        'name':'color',
                        'title':'Color',
                        'type':'select',
                        'options':
                          {
                            'red':'red',
                            'yellow':'yellow',
                            'blue':'blue'
                          }
                    },
                ]
            }
        }
    if(name == 'all')
      return templates;
    return templates[name];
}


}
