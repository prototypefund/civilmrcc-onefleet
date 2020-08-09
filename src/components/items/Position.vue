<template>
  <div class="positionbox">
    <div v-if="edit">
      <label>Coodinate Type:</label>
      <span>
        <input
          type="radio"
          v-model="type"
          value="decimal_degrees"
          id="decimal"
        />
        <label for="decimal">Decimal Degrees</label>

        <input type="radio" v-model="type" value="dms" id="dms" />
        <label for="decimal">DMS</label>
      </span>
      <div v-if="type == 'decimal_degrees'">
        <span>Latitude</span>
        <input
          type="number"
          step="any"
          name="lat"
          placeholder="Latitude"
          v-model="position.lat"
          @change="updatePosition()"
        />

        <span>Longitude</span>
        <input
          type="number"
          step="any"
          name="lon"
          placeholder="Longitude"
          v-model="position.lon"
          @change="updatePosition()"
        />
      </div>

      <div v-if="type == 'dms'" class="dms">
        <span>Latitude</span>
        <input
          type="number"
          step="any"
          name="lat"
          placeholder="Latitude"
          v-model="dms_position.lat.d"
          @change="updatePosition()"
        />
        <input
          type="number"
          step="any"
          name="lat"
          placeholder="Latitude"
          v-model="dms_position.lat.m"
          @change="updatePosition()"
        />
        <input
          type="number"
          step="any"
          name="lat"
          placeholder="Latitude"
          v-model="dms_position.lat.s"
          @change="updatePosition()"
        />
        <select v-model="dms_position.lat.direction" @change="updatePosition()">
          <option>N</option>
          <option>S</option>
        </select>
        <br />

        <span>Longitude</span>
        <input
          type="number"
          step="any"
          name="lon"
          placeholder="Longitude"
          v-model="dms_position.lon.d"
          @change="updatePosition()"
        />
        <input
          type="number"
          step="any"
          name="lat"
          placeholder="Latitude"
          v-model="dms_position.lon.m"
          @change="updatePosition()"
        />
        <input
          type="number"
          step="any"
          name="lat"
          placeholder="Latitude"
          v-model="dms_position.lon.s"
          @change="updatePosition()"
        />
        <select v-model="dms_position.lon.direction" @change="updatePosition()">
          <option>W</option>
          <option>E</option>
        </select>
      </div>
    </div>
    <div v-else>
      <h3>Last Position</h3>
      <label>
        {{ new Date(position.timestamp).toLocaleString() }} ({{
          timeSince(new Date(position.timestamp))
        }}
        ago)
      </label>
      <br />

      <label>Coodinate Type: {{ type }}</label>
      <span>
        <input
          type="radio"
          v-model="type"
          value="decimal_degrees"
          id="decimal"
        />
        <label for="decimal">Decimal Degrees</label>

        <input type="radio" v-model="type" value="dms" id="dms" />
        <label for="decimal">DMS</label>
      </span>

      <br />

      <div v-if="type == 'decimal_degrees'">
        <label>Latitude:</label>
        <span>{{ showPosition(position.lat, position.lon).lat }}</span>
        <br />
        <label>Longitude:</label>
        <span>{{ showPosition(position.lat, position.lon).lon }}</span>
      </div>
      <div v-if="type == 'dms'">
        <label>Latitude:</label>
        <span
          >{{ showPosition(position.lat, position.lon).lat.d }}°
          {{ showPosition(position.lat, position.lon).lat.m }}'
          {{ showPosition(position.lat, position.lon).lat.s }}"
          {{ showPosition(position.lat, position.lon).lat.direction }}</span
        >
        <br />
        <label>Longitude:</label>
        <span
          >{{ showPosition(position.lat, position.lon).lon.d }}°
          {{ showPosition(position.lat, position.lon).lon.m }}'
          {{ showPosition(position.lat, position.lon).lon.s }}"
          {{ showPosition(position.lat, position.lon).lon.direction }}</span
        >
      </div>

      <div v-if="position.altitude">
        <label>Altitude:</label>
        <span>{{ position.altitude }} (ft)</span>
      </div>
      <div v-if="position.speed">
        <label>Speed:</label>
        <span>{{ position.speed }}</span>
      </div>
      <div v-if="position.source">
        <label>Source:</label>
        <span>{{ position.source }}</span>
      </div>
      <div v-if="position.heading">
        <label>Heading:</label>
        <span>{{ position.heading }}</span>
      </div>
      <el-collapse>
        <el-collapse-item title="Distances">
          <ul class="distancelist">
            <li v-for="vehicle in vehicles">
              <div v-if="vehicle.positions && vehicle.positions.length > 1">
                <span>
                  {{
                    getDistance(
                      vehicle.positions[vehicle.positions.length - 1],
                      position
                    )
                  }}
                  NM
                </span>
                - {{ vehicle.doc.properties.name }}
              </div>
            </li>
          </ul>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>
