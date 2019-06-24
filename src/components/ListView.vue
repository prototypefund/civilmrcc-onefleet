<template>
   <div id="listview">
      <h2>Items</h2>
      


      <el-collapse v-model="activeCategories">
        <el-collapse-item v-for="category in categories" class="categories" :title="category.plural" :name="category.plural" :key="category.plural">
          <table>
            <thead>
              <th>id</th>
              <th v-for="field in category.fields">{{field.name}}</th>
            </thead>

            <tr v-for="item in category.items.rows">

              <td>{{item.doc._id}}</td>
              <td v-for="field in category.fields">{{item.doc.properties[field.name]}}</td>
              <!--<span>{{vehicle.positions}}</span>-->
            </tr>
          </table>

        </el-collapse-item>
      </el-collapse>

   </div>
</template>

<script>

import templates from './items/templates.js'
import { serverBus } from '../main';
export default {
  name: 'ListView',

  data: function () {
    return {
      vehicles: [],
      shown_items:[],
      categories:[],
      activeCategories: ['Vehicles']
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
    initItem: function(identifier,active){
        this.shown_items[identifier] = active

        serverBus.$emit('shown_items', this.shown_items);

    },
    toggleItem: function(identifier,event){
       

        serverBus.$emit('shown_items', this.shown_items);
    },
    getItemColor: function(itemid){
      var item = this.getItemById(itemid);
      if(item&& typeof item.doc.properties != 'undefined'&& typeof item.doc.properties.color != 'undefined') 
        return item.doc.properties.color;
      else 
        return '#13ce66';
    },
    getItemById:function(itemid){
      for(var i in this.vehicles){
        if(this.vehicles[i].id == itemid)
          return this.vehicles[i];
      }
      return false
    }

  },
  mounted: function() {

    serverBus.$on('shown_items', (shown_items) => {
      this.shown_items = shown_items;
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
                  throw('an error occured reading the template for the leftnav! ');

                console.log('all_templates[template_index]');
                console.log(all_templates[template_index]);

                self.categories.push({
                  title:template_index,
                  plural:all_templates[template_index].plural,
                  items: result,
                  fields:all_templates[template_index].fields
                });

              });
      })(template);


      
    }

    this.$db.getVehicles(function(err,result){
        self.$data.vehicles = result.rows;
        for(var category_index in self.$data.categories){

          //get all items within a category
          for(var item in self.$data.categories[category_index].items.rows){
            
            let is_active = self.$data.categories[category_index].items.rows[item].doc.properties.active

            let identifier = self.$data.categories[category_index].items.rows[item].id

            self.initItem(identifier,is_active);
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
<style>
.el-collapse-item__header {
  font-size:22px;
}
</style>
<style scoped>
table{
  width:100%;
}
tr:nth-child(even) {background-color: #f2f2f2;}
</style>
