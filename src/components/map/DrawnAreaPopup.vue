<template>
  <div>
    <a href="#">Get historic ais data for this area</a><br />
    <a href="#">add sighting at time: </a>
    <el-date-picker
      v-model="sighting_datetime"
      type="datetime"
      placeholder="Enter time of sighting"
    >
    </el-date-picker>
    <br />

    Area: {{ popup_data.area_readable }} <br />
    ({{ popup_data.positions.length }} corners)
  </div>
</template>

<script lang="ts">
// import { serverBus } from '../../main';

export default {
  name: 'DrawnAreaPopup',
  props: {
    popup_data: {
      type: Object,
      default: () => ({
        area_readable: 'Unknown Area',
        positions: [],
      }),
    },
  },

  data() {
    return {
      sighting_datetime: null,
    };
  },
  computed: {},

  watch: {},

  methods: {},

  mounted: function() {},

  created: function() {},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