<script>
export default {
  name: 'Position',
  data: function() {
    return {
      vehicles: [],
      type: 'decimal_degrees',
      dms_position: {
        lat: {
          d: 0,
          m: 0,
          s: 0,
          direction: 'N',
        },
        lon: {
          d: 0,
          m: 0,
          s: 0,
          direction: 'E',
        },
      },
    };
  },
  props: {
    position: Object,
    edit: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    updatePosition: function() {
      console.log('update position');
      console.log(this.dms_position);

      if (this.type == 'dms') {
        this.position.lat = this.ConvertDMSToDD(
          parseInt(this.dms_position.lat.d),
          parseInt(this.dms_position.lat.m),
          parseInt(this.dms_position.lat.s),
          this.dms_position.lat.direction
        );
        this.position.lon = this.ConvertDMSToDD(
          parseInt(this.dms_position.lon.d),
          parseInt(this.dms_position.lon.m),
          parseInt(this.dms_position.lon.s),
          this.dms_position.lon.direction
        );
      } else {
        this.dms_position = {
          lat: {
            d: this.showPosition(this.position.lat, this.position.lon, 'dms')
              .lat.d,
            m: this.showPosition(this.position.lat, this.position.lon, 'dms')
              .lat.m,
            s: this.showPosition(this.position.lat, this.position.lon, 'dms')
              .lat.s,
            direction: this.showPosition(
              this.position.lat,
              this.position.lon,
              'dms'
            ).lat.direction,
          },
          lon: {
            d: this.showPosition(this.position.lat, this.position.lon, 'dms')
              .lon.d,
            m: this.showPosition(this.position.lat, this.position.lon, 'dms')
              .lon.m,
            s: this.showPosition(this.position.lat, this.position.lon, 'dms')
              .lon.s,
            direction: this.showPosition(
              this.position.lat,
              this.position.lon,
              'dms'
            ).lon.direction,
          },
        };
      }
    },
    changeType: function(type) {
      this.$data.type = type;
    },
    ConvertDMSToDD: function(degrees, minutes, seconds, direction) {
      var dd = degrees + minutes / 60 + seconds / (60 * 60);

      if (direction == 'S' || direction == 'W') {
        dd = dd * -1;
      } // Don't do anything for N or E
      return dd;
    },
    showPosition: function(lat, lon, type) {
      let val = lat + ',' + lon;

      if (!type) {
        type = this.$data.type;
      }
      switch (type) {
        default:
          return { lat: lat, lon: lon };
        case 'dms':
          var decre = /^\s*([-+]?\d+(\.\d+)?)\s*,\s*([-+]?\d+(\.\d+)?)\s*$/;
          var dec = decre.exec(val);
          if (dec == null || dec == '') return null;
          lat = parseFloat(dec[1]);
          lon = parseFloat(dec[3]);
          // D = trunc(DD)
          // M = trunc(|DD| * 60) mod 60
          // S = (|DD| * 3600) mod 60
          // where |DD| is absolute value of DD
          var abslat = Math.abs(lat);
          var d1 = Math.floor(abslat);
          var m1 = Math.floor(abslat * 60) % 60;
          var s1 = (abslat * 3600) % 60;
          s1 = Math.round(100 * s1) / 100; // 11-meter accuracy
          var nw = lat < 0 ? 'S' : 'N'; // neg lat is South
          var abslon = Math.abs(lon);
          var d2 = Math.floor(abslon); // trunc
          var m2 = Math.floor(abslon * 60) % 60;
          var s2 = (abslon * 3600) % 60;
          s2 = Math.round(100 * s2) / 100;
          var ew = lon < 0 ? 'W' : 'E'; // neg lon is West
          return {
            lat: {
              d: d1,
              m: m1,
              s: s1,
              direction: nw,
            },
            lon: {
              d: d2,
              m: m2,
              s: s2,
              direction: ew,
            },
          };
      }
    },
    timeSince: function(date) {
      let seconds = Math.floor((new Date() - date) / 1000);

      let interval = Math.floor(seconds / 31536000);

      if (interval > 1) {
        return interval + ' years';
      }
      interval = Math.floor(seconds / 2592000);
      if (interval > 1) {
        return interval + ' months';
      }
      interval = Math.floor(seconds / 86400);
      if (interval > 1) {
        return interval + ' days';
      }
      interval = Math.floor(seconds / 3600);
      if (interval > 1) {
        return interval + ' hours';
      }
      interval = Math.floor(seconds / 60);
      if (interval > 1) {
        return interval + ' minutes';
      }
      return Math.floor(seconds) + ' seconds';
    },
    getDistance: function(position1, position2) {
      if (position1.doc.lat && position1.doc.lon)
        return Math.round(
          this.$map.getDistance(position1.doc, position2) * 0.0005399568
        );
    },
  },
  watch: {
    dms_position: function() {
      console.log('looooool');
      this.position.lat = this.ConvertDMSToDD(
        this.dms_position.lat.d,
        this.dms_position.lat.m,
        this.dms_position.lat.s,
        this.dms_position.lat.direction
      );
      this.position.lon = this.ConvertDMSToDD(
        this.dms_position.lon.d,
        this.dms_position.lon.m,
        this.dms_position.lon.s,
        this.dms_position.lon.direction
      );
    },
  },
  mounted: function() {
    if (!this.position)
      this.position = {
        timestamp: new Date().toISOString(),
        lat: 0,
        lng: 0,
      };

    if (!this.position.timestamp)
      this.position.timestamp = new Date().toISOString();

    let self = this;
    this.$db.getItemsByTemplate('VEHICLE', function(error, result) {
      if (error)
        throw 'an error occured reading the template for the leftnav! ';

      self.vehicles = result.rows;
    });
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin-left: 5px;
  font-size: 18px;
  margin-bottom: 5px;
  font-weight: 200;
  margin-top: 5px;
}
.positionbox {
  font-size: 12px;
  border-top: 1px solid #ebeef5;
  border-left: 1px solid #ebeef5;
  border-right: 1px solid #ebeef5;
}

.positionbox > label,
.positionbox > div > label {
  margin-left: 5px;
  min-width: 100px;
  display: inline-block;
  margin-bottom: 3px;
}

.dms input {
  width: 55px !important;
}

.distancelist {
  padding: 5px;
}

.distancelist span {
  min-width: 100px;
}
</style>
<style>
.positionbox .el-collapse-item__header {
  font-size: 18px;
  font-weight: 200;
  padding-left: 5px;
  background: none;
}
.positionbox .el-collapse-item__wrap {
  background: none;
}
</style>
