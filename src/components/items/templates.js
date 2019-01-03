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
                    'critical':'critical',
                    'need_help':'need_help'
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
                'name':'enginge_working',
                'title':'Enginge Working',
                'type':'select',
                'options':
                  {
                    'true':'yes',
                    'false':'no'
                  }
              },
              {
                'name':'people_on_baoard',
                'title':'People On Board',
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
                    'name':'tracking_type',
                    'title':'Tracking Type',
                    'type':'select',
                    'options':
                      {
                        'AIS':'AIS'
                      }
                },
                {
                    'name':'MMSI',
                    'title':'MMSI',
                    'type':'text'
                },
                {
                    'name':'color',
                    'title':'Color',
                    'type':'text'
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
        }
    }
    if(name == 'all')
      return templates;
    return templates[name];
}


}