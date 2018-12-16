<template>
  <div id="app">

      <CreateItem v-if="modal == 'createItem'"></CreateItem>
      <ShowItem v-show="itemId != false" :itemId="itemId"></ShowItem>
      <Login v-if="modal == 'login'"></Login>
      <TopNavigation></TopNavigation>

      <LeftNavigation></LeftNavigation>
      <div id="mainWindow" >
        <MapArea v-if="modus == 'map'"></MapArea>
        <ListView v-if="modus == 'cases'"></ListView>
      </div>
      <div id="chat">
        chat
      </div>
  </div>

</template>

<script>
import TopNavigation from './components/TopNavigation.vue'
import CreateItem from './components/items/CreateItem.vue'
import ShowItem from './components/items/ShowItem.vue'
import LeftNavigation from './components/LeftNavigation.vue'
import MapArea from './components/MapArea.vue'
import ListView from './components/ListView.vue'
import Login from './components/Login.vue'

import { serverBus } from './main';

export default {
  name: 'app',
  components: {
    TopNavigation,
    LeftNavigation,
    MapArea,
    CreateItem,
    ShowItem,
    ListView,
    Login
  },
  data: function () {
    return {
      modus: 'map',
      modal: '',
      itemId: false
    }
  },
  methods:{
    showItemDetails:function(item_id){
      console.log('show item with item',item_id)
      this.itemid = 3;
    }
  },
  created: function() {
      serverBus.$on('app_modus', (app_modus) => {
        console.log(app_modus);
        this.$data.modus = app_modus;
      });

      serverBus.$on('modal_modus', (modal_modus) => {
        this.$data.modal = modal_modus;
      });
      serverBus.$on('itemId', (itemId) => {
        this.$data.itemId = itemId;
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
  background:#FFF;
}
#chat{
  position:absolute;
  width:20vw;
  right:0;
  top:60px;
  bottom:0;
  z-index:999;
}

ul{
  list-style:none;
  margin:0;
  padding:0;
}
</style>
