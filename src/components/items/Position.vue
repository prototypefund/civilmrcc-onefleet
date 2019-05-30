<template>
  <div class="positionbox">

    <h3>Last Position</h3>
    <label>{{new Date(position.timestamp).toLocaleString()}}</label><br/>
    <label>Lat:</label>
    <span>{{position.lat}}</span>
    <br/>
    <label>Lon:</label>
    <span>{{position.lon}}</span>
    <br/>
    <label>Altitude:</label>
    <span>{{position.altitude}} (ft)</span>

  </div>
</template>
<script>
export default {
  name: 'Position',
  data:function(){
    return {
      vehicles:[]
    }
  },
  props: {
    position: Object
  },
  methods:{
    loadVehicles:function(){
       this.$db.getItemsByTemplate('VEHICLE',function(err,result){
        console.log('got items by template');
        console.log(err,result);
        self.$data.vehicles = result.rows;
      });
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3{
  font-size:18px;
}
.positionbox{
  font-size:12px;
}
</style>
