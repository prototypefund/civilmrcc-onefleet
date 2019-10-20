<template>
  <div class="positionbox">

    <h3>Last Position</h3>
    <label>{{new Date(position.timestamp).toLocaleString()}} ({{timeSince(new Date(position.timestamp))}} ago)</label><br/>

    <label>Coodinate Type:</label>
    <span>
      <input type="radio" v-model="type" value="decimal_degrees" id="decimal"> <label for="decimal">Decimal Degrees</label>

      <input type="radio" v-model="type" value="dms" id="dms"> <label for="decimal">DMS</label>
    </span>
    <br>

    <label>Latitude:</label>
    <span>{{showPosition(position.lat,position.lon).lat}}</span>
    <br/>
    <label>Longitude:</label>
    <span>{{showPosition(position.lat,position.lon).lon}}</span>
    <div v-if="position.altitude">
      <label>Altitude:</label>
      <span>{{position.altitude}} (ft)</span>
    </div>
    <div v-if="position.speed">
      <label>Speed:</label>
      <span>{{position.speed}}</span>
    </div>
    <div v-if="position.source">
      <label>Source:</label>
      <span>{{position.source}}</span>
    </div>
    <div v-if="position.heading">
      <label>Heading:</label>
      <span>{{position.heading}}</span>
    </div>
    <el-collapse>
        <el-collapse-item title="Distances">
          <ul class="distancelist">
            <template  v-for="vehicle in vehicles">
              <li v-if="vehicle.positions&&vehicle.positions.length > 1" :key="vehicle">
                <span>{{getDistance(vehicle.positions[vehicle.positions.length-1], position)}} NM</span>
                <span>- {{vehicle.doc.properties.name}}</span>
              </li>
            </template>
          </ul>
        </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script>
export default {
  name: 'Position',
  data:function(){
    return {
      vehicles:[],
      type:'decimal_degrees'
    }
  },
  props: {
    position: Object
  },
  methods:{
    changeType:function(type){
       this.$data.type = type
    },
    showPosition:function(lat,lon){
      switch(this.$data.type){
        default:
          return {lat:lat,lon:lon}
        break;
        case 'dms':
          let val = lat+','+lon;
          var decre = /^\s*([\-+]?\d+(\.\d+)?)\s*,\s*([\-+]?\d+(\.\d+)?)\s*$/;
          var dec = decre.exec(val);
          if (dec == null || dec == '') return null;
          var lat = parseFloat(dec[1]);
          var lon = parseFloat(dec[3]);
          // D = trunc(DD)
          // M = trunc(|DD| * 60) mod 60
          // S = (|DD| * 3600) mod 60
          // where |DD| is absolute value of DD
          var abslat = Math.abs(lat);
          var d1 = Math.floor(abslat);
          var m1 = Math.floor(abslat*60) % 60;
          var s1 = abslat*3600 % 60;
          s1 = Math.round(100 * s1)/100; // 11-meter accuracy
          var nw = (lat < 0 ? 'S' : 'N'); // neg lat is South
          var abslon = Math.abs(lon);
          var d2 = Math.floor(abslon); // trunc
          var m2 = Math.floor(abslon*60) % 60;
          var s2 = abslon*3600 % 60;
          s2 = Math.round(100 * s2)/100;
          var ew = (lon < 0 ? 'W' : 'E'); // neg lon is West
          return {
              lat:d1 + 'd ' + m1 + 'm ' + s1 + 's ' + nw + ', ',
              lon:d2 + 'd ' + m2 + 'm ' + s2 + 's ' + ew
          }
        break;
      }
    },
    timeSince:function(date){
      let seconds = Math.floor((new Date() - date) / 1000);

      let interval = Math.floor(seconds / 31536000);

      if (interval > 1) {
        return interval + " years";
      }
      interval = Math.floor(seconds / 2592000);
      if (interval > 1) {
        return interval + " months";
      }
      interval = Math.floor(seconds / 86400);
      if (interval > 1) {
        return interval + " days";
      }
      interval = Math.floor(seconds / 3600);
      if (interval > 1) {
        return interval + " hours";
      }
      interval = Math.floor(seconds / 60);
      if (interval > 1) {
        return interval + " minutes";
      }
      return Math.floor(seconds) + " seconds";
    },
    getDistance:function(position1,position2){
      if(position1.doc.lat&&position1.doc.lon)
      return Math.round(this.$map.getDistance(position1.doc,position2)*0.00053995680);
    }
  },
  mounted:function(){
    let self = this;
    this.$db.getItemsByTemplate('VEHICLE',function(error, result){
                if(error)
                  throw('an error occured reading the template for the leftnav! ');

                self.vehicles = result.rows;

              });
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3{
    margin-left: 5px;
    font-size: 18px;
    margin-bottom: 5px;
    font-weight: 200;
    margin-top: 5px;
}
.positionbox{
  font-size:12px;
  border-top: 1px solid #ebeef5;
  border-left: 1px solid #ebeef5;
  border-right: 1px solid #ebeef5;
}

.positionbox>label,.positionbox>div>label{
    margin-left: 5px;
    min-width: 100px;
    display: inline-block;
    margin-bottom: 3px;
}

.distancelist{
  padding:5px;
}

.distancelist span{
  min-width:100px;
}
</style>
<style>
.positionbox .el-collapse-item__header{
  font-size: 18px;
  font-weight: 200;
  padding-left:5px;
  background:none;
}
.positionbox .el-collapse-item__wrap{
  background:none;
}
</style>
