<template>
  <div class="background" v-on:click.self="closeModal">
    <div class="form-style-6">
      <h1>Settings</h1>
      <form v-on:submit.prevent="save">
        <h3>Map</h3>
        <span>Tileset</span>
        <select v-model="settings.maptiles">
          <option value="openlayers">OpenLayers (online)</option>
          <option value="onefleet">Onefleet (offline)</option>
        </select>

        <span>Max Track Length</span>

        <select v-model="settings.max_track_type">
          <option value="number_of_positions">number of positions</option>
          <option value="number_of_days">number of days</option>
          <option value="date_range">date range</option>
        </select>

        <input
          type="number"
          v-if="settings.max_track_type != 'date_range'"
          v-model="settings.max_track_length"
        />
        <label for="track_startdate">From:</label>
        <input
          type="datetime-local"
          v-if="settings.max_track_type == 'date_range'"
          v-model="settings.track_startdate"
          id="track_startdate"
        /><br />
        <label for="track_enddate">To:</label>
        <input
          type="datetime-local"
          v-if="settings.max_track_type == 'date_range'"
          v-model="settings.track_enddate"
          id="track_enddate"
        />
        <br />
        <span>Show Openseamap</span>
        <input type="checkbox" value="true" v-model="settings.openseamap" />
        <br />
        <span>Always show item captions</span>
        <input type="checkbox" value="true" v-model="settings.showcaptions" />

        <input type="submit" value="Save and reload" />
      </form>
    </div>
  </div>
</template>

<script>
import { serverBus } from '../main';
export default {
  name: 'Settings',
  data: function() {
    return {
      show: true,
      settings: {
        maptiles: localStorage.settings_maptiles || 'openlayers',
        openseamap: localStorage.settings_openseamap == 'true' || false,
        showcaptions: localStorage.settings_showcaptions == 'true' || false,
        max_track_length: localStorage.settings_map_track_length || 100,
        max_track_type:
          localStorage.settings_max_track_type || 'number_of_positions',
        track_startdate: new Date().toLocaleDateString(),
      },
    };
  },

  methods: {
    closeModal: function() {
      // Using the service bus
      serverBus.$emit('modal_modus', '');
    },
    save: function() {
      localStorage.settings_maptiles = this.settings.maptiles;
      localStorage.settings_openseamap = this.settings.openseamap;
      localStorage.settings_showcaptions = this.settings.showcaptions;

      localStorage.settings_max_track_type = this.settings.max_track_type;
      if (this.settings.max_track_type == 'date_range') {
        localStorage.settings_track_startdate = this.settings.track_startdate;
        localStorage.settings_track_enddate = this.settings.track_enddate;
      } else {
        localStorage.settings_map_track_length = this.settings.max_track_length;
      }
      window.location.reload();
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.background {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 9999;
}
</style>
