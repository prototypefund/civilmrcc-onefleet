<template>
  <li :class="itemLoadingClass" @click="flyToItem()">
    <span>
      <div class="item_name">{{ itemName }}</div>
      <el-switch v-model="itemShowing" :active-color="itemColor" />
      <el-tag size="small" :type="positionAgeType">
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
import { serverBus } from '../../main';
export default {
  name: 'NavbarItem',

  props: {
    base_item: {
      type: Object,
      required: true,
    },
    positions: {
      type: Array,
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
      this.updateItemOnMap();
    },
    base_item: function() {
      if (!this.showByUserPreference) this.itemShowing = this.itemActive;
    },
    positions: function() {
      if (!this.showByUserPreference) this.itemShowing = this.itemActive;
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
      // we assume that positions are already sorted by timestamp during the DB-fetch
      if ((this.positions || []).length > 0)
        return this.positions[this.positions.length - 1];
      else return null;
    },
    positionAgeText() {
      if (!this.positions) return 'loading positions...';
      else if (this.latestPosition)
        return this.timeSince(this.latestPosition.timestamp) + ' ago';
      else return 'no positions';
    },
    positionAgeType() {
      if (this.latestPosition) {
        let lastDate = new Date(this.latestPosition.timestamp);
        let now = new Date();
        let seconds = Math.floor((now.getTime() - lastDate.getTime()) / 1000);
        if (seconds > 0 && seconds <= 1800) return 'success';
        else if (seconds > 1800 && seconds <= 86400) return 'warning';
        else return 'danger';
      } else {
        return 'info';
      }
    },
  },

  methods: {
    clickItem: function() {
      serverBus.$emit('itemId', this.base_item._id);
    },
    flyToItem: function() {
      if (this.latestPosition) {
        serverBus.$emit('fly_to_position', this.latestPosition);
      }
    },
    updateItemOnMap() {
      serverBus.$emit(
        'update_item_on_map',
        this.base_item,
        this.positions,
        this.itemShowing
      );
    },
    timeSince: function(date) {
      //   date = new Date(date);
      let lastDate = new Date(date);
      let now = new Date();
      let seconds = Math.floor((now.getTime() - lastDate.getTime()) / 1000);

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
