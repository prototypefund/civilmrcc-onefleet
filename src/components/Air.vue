<template>
  <div class="air" v-on:click.self="closeModal">
    <ul>
      <div v-if="typeof properties.vehicles !== 'undefined' && properties.vehicles">
        <li v-for="vehicle in properties.vehicles">
          <div v-if="vehicle.doc.properties.air == 'true'">
            <h2>
              <i data-v-19f9f8c9="" class="fas fa-plane"></i>
              {{ vehicle.doc.properties.name }}
            </h2>
            <Position
              v-bind:position="
                vehicle.positions[vehicle.positions.length - 1].doc
              "
            ></Position>
          </div>
        </li>
      </div>
    </ul>
  <div class="small">
    <line-chart :chart-data="datacollection"></line-chart>
  </div>
    <div
      id="chartContainer"
      style="clear:both; height: 200px; width: 100%; min-width:100px"
    ></div>
  </div>
</template>

<script>
import * as CanvasJS from 'canvasjs';
import Position from './items/Position';
  import LineChart from './lineChart.js'
import { serverBus } from '../main';

export default {
  name: 'Cockpit',
  components: {
    Position,
    LineChart
  },
  data: function() {
    return {
      properties:{
        vehicles:[]
      },
      username: 'sdf',
      password: '',
      vehiclesArray: [],
      diagramdata: [],
      datacollection: null
    };
  },
  methods: {
    closeModal: function() {
      // Using the service bus
      serverBus.$emit('modal_modus', '');
    }
  },
  mounted:function(){
    this.fillData()
  },
  created: function() {
    var self = this;
    this.$db.getItemsByTemplate('VEHICLE', function(err, result) {


      let airrows = [];
      let diagram_points = [];
      let labels = [];
      for (let row in result.rows) {
        if (result.rows[row].doc.properties.air == 'true') {
          for (let pos in result.rows[row].positions) {
            if (result.rows[row].positions[pos].doc) {
              let positionObj = result.rows[row].positions[pos].doc;
              labels.push(new Date(positionObj.timestamp).toTimeString().split(' ')[0]);
              diagram_points.push({
                x: pos,
                t: new Date(positionObj.timestamp),
                y: parseFloat(positionObj.altitude),
              });
            }
          }
          airrows.push(result.rows[row]);
        }
      }

      self.datacollection = {
        labels: labels,
        datasets: [
          {
            label: 'Data One',
            backgroundColor: '#f87979',
            data: diagram_points.reverse()
          }
        ]
      }

      self.$data.diagramdata.push({
        type: 'line',
        dataPoints: diagram_points,
      });

      if(err){
        console.log('err');
        console.log(err);
      }
      console.log('got results');
      console.log(result);

      self.$data.properties.vehicles = result.rows;

      self.renderChart(self.$data.diagramdata);
    });
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.air {
  opacity: 0.7;
  overflow: auto;
  position: fixed;
  top: 60px;
  right: 0;
  bottom: 0;
  background: rgb(55, 60, 68);
  color: #fff;
  padding: 15px;
  width: 30vw;
  z-index: 9999;
}

.air:hover {
  opacity: 1;
}
.air li {
  float: left;
  width: 14vw;
  padding: 10px 15px;
  float: left;
}

  .small {
    max-width: 600px;
    margin:  150px auto;
  }
</style>
