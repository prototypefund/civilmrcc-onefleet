<template>
   <nav>

    <ul>
      <el-collapse v-model="activeCategories">
        <el-collapse-item v-for="category in categories" class="categories" :title="category.plural" :name="category.plural" :key="category.plural">
          <ul class="category_list">
            <li v-for="item in category.items.rows">
              <span class="item_name">{{item.doc.properties.name}}</span>


              <span style="float:right;">
                <el-switch
                v-model="shown_items[item.id]"
                active-color="#13ce66"
                inactive-color="#ff4949"
                active-value="true"
                inactive-value="false"
                @change="toggleItem(item.id);"
                >
                </el-switch>
              </span>
              <!--<span>{{vehicle.positions}}</span>-->
            </li>
          </ul>

        </el-collapse-item>
      </el-collapse>
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
                  return alert('an error occured reading the template!');

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

nav .el-collapse-item__header{
  font-size:22px;
  padding:10px;
}
</style>

<style scoped>
nav{
  position:absolute;
  left:0;
  width:20vw;
  top:60px;
  bottom:0;
}


nav .categories .item_name{
    margin-left: 5px;
    font-size: 15px;
}

.category_list li{
  padding:2px 15px;
}

el-switch{
  margin-right:5px;
}
</style>
