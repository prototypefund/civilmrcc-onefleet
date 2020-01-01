<template>
  <div class="air" v-on:click.self="closeModal">
    <ul>
      <li v-for="vehicle in vehicles">
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
    </ul>
    <div
      id="chartContainer"
      style="clear:both; height: 200px; width: 100%;"
    ></div>
  </div>
</template>

<script>
import * as CanvasJS from 'canvasjs';
import Position from './items/Position';
import { serverBus } from '../main';

export default {
  name: 'Cockpit',
  components: {
    Position,
  },
  data: function() {
    return {
      username: '',
      password: '',
      vehicles: [],
      diagramdata: [],
    };
  },
  methods: {
    closeModal: function() {
      // Using the service bus
      serverBus.$emit('modal_modus', '');
    },
    login: function() {
      localStorage.username = this.username;
      localStorage.password = this.password;
      window.location.reload();
    },
    renderChart: function(data) {
      var chart = new CanvasJS.Chart(
        'chartContainer',

        {
          axisX: {
            title: 'timeline',
            gridThickness: 1,
          },
          axisY: {
            title: 'Altitude',
          },
          backgroundColor: 'rgb(55,60,68)',
          theme: 'dark1',
          data: data,
        }
      );

      chart.render();
    },
  },
  mounted: function() {
    var self = this;
    this.$db.getItemsByTemplate('VEHICLE', function(err, result) {
      let airrows = [];
      let diagram_points = [];
      for (let row in result.rows) {
        if (result.rows[row].doc.properties.air == 'true') {
          for (let pos in result.rows[row].positions) {
            if (result.rows[row].positions[pos].doc) {
              let positionObj = result.rows[row].positions[pos].doc;
              diagram_points.push({
                x: new Date(positionObj.timestamp),
                y: parseFloat(positionObj.altitude),
              });
            }
          }
          airrows.push(result.rows[row]);
          self.$data.diagramdata.push({
            type: 'line',
            dataPoints: diagram_points,
          });
        }
      }

      self.renderChart(self.$data.diagramdata);

      self.$data.vehicles = airrows;
    });
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.air {
  opacity: 0.7;
  position: fixed;
  top: 60px;
  right: 0;
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
</style>
