<template>
  <li :class="itemLoadingClass" @click="flyToItem(item)">
    <span>
      <div class="item_name">{{ itemName }}</div>
      <el-switch v-model="itemShowing" :active-color="itemColor" />
      <el-tag size="small" :type="positionAgeType">
        {{ positionAgeText }}
      </el-tag>
    </span>
    <el-button
      @click="clickItem(item.id)"
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
// import templates from './templates.js';
import { serverBus } from '../../main';
export default {
  name: 'NavbarItem',

  props: {
    itemId: {
      type: String,
      required: true,
    },
    item_category: {
      type: String,
      required: true,
    },
  },

  data: function() {
    return {
      item: null,
      itemShowing: false,
    };
  },

  computed: {
    itemName: function() {
      if (this.item) {
        if (this.item.doc.properties.name) return this.item.doc.properties.name;
        else return this.itemId;
      } else {
        let identifier = this.itemId.substr(this.item_category.length + 1);
        return identifier + ' (loading...)';
      }
    },
    itemLoadingClass: function() {
      if (this.item) {
        return 'NavbarItem';
      } else {
        return 'NavbarItem item_loading';
      }
    },
    itemColor: function() {
      if ((((this.item || {}).doc || {}).properties || {}).color)
        return this.item.doc.properties.color;
      else if ((((this.item || {}).doc || {}).properties || {}).boat_color)
        return this.item.doc.properties.boat_color;
      else return '#13ce66';
    },
    itemTemplate: function() {
      if (((this.item || {}).doc || {}).template) return this.item.doc.template;
      else return '';
    },
    itemActive: function() {
      if (((this.item || {}).doc || {}).properties) {
        if (this.item.doc.template == 'case')
          return this.item.doc.properties.status != 'closed';
        else return this.item.doc.properties.active == 'true';
      }
      return false;
    },
    positionAgeText: function() {
      if (((this.item || {}).positions || {}).length > 0) {
        let lastPosition = this.item.positions[this.item.positions.length - 1];
        return this.timeSince(lastPosition.doc.timestamp) + ' ago';
      } else {
        return 'no positions';
      }
    },
    positionAgeType: function() {
      if (((this.item || {}).positions || {}).length > 0) {
        let lastPosition = this.item.positions[this.item.positions.length - 1];
        let lastDate = new Date(lastPosition.doc.timestamp);
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

  watch: {
    itemShowing: function() {
      serverBus.$emit('set_item_visibility', this.item, this.itemShowing);
    },
    item: function(newVal, oldVal) {
      console.log('item changed in NavbarItem: ', this.item, newVal, oldVal);
      this.itemShowing = this.itemActive;
    },
  },

  methods: {
    loadItem: function() {
      var self = this;
      this.$db.getItem(this.itemId, function(item_from_db) {
        console.log('navbaritem loadItem callback', item_from_db);
        self.item = item_from_db;
      });
    },
    clickItem: function(itemId) {
      serverBus.$emit('itemId', itemId);
    },
    // click on the last position span
    flyToItem: function() {
      if (((this.item || {}).positions || {}).length > 0) {
        let lastPosition = this.item.positions[this.item.positions.length - 1];
        lastPosition = { lat: lastPosition.doc.lat, lon: lastPosition.doc.lon };
        serverBus.$emit('fly_to_position', lastPosition);
      }

      //   if (item && item.positions && item.positions.length > 0) {
      //     let lastPosition = item.positions[item.positions.length - 1];
      //     lastPosition = { lat: lastPosition.doc.lat, lon: lastPosition.doc.lon };
      //     serverBus.$emit('fly_to_position', lastPosition);
      //   }
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
  mounted: function() {
    //load item from db
    this.loadItem();
    let self = this;
    //set on change listener
    this.$db.setOnChange('items', 'navitem_change', function() {
      //reload vehicles if change is detected
      self.loadItem();
    });
    //set on change listener
    this.$db.setOnChange('positions', 'navitem_change', function() {
      //reload vehicles if change is detected
      self.loadItem();
    });
  },
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
