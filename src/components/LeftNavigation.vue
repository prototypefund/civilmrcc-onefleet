<template>
   <nav>
      <ul>
        <li><h3>Vehicles</h3></li>
        <li v-for="vehicle in vehicles">
          <el-switch
            v-model="vehicle.visibility"
            active-color="#13ce66"
            inactive-color="#ff4949"
            active-value="true"
            inactive-value="false"
            @change="toggleItem(vehicle.id)">
          </el-switch>
          <span>{{vehicle.doc.properties.name}}</span>
          <!--<span>{{vehicle.positions}}</span>-->
        </li>
        <li v-for="category in categories">
          <span>{{category.title}}</span>
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
  methods:{
    toggleItem: function(identifier){
        if(this.shown_items.indexOf(identifier) == -1)
          this.shown_items.push(identifier)
        else
          this.shown_items.filter(e => e !== identifier) //remove item from array


        serverBus.$emit('shown_items', this.shown_items);
    }

  },
  mounted: function() {
    var self = this;
    console.log('templates.get(');
    console.log(templates.get('all'));
    var all_templates = templates.get('all');
    for(var template in all_templates){
      console.log('get items for template: '+template);
      this.$db.getItemsByTemplate(all_templates[template].pouch_identifier,function(error, result){
        if(error)
          return alert('an error occured!');

        self.categories.push({
          title:template,
          plural:all_templates[template].plural,
          items: result
        });

      });
    }

    this.$db.getVehicles(function(err,result){
        self.$data.vehicles = result.rows;
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
  width:20vw;
  top:60px;
  bottom:0;
  padding: 20px;
}
</style>
