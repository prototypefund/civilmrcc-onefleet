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
            inactive-value="false">
          </el-switch>
          <span>{{vehicle.doc.properties.name}}</span>
          <span>{{vehicle.visibility}}</span>
          <!--<span>{{vehicle.positions}}</span>-->
        </li>
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
  background:yellow;
}
</style>
