<template>
   <nav>
      <ul>
        <li><h3>Vehicles</h3></li>
        <li v-for="vehicle in vehicles">{{vehicle.doc.properties.name}}</li>
      </ul>
   </nav>
</template>

<script>
export default {
  name: 'LeftNavigation',

  data: function () {
    return {
      vehicles: []
    }
  },
  mounted: function() {
    var self = this;
    this.$db.getVehicles(function(result){
        self.$data.vehicles = result.rows;
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
  background:yellow;
}
</style>
