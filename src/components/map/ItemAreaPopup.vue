<template>
  <div>
    {{ popup_data.item_title }}
  </div>
</template>

<script lang="ts">
// import { serverBus } from '../../main';

export default {
  name: 'ItemAreaPopup',
  props: {
    popup_data: {
      type: Object,
      default: () => ({
        item_id: '',
        item_title: 'Unknown Item',
        area_readable: 'Unknown Area',
        area_positions: [],
      }),
    },
  },

  data() {
    return {};
  },
  computed: {},

  watch: {},

  methods: {},

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
