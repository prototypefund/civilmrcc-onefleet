<template>
   
   <div class="background" v-on:click.self="closeModal">
    <div class="form-style-6">
            <h1>Settings</h1>
            <form v-on:submit.prevent="save">
              <span>Map</span>
              <select v-model="settings.maptiles">
                <option value="openlayers">OpenLayers (online)</option>
                <option value="onefleet">Onefleet (offline)</option>
              </select>
              <span>Openseamap</span>
              <input type="checkbox" value="true" v-model="settings.openseamap">
              <input type="submit" value="Save" />
            </form>
      </div>
   </div>
</template>

<script>

import { serverBus } from '../main';
export default {
  name: 'Settings',

  data: function () {
    return {
      show:true,
      settings:{
        maptiles:localStorage.settings_map||'openlayers',
        openseamap:localStorage.settings_openseamap||false
      }
    }
  },
  methods:{
    closeModal: function () {
     // Using the service bus
     serverBus.$emit('modal_modus', '');
    },
    save: function(){

      localStorage.settings_maptiles = this.settings.maptiles;
      localStorage.settings_openseamap = this.settings.openseamap;

    }
  },
  mounted: function() {


    var self = this;


    serverBus.$on('modal_modus', (modal_modus) => {
      console.log('modalmodus')
    });

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.background{
  position:fixed;
  top:0;
  right:0;
  bottom:0;
  left:0;
  background:rgba(0,0,0,0.8);
  z-index: 9999;
}
</style>
