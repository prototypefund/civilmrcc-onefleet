<template>
  <li :class="itemLoadingClass" @click.self="flyToItem()">
    <span>
      <div class="item_name" @click="flyToItem()">
        {{ itemName }}
      </div>
      <el-switch v-model="itemShowing" :active-color="itemColor" />
      <el-tag size="small" :type="positionAgeType" @click="flyToItem()">
        {{ positionAgeText }}
      </el-tag>
    </span>
    <el-button
      @click="clickItem()"
      style="float: right;"
      icon="el-icon-edit"
      circle
    />
    <!-- <span> -->
    <!-- <div>
      <div v-if="itemTemplate=='case'">
        <span>status {{ (((item || {}).doc || {}).properties || {} ).status || '' }}</span>
      </div>
      <div v-else-if="itemTemplate=='vehicle'">vehicle</div>
      <div v-else-if="itemTemplate=='landmark'">landmark</div>
    </div>-->
    <!-- </span> -->
  </li>
</template>

<script lang="ts">
// NOTE: Vue linter incorrectly thinks that "DbItem" is unused
// eslint-disable-next-line
import { DbItem } from '@/types/db-item';
// NOTE: Vue linter incorrectly thinks that "DbPosition" is unused
// eslint-disable-next-line
import { DbPosition } from '@/types/db-position';

import { serverBus } from '../../main';

export default {
  name: 'NavbarItem',

  props: {
    base_item: {
      type: Object, // DbItem
      required: true,
    },
    positions: {
      type: Array, // DbPosition[]
      required: false,
    },
    time_now: {
      required: false,
    },
  },

  data: function() {
    return {
      itemShowing: false,
      showByUserPreference: false,
    };
  },

  watch: {
    itemShowing: function() {
      if (this.itemShowing != this.itemActive && !this.showByUserPreference)
        this.showByUserPreference = true;
      this.sendItemUpdateToMap();
    },
    base_item: function() {
      if (!this.showByUserPreference) this.itemShowing = this.itemActive;
    },
    positions: function() {
      if (!this.showByUserPreference) this.itemShowing = this.itemActive;
      // temporary solution until the MapArea directly uses filtered_base_items and positions_per_item itself:
      this.sendItemUpdateToMap(); // TODO remove as soon as MapArea+mapWrapper can handle this themselves
    },
  },

  computed: {
    itemId() {
      return this.base_item._id;
    },
    itemName() {
      if (this.base_item) {
        if (this.base_item.properties.name)
          return this.base_item.properties.name;
        else return this.base_item.template + ' ' + this.base_item.identifier;
      } else {
        return this.base_item.identifier + ' (loading...)';
      }
    },
    itemLoadingClass() {
      if (this.base_item) {
        return 'NavbarItem';
      } else {
        return 'NavbarItem item_loading';
      }
    },
    itemColor() {
      if (((this.base_item || {}).properties || {}).color)
        return this.base_item.properties.color;
      else if (((this.base_item || {}).properties || {}).boat_color)
        return this.base_item.properties.boat_color;
      else return '#13ce66';
    },
    itemTemplate() {
      if ((this.base_item || {}).template) return this.base_item.template;
      else return '';
    },
    itemActive() {
      if ((this.base_item || {}).properties) {
        if (this.base_item.template == 'case')
          return this.base_item.properties.status != 'closed';
        else return this.base_item.properties.active == 'true';
      }
      return false;
    },
    latestPosition() {
      // We assume that positions are already sorted by timestamp during the DB-fetch,
      //  and that position zero is the newest position:
      if ((this.positions || []).length > 0) return this.positions[0];
      else return null;
    },
    positionAgeText() {
      if (!this.positions) return 'loading positions...';
      else if (this.latestPosition)
        return (
          this.$map.timeSince(this.latestPosition.timestamp, this.time_now) +
          ' ago'
        );
      else return 'no positions';
    },
    positionAgeType() {
      let color = this.$map.colorSince(
        (this.latestPosition || {}).timestamp,
        this.time_now
      );
      return {
        green: 'success',
        yellow: 'warning',
        red: 'danger',
        blue: 'default',
        grey: 'info',
      }[color];
    },
  },

  methods: {
    clickItem: function() {
      serverBus.$emit('show_item', this.base_item._id);
    },
    flyToItem: function() {
      if (this.latestPosition) {
        serverBus.$emit('fly_to_position', this.latestPosition);
      }
    },
    sendItemUpdateToMap() {
      serverBus.$emit(
        'update_item_on_map',
        this.base_item,
        this.positions,
        this.itemShowing
      );
    },
  },

  mounted: function() {},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/* li {
  opacity: 0.99;
} */
.item_loading {
  opacity: 0.2;
}
</style>
