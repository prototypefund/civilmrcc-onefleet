<template>
  <div>
    <span class="latlng"> {{ popup_data.item_title }} </span> <br />
    Last known position: <br />
    {{ latestDMS }} <br />
    <!-- <div v-if="this.popup_data.latest_position.heading > 0">
      (heading:
      <div :style="'rotation: ' + this.popup_data.latest_position.heading">
        arrow
      </div>
      )<br />
    </div> -->
    <a href="#" @click="showItem()">Show Details...</a>
  </div>
</template>

<script lang="ts">
import { serverBus } from '../../main';

export default {
  name: 'ItemMarkerPopup',
  props: {
    popup_data: {
      type: Object,
      default: () => ({
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

.el-dropdown {
  /* margin-right: 8px; */
  font: 12px/1.5 'Helvetica Neue', Arial, Helvetica, sans-serif;
}
.el-dropdown-link {
  cursor: pointer;
  color: #0078a8;
  text-decoration: underline dashed;
}

.el-cascader {
  width: 110px;
  margin-right: 10px;
}
</style>
