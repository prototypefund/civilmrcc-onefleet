module.exports = {

get:function(name){
    var template = {
        'case':{
            add_initial_position:true,
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
                'name':'people_on_board',
                'title':'People On Board',
                'type':'number',
                'step':1
              }
            ]
        },
        'vehicle':{
            add_initial_position:false,
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
                }
            ]
        }
    }
    return template[name];
}


}