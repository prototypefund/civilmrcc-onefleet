<template>
  <nav>
    <ul>
      <el-collapse v-model="activeCategories">
        <el-collapse-item
          v-for="category in categories"
          class="categories"
          :title="category.plural"
          :name="category.plural"
          :key="category.plural"
        >
          <ul class="category_list">
            <li v-for="item in category.items.rows">
              <span
                class="item_name"
                @click="clickItem(item.id)"
                v-if="item.doc.properties.name"
                >{{ item.doc.properties.name }}</span
              >
              <span class="item_name" v-if="!item.doc.properties.name">{{
                item.doc._id
              }}</span>
              <span>
                <!-- use span tag to trigger click event, click event on el-tag won't work for some reason -->
                <span v-on:click="flyToPosition(item.positions)">
                  <el-tag
                    class="position_button"
                    size="small"
                    :type="getTimeTagType(item)"
                    style="width:100px;"
                    v-if="
                      item.positions &&
                        item.positions.length > 0 &&
                        item.positions[item.positions.length - 1]
                    "
                  >
                    {{ showTimeTag(item) }} ago
                  </el-tag>
                </span>
                <el-tag
                  size="small"
                  type="info"
                  style="width:100px"
                  v-if="!item.positions || item.positions.length == 0"
                >
                  no positions
                </el-tag>
              </span>
              <span style="float:right;">
                <el-switch
                  v-model="shown_items[item.id]"
                  :active-color="getItemColor(item.id)"
                  inactive-color="#ff4949"
                  active-value="true"
                  inactive-value="false"
                  @change="toggleItem(item.id)"
                >
                </el-switch>
              </span>
              <!--<span>{{vehicle.positions}}</span>-->
            </li>
          </ul>
        </el-collapse-item>
      </el-collapse>
    </ul>
  </nav>
</template>

<script>
import templates from './items/templates.js';
import { serverBus } from '../main';
export default {
  name: 'LeftNavigation',

  data: function() {
    return {
      vehicles: [],
      shown_items: [],
      categories: [],
      activeCategories: ['Vehicles'],
    };
  },
  methods: {
    isShown: function(identifier) {
      return this.shown_items[identifier];
    },
    initItem: function(identifier, active) {
      this.shown_items[identifier] = active;

      serverBus.$emit('shown_items', this.shown_items);
    },
    toggleItem: function() {
      serverBus.$emit('shown_items', this.shown_items);
    },

    // click on the itemname span
    clickItem: function(itemId) {
      serverBus.$emit('itemId', itemId);
    },

    // click on the last position span
    flyToPosition: function(positions) {
      const mappedPositions = positions.map(position => {
        return { lat: position.doc.lat, lon: position.doc.lon };
      });

      const lastPositionIndex = mappedPositions.length - 1;
      serverBus.$emit('fly_to_position', mappedPositions[lastPositionIndex]);
    },

    getItemColor: function(itemId) {
      var item = this.getItemById(itemId);
      if (
        item &&
        typeof item.doc.properties != 'undefined' &&
        typeof item.doc.properties.color != 'undefined'
      )
        return item.doc.properties.color;
      else return '#13ce66';
    },
    getItemById: function(itemId) {
      for (var i in this.vehicles) {
        if (this.vehicles[i].id == itemId) return this.vehicles[i];
      }
      return false;
    },
    showTimeTag: function(item) {
      if (item.positions[item.positions.length - 1])
        return this.timeSince(
          item.positions[item.positions.length - 1].doc.timestamp
        );
    },
    getTimeTagType: function(item) {
      if (item.positions[item.positions.length - 1]) {
        let date = new Date(
          item.positions[item.positions.length - 1].doc.timestamp
        );
        let seconds = Math.floor((new Date() - date) / 1000);
        let type;
        if (seconds > 0 && seconds <= 1800) type = 'success';
        else if (seconds > 1800 && seconds <= 86400) type = 'warning';
        else if (seconds > 86400) type = 'danger';
        return type;
      }
    },
    timeSince: function(date) {
      date = new Date(date);
      let seconds = Math.floor((new Date() - date) / 1000);

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
    loadVehicles: function() {
      let self = this;
      let all_templates = templates.get('all');
      self.categories = [];
      for (var template in all_templates) {
        //i actually like js, but sometimes...
        //this is the easiest way to avoid async race conditions
        (function(template_index) {
          self.$db.getItemsByTemplate(
            all_templates[template_index].pouch_identifier,
            function(error, result) {
              if (error)
                throw 'an error occured reading the template for the leftnav! ';

              self.categories.push({
                title: template_index,
                plural: all_templates[template_index].plural,
                items: result,
              });
            }
          );
        })(template);
      }

      this.$db.getVehicles(function(err, result) {
        self.$data.vehicles = result.rows;
        for (var category_index in self.$data.categories) {
          //get all items within a category
          for (var item in self.$data.categories[category_index].items.rows) {
            let is_active =
              self.$data.categories[category_index].items.rows[item].doc
                .properties.active;

            let identifier =
              self.$data.categories[category_index].items.rows[item].id;

            self.initItem(identifier, is_active);
          }
        }
      });
    },
  },
  mounted: function() {
    serverBus.$on('shown_items', shown_items => {
      this.shown_items = shown_items;
    });

    //load vehicles
    this.loadVehicles();

    let self = this;

    //set on change listener
    this.$db.setOnChange('items', 'leftnav_change', function() {
      //reload vehicles if change is detected
      self.loadVehicles();
    });
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
nav .el-collapse-item__header {
  font-size: 22px;
  padding: 10px;
}
</style>

<style scoped>
nav {
  position: absolute;
  left: 0;
  width: 25vw;
  top: 60px;
  bottom: 0;
  overflow: auto;
}
nav .categories .item_name {
  margin-left: 5px;
  font-size: 15px;
  min-width: 170px;
  display: inline-block;
}

.category_list li {
  display: flex;
  padding: 2px 15px;
}

el-switch {
  margin-right: 5px;
}

el-tag {
}

.item_name:hover {
  cursor: pointer;
  font-weight: 500;
  transition: ease-in-out 0.2s;
}
</style>
