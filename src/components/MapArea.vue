<template>
  <div id="mapArea"></div>
</template>

<script lang="ts">
// // NOTE: Vue linter incorrectly thinks that "DbItem" is unused
// // eslint-disable-next-line
// import { DbItem } from '@/types/db-item';
// // NOTE: Vue linter incorrectly thinks that "DbPosition" is unused
// // eslint-disable-next-line
// import { DbPosition } from '@/types/db-position';
// // NOTE: Vue linter incorrectly thinks that "MapItem" is unused
// // eslint-disable-next-line
// import { MapItem } from '@/types/map-item';

import { serverBus } from '../main';

export default {
  name: 'MapArea',
  props: {},

  data() {
    return {
      map_initialized: false,
    };
  },

  watch: {},

  methods: {},

  mounted: function() {
    var self = this;

    this.$map.init('mapArea');

    serverBus.$on(
      'update_item_on_map',
      (base_item, item_positions, show_item) => {
        this.$map.updateItemOnMap(base_item, item_positions, show_item);
      }
    );

    serverBus.$on('fly_to_position', position => {
      this.$map.flyTo(position);
    });

    serverBus.$on('start_replay', replayData => {
      console.log(replayData);
      replayData.map = self.$map;
      replayData.shown_items = self.shown_items;
      serverBus.$emit('replay_started', 1);
      self.$db.startReplay(replayData, function() {
        serverBus.$emit('replay_finished', 1);
      });
    });

    this.$map.clickItem = function(itemId) {
      serverBus.$emit('itemId', itemId);
    };
  },
  created: function() {},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
#mapArea {
  height: calc(100vh - var(--app-top));
  background: var(--white);
}

.landmark-marker,
.case-marker,
.vehicle-marker {
  height: 16px !important;
  width: 16px !important;
  margin-left: 0 !important;
  margin-top: 0 !important;
}

.itemCaption,
.lineCaption {
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 3px;
  width: 80px;
  display: block;
  margin-left: -43px;
  text-align: center;
  font-size: 10px;
}
.lineCaption {
  width: 70px !important;
  font-size: 7px;
}
</style>
