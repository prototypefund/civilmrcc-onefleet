<template>
  <div>
    <span class="latlng">
      Track ({{ popup_data.positions.length }} positions)
    </span>
    <br />

    <span class="latlng">
      Distance:
      {{ distanceInNauticalMiles }} nm ({{ distanceInKilometers }} km)
    </span>
    <br />
    <a href="#"> Add this track to .. </a>
  </div>
</template>

<script lang="ts">
// import { serverBus } from '../../main';

export default {
  name: 'DrawnTrackPopup',
  props: {
    popup_data: {
      type: Object,
      default: () => ({
        distance_in_meters: -1,
        positions: [],
      }),
    },
  },

  data() {
    return {};
  },
  computed: {
    distanceInKilometers() {
      return Math.round(this.popup_data.distance_in_meters / 1000);
    },
    distanceInNauticalMiles() {
      return Math.round(this.popup_data.distance_in_meters / 1.852 / 1000);
    },
  },

  watch: {},

  methods: {},

  mounted: function() {},

  created: function() {},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
