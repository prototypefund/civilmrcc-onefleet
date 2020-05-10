<template>
  <nav>
    <el-tabs v-model="activeCategories">
      <el-tab-pane
        v-for="category in categories"
        :label="category.plural"
        :name="category.plural"
        :key="category.plural"
      >
        <div class="action_area">
          <div>
            more <br />
            soon
          </div>
          <el-button
            @click="createItemWithTemplate(category.title)"
            type="danger"
            icon="fas fa-plus-circle"
          >
            Add new {{ category.title }}
          </el-button>
        </div>
        <div class="category_list">
          <ul>
            <li
              v-for="item in category.items.rows"
              :key="item.id"
              @click="flyToItem(item)"
            >
              <el-button
                @click="clickItem(item.id)"
                style="float: right;"
                type="danger"
                icon="el-icon-edit"
                circle
              />
              <span>
                <div class="item_name" v-if="item.doc.properties.name">
                  {{ item.doc.properties.name }}
                </div>
                <div class="item_name" v-else>{{ item.doc._id }}</div>
                <el-tag
                  v-if="item.positions && item.positions.length > 0"
                  size="small"
                  :type="getTimeTagType(item)"
                  style="width:100px;"
                >
                  {{ showTimeTag(item) }} ago
                </el-tag>
                <el-tag v-else size="small" type="info" style="width:100px">
                  no positions
                </el-tag>
                <el-switch
                  v-model="shown_items[item.id]"
                  :active-color="getItemColor(item.id)"
                  active-value="true"
                  inactive-value="false"
                  @change="toggleItem(item.id)"
                />
              </span>
            </li>
          </ul>
        </div>
      </el-tab-pane>
    </el-tabs>
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
      activeCategories: 'Vehicles',
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
    flyToItem: function(item) {
      if (item && item.positions && item.positions.length > 0) {
        let lastPosition = item.positions[item.positions.length - 1];
        lastPosition = { lat: lastPosition.doc.lat, lon: lastPosition.doc.lon };
        serverBus.$emit('fly_to_position', lastPosition);
      }
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

    createItemWithTemplate: function(template_to_use) {
      serverBus.$emit('modal_modus', 'createItem', template_to_use);
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

<style>
.el-tabs__nav-wrap {
  overflow: hidden;
  margin-bottom: -1px;
  position: relative;
  padding-left: 15px;
}
</style>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
nav {
  position: absolute;
  left: 0;
  width: 280px;
  top: 60px;
  bottom: 0;
  background-color: white;
}
nav .categories .item_name {
  margin-left: 5px;
  font-size: 15px;
  min-width: 170px;
  display: inline-block;
}

.action_area {
  display: flex;
  justify-content: space-between;
  padding-bottom: 10px;
  padding-right: 10px;
  padding-left: 10px;
}

.action_area div {
  display: flex;
  vertical-align: text-bottom;
  font-style: italic;
  font-size: 0.8em;
  color: #aaa;
}

.category_list ul {
  overflow: scroll;
  height: -webkit-calc(100vh - 164px);
  height: -moz-calc(100vh - 164px);
  height: calc(100vh - 164px);
  top: 164px;
}

.category_list li {
  padding-top: 5px;
  padding-right: 10px;
  padding-bottom: 10px;
  padding-left: 10px;

  border-width: 1px;
  border-color: #eee;
  border-bottom-style: solid;
}
.category_list li:hover {
  cursor: pointer;
  font-weight: 500;
  transition: ease-in-out 0.3s;
  background-color: #eee;
}

el-switch {
  margin-right: 5px;
}

.item_name:hover {
  cursor: pointer;
  font-weight: 500;
  transition: ease-in-out 0.2s;
}
</style>
