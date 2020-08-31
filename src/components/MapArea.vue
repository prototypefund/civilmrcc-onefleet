<template>
  <div>
    <div id="mapArea"></div>

    <div ref="drawn_area_popup" class="drawn_area_style">
      <DrawnAreaPopup
        v-if="showingPopup('drawn_area_popup')"
        :popup_data="popup_data"
      ></DrawnAreaPopup>
    </div>
    <div ref="drawn_marker_popup" class="drawn_marker_style">
      <DrawnMarkerPopup
        v-if="showingPopup('drawn_marker_popup')"
        :popup_data="popup_data"
      ></DrawnMarkerPopup>
    </div>
    <div ref="drawn_track_popup" class="drawn_track_style">
      <DrawnTrackPopup
        v-if="showingPopup('drawn_track_popup')"
        :popup_data="popup_data"
      ></DrawnTrackPopup>
    </div>

    <div ref="item_marker_popup" class="item_marker_style">
      <ItemMarkerPopup
        v-if="showingPopup('item_marker_popup')"
        :popup_data="popup_data"
      ></ItemMarkerPopup>
    </div>
    <div ref="item_track_popup" class="item_track_style">
      <ItemTrackPopup
        v-if="showingPopup('item_track_popup')"
        :popup_data="popup_data"
      ></ItemTrackPopup>
    </div>
  </div>
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

import DrawnAreaPopup from './map/DrawnAreaPopup.vue';
import DrawnMarkerPopup from './map/DrawnMarkerPopup.vue';
import DrawnTrackPopup from './map/DrawnTrackPopup.vue';
import ItemMarkerPopup from './map/ItemMarkerPopup.vue';
import ItemTrackPopup from './map/ItemTrackPopup.vue';

import { serverBus } from '../main';

export default {
  name: 'MapArea',
  components: {
    DrawnAreaPopup,
    DrawnMarkerPopup,
    DrawnTrackPopup,
    ItemMarkerPopup,
    ItemTrackPopup,
  },
  props: {},

  data() {
    return {
      map_initialized: false,
      popup_modal: '',
      popup_data: {},
    };
  },
  computed: {},

  watch: {},

  methods: {
    showingPopup(ref: String): boolean {
      return this.popup_modal == ref;
    },
  },

  mounted: function() {
    var self = this;

    this.$map.init('mapArea', (popup_ref, popup_data) => {
      this.popup_data = popup_data;
      this.popup_modal = popup_ref;
      return this.$refs[popup_ref];
    });

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

.latlng {
  font-weight: bold;
  white-space: nowrap;
}

.el-cascader {
  width: 110px;
  margin-right: 10px;
}

.drawn_area_style {
  width: 230px;
}

.drawn_marker_style {
  width: 211px;
}

.drawn_track_style {
  width: 180px;
}

.item_marker_style {
  width: 200px;
}

.item_track_style {
  width: 200px;
}
</style>
