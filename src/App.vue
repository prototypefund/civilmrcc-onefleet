<template>
  <div id="app">
      <TopNavigation></TopNavigation>

      <LeftNavigation></LeftNavigation>
      <div id="mainWindow" >
        <MapArea v-if="modus == 'map'"></MapArea>
        <ListView v-else></ListView>
      </div>
      <div id="chat">
        chat
      </div>
  </div>

</template>

<script>
import TopNavigation from './components/TopNavigation.vue'
import LeftNavigation from './components/LeftNavigation.vue'
import MapArea from './components/MapArea.vue'
import ListView from './components/ListView.vue'

import { serverBus } from './main';

export default {
  name: 'app',
  components: {
    TopNavigation,
    LeftNavigation,
    MapArea,
    ListView
  },
  data: function () {
    return {
      modus: 'map'
    }
  }, 
  created: function() {
      // Send all documents to the remote database, and stream changes in real-time
      serverBus.$on('app_modus', (app_modus) => {
        console.log(app_modus);
        this.$data.modus = app_modus;
      });
  }

}
</script>

<style>
#app {
  position:absolute;
  top:0;
  right:0;
  bottom:0;
  left:0;
  padding-top:60px;
}

#mainWindow{
  position:absolute;
  width:60vw;
  right:20vw;
  left:20vw;
  top:60px;
  bottom:0;
  background:red;
}
#chat{
  position:absolute;
  width:20vw;
  right:0;
  top:60px;
  bottom:0;
  background:yellow;
  z-index:999;
}

ul{
  list-style:none;
  margin:0;
  padding:0;
}
</style>
