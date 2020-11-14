<template>
  <div>
    <span class="latlng"> {{ popup_data.item_title }} </span> <br />
    Last known position: <br />
    {{ latestDMS }} <br />
    at {{ latestTimestamp }} <br />
    <a href="#" @click="showItem()">Show Details...</a><br />
    <br />
    "{{ popup_data.item_title }} was here at time xxxz."
  </div>
</template>

<script lang="ts">
import { serverBus } from '../../main';

export default {
  name: 'ItemTrackPopup',
  props: {
    popup_data: {
      type: Object,
      default: () => ({
        distance_readable: '',
        distance_in_meters: -1,
        item_id: '',
        item_title: 'Unknown Item',
        latest_position: null,
      }),
    },
  },

  data() {
    return {};
  },
  computed: {
    latestDMS() {
      return this.$map.asDMS(this.popup_data.latest_position);
    },
    latestTimestamp() {
      return this.$map.formatTimestamp(
        this.popup_data.latest_position.timestamp
      );
    },
  },

  watch: {},

  methods: {
    showItem: function() {
      serverBus.$emit('show_item', this.popup_data.item_id);
    },
  },

  mounted: function() {},

  created: function() {},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.latlng {
  font-weight: bold;
  white-space: nowrap;
}
</style>
