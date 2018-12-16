<template>
   <div id="mapArea">
      Map
   </div>
</template>

<script>

import { serverBus } from '../main';
export default {
  name: 'MapArea',
  props: {
  },
  mounted:function(){

    var self = this;
    this.$map.init('mapArea');
    console.log('serverbus.shown_items');
    console.log(serverBus.shown_items);
    this.$db.appendItemsToMap(this.$map,{
      onClick:function(itemId){
        console.log(itemId);
        serverBus.$emit('itemId', itemId);
      }
    });

    serverBus.$on('shown_items', (shown_items) => {
      self.$db.updateShownItemsOnMap(this.$map,{
        shown_items: shown_items
      });
    });
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#mapArea{
    width: 70vw;
    height:calc(100vh - 60px);
}
</style>
