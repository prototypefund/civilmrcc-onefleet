<template>
   <nav>
      <ul>
        <li v-for="category in categories">
          <ul>
            <li><h3>{{category.plural}}</h3></li>

            <li v-for="vehicle in category.items.rows">
              <el-switch
                v-model="shown_items[vehicle.id]"
                active-color="#13ce66"
                inactive-color="#ff4949"
                active-value="true"
                inactive-value="false"
                @change="toggleItem(vehicle.id);"
                >
              </el-switch>
              <span>{{vehicle.doc.properties.name}}</span>
              <!--<span>{{vehicle.positions}}</span>-->
            </li>
          </ul>
          <!--<span>{{vehicle.positions}}</span>-->
        </li>
      </ul>
   </nav>
</template>

<script>

import templates from './items/templates.js'
import { serverBus } from '../main';
export default {
  name: 'LeftNavigation',

  data: function () {
    return {
      vehicles: [],
      shown_items:[],
      categories:[]
    }
  },
  computed: {
    searcher() {  

    }
  },
  methods:{
    isShown: function(identifier){
      return this.shown_items[identifier];
    },
    initItem: function(identifier){
        if(!this.shown_items[identifier])
            this.shown_items[identifier] = true

        serverBus.$emit('shown_items', this.shown_items);

    },
    toggleItem: function(identifier,event){
       

        serverBus.$emit('shown_items', this.shown_items);
    }

  },
  mounted: function() {

    serverBus.$on('shown_items', (shown_items) => {

    });

    //load templates to append them as categories to the left navigation
    var self = this;
    var all_templates = templates.get('all');
    for(var template in all_templates){
      var all_templates = all_templates;

      //i actually like js, but sometimes...
      (function(template_index) {
              self.$db.getItemsByTemplate(all_templates[template_index].pouch_identifier,function(error, result){
                if(error)
                  return alert('an error occured reading the template!');

                console.log('templated icons',result);
                self.categories.push({
                  title:template_index,
                  plural:all_templates[template_index].plural,
                  items: result
                });

              });
      })(template);


      
    }

    this.$db.getVehicles(function(err,result){
        self.$data.vehicles = result.rows;
        for(var category_index in self.$data.categories){
          console.log('category');
          console.log(self.$data.categories[category_index]);
          for(var item in self.$data.categories[category_index].items.rows){
            self.initItem(self.$data.categories[category_index].items.rows[item].id);
          }
        }
    });
    this.$db.setOnChange('items',function(){
      console.log('change detected, rerender vehicles!');
        self.$db.getVehicles(function(err,result){

              self.$data.vehicles = result.rows;
        });
    });
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>


nav{
  position:absolute;
  left:0;
  width:15vw;
  top:60px;
  bottom:0;
  padding: 20px;
}
el-switch{
  margin-right:5px;
}
</style>
