<template>
   <div id="mapArea">
      Map
   </div>
</template>

<script>

import { serverBus } from '../main';
export default {
  name: 'MapArea',
  data: function () {
    return {
      map_initialized: false,
    }
  },
  mounted:function(){

    var self = this;

    serverBus.$on('shown_items', (shown_items) => {
      self.shown_items = shown_items;
      self.$db.updateShownItemsOnMap(this.$map,{
        shown_items: shown_items,
        map:self.$map
      });

    serverBus.$on('fly_to_position', (position) => {
      console.log('fylTo receive', self.$map);
      self.$map.flyTo(position);
    })

    });

    this.$map.init('mapArea');
    this.$map.clickItem = function(itemId){
        serverBus.$emit('itemId', itemId);
    }
    this.$db.updateShownItemsOnMap(this.$map,{
        shown_items: self.shown_items,
        map:this.$map
    });
    this.$db.setOnChange('positions','map_area',function(change){
      if(change.direction == 'push'){
        change.change.docs.forEach(function(item) {
              let identifier = 'VEHICLE_'+item.item_identifier;

              if(self.shown_items[identifier] == 'true'){
              
                self.$db.getItem(identifier,function(item){
                  console.log('update Position now!');
                  self.$map.updateItemPosition(self.$map.loadTemplatedItem(item));
                })
              }
        });
      }
    })

  },
  created:function(){
    console.log('created');
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
#mapArea{
    height:calc(100vh - 60px);
}

.vehicle-marker{
  height: 16px!important;
  width: 16px!important;
  margin-left: 0!important;
  margin-top: 0!important;
}
</style>
