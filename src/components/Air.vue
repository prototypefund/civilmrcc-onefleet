<template>
  <div class="air" v-on:click.self="closeModal">
    <ul>
      <div
        v-if="typeof properties.vehicles !== 'undefined' && properties.vehicles"
      >
        <li v-for="vehicle in properties.vehicles">
          <div v-if="vehicle.doc.properties.air == 'true'">
            <h2>
              <i data-v-19f9f8c9 class="fas fa-plane"></i>
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
  </div>
</template>

<script>
import Position from './items/Position';
import LineChart from './lineChart.js';
import { serverBus } from '../main';

export default {
  name: 'Cockpit',
  components: {
    Position,
    LineChart,
  },
  data: function() {
    return {
      properties: {
        vehicles: [],
      },
      username: 'sdf',
      password: '',
      vehiclesArray: [],
      diagramdata: [],
      datacollection: null,
    };
  },
  methods: {
    closeModal: function() {
      // Using the service bus
      serverBus.$emit('modal_modus', '');
    },
  },
  created: function() {
    var self = this;
    this.$db.getItemsByTemplate('VEHICLE', function(err, result) {
      let diagram_points = [];
      let labels = [];
      let datasets = [];
      for (let row in result.rows) {
        if (result.rows[row].doc.properties.air == 'true') {
          for (let pos in result.rows[row].positions) {
            if (result.rows[row].positions[pos].doc) {
              let positionObj = result.rows[row].positions[pos].doc;
              labels.push(
                new Date(positionObj.timestamp).toTimeString().split(' ')[0]
              );
              diagram_points.push({
                x: pos,
                t: new Date(positionObj.timestamp),
                y: parseFloat(positionObj.altitude),
              });
            }
          }
          datasets.push({
            label: result.rows[row].doc.properties.name,
            backgroundColor: '#f87979',
            data: diagram_points,
          });
        }
      }

      self.datacollection = {
        labels: labels,
        datasets: datasets,
      };

      if (err) {
        console.log('err');
        console.log(err);
      }
      console.log('got results');
      console.log(result);

      self.$data.properties.vehicles = result.rows;
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
  top: var(--app-top);
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
  width: 100%;
  padding-bottom: 30px;
  float: left;
}
.air li:empty {
  height: 0;
}

h2 {
  margin: 5px 0;
}

.small {
  max-width: 600px;
  margin: 150px auto;
}
</style>
