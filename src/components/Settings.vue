<template>
   
   <div class="background" v-on:click.self="closeModal">
      <div>
        <h2>Settings</h2>
          
        <input type="text" placeholder="username">
        <input type="password" placeholder="password">

      </div>
   </div>
</template>

<script>

import { serverBus } from '../main';
export default {
  name: 'Settings',

  data: function () {
    return {
      vehicles: [],
      shown_items:[]
    }
  },
  methods:{
    closeModal: function () {
     // Using the service bus
     serverBus.$emit('modal_modus', '');
    },
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
