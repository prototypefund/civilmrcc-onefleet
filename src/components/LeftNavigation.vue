<template>
  <nav>
    <el-tabs v-model="activeCategoryTab">
      <el-tab-pane
        v-for="(category, category_title) in tabpane_categories"
        :label="category.plural"
        :name="category.plural"
        :key="category.plural"
      >
        <div class="action_area">
          <div>
            more
            <br />soon
          </div>
          <el-button
            @click="createItemWithTemplate(category_title)"
            type="danger"
            icon="fas fa-plus-circle"
          >
            Add new {{ category_title }}
          </el-button>
        </div>
        <div class="category_list">
          <ul>
            <NavbarItem
              v-for="item_info in category.item_infos"
              :key="item_info.id"
              :item-id="item_info.id"
              :item_category="category.pouch_identifier"
            ></NavbarItem>
          </ul>
        </div>
      </el-tab-pane>
    </el-tabs>
  </nav>
</template>

<script>
import NavbarItem from './items/NavbarItem.vue';
import templates from './items/templates.js';
import { serverBus } from '../main';
export default {
  name: 'LeftNavigation',
  components: {
    NavbarItem,
  },
  data: function() {
    return {
      vehicles: [],
      shown_items: [],
      categories: [],
      tabpane_categories: {},
      activeCategoryTab: 'Vehicles',
      // item_infos: [],
    };
  },
  computed: {
    //   allCategories: function() {
    //     let all_categories = [];
    //     let all_templates = templates.get('all');

    //     for (let template_index in all_templates) {
    //       all_categories.push({
    //         title: template_index,
    //         plural: all_templates[template_index].plural,
    //         pouch_identifier: all_templates[template_index].pouch_identifier,
    //         // item_ids: loadItemIdsForCategory(template_index),
    //       });
    //     }
    //     console.log('allCategories', all_categories);
    //     return all_categories;
    //   },
    allCats: function() {
      return this.tabpane_categories;
    },
    tab_A_items: function() {
      if (this.tabpane_categories.length > 0)
        return this.tabpane_categories['CASE'].item_infos;
      else return [];
    },
  },

  watch: {
    tabpane_categories: {
      handler: function(after, before) {
        // Changes detected. Do work...
        console.log('change detected in tabpane_categories', after, before);
      },
      deep: true,
    },
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

    loadCategories: function() {
      // console.log('loadCategories ##########');
      let all_templates = templates.get('all');
      for (let template_index in all_templates) {
        this.tabpane_categories[template_index] = {
          plural: all_templates[template_index].plural,
          pouch_identifier: all_templates[template_index].pouch_identifier,
          // item_ids: [],
          item_infos: [],
          // key: template_index,
        };
        this.loadItems(
          template_index,
          all_templates[template_index].pouch_identifier
        );
      }
      // console.log(
      //   'loadCategories ########## tabpane_categories',
      //   this.tabpane_categories
      // );
    },

    loadItems: function(category_index, pouch_identifier) {
      var self = this;
      console.log('loadItems ##########');
      this.$db.getItemIDsByTemplate(pouch_identifier, function(item_infos) {
        console.log('loadItems ########## @@@@@@@', item_infos);
        // if (result.rows.length > 0)
        // self.item_infos = item_infos;
        self.tabpane_categories[category_index].item_infos = item_infos;
        // for (let i in item_infos) {
        //   self.tabpane_categories[category_index].item_ids.push(
        //     item_infos[i].id
        //   );
        // }
        // self.tabpane_categories[category_index].key =
        //   category_index +
        //   self.tabpane_categories[category_index].item_ids.join(',');

        self.$forceUpdate();
        // else console.log('loadItems ########## no rows returned ');
      });
    },

    // loadItemsForCategory: async function(category) {
    //   var items_for_template = [];
    //   // await this.$db.getItemsByTemplate(category.pouch_identifier, function(
    //   //   error,
    //   //   result
    //   // ) {
    //   //   if (error)
    //   //     throw 'an error occured reading the template for the leftnav! ';
    //   //   console.log('loadItemsForCategory result', result);
    //   //   items_for_template = result.rows;
    //   // });

    //   var alliteminfos = this.$db.getInfoOfAllItems();

    //   if (category) console.log('loadItemsForCategory category ', category);
    //   if (alliteminfos)
    //     console.log('loadItemsForCategory alliteminfos ', category);

    //   return items_for_template;
    // },

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
    // serverBus.$on('shown_items', shown_items => {
    //   this.shown_items = shown_items;
    // });
    // this.loadCategories();
    // this.loadItems('LANDMARK');
    //load vehicles
    // this.loadVehicles();
    // let self = this;
    // //set on change listener
    this.$db.setOnChange('positions', 'leftnav_change', function() {
      //reload vehicles if change is detected
      // self.loadVehicles();
      this.loadCategories();
    });
    // this.activeCategoryTab = 'Landmarks';
  },

  created: function() {
    this.loadCategories();
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
  width: var(--app-left-siderbar);
  top: 40px;
  bottom: 0;
  background-color: var(--white);
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
  padding: 0.25em 1em;
}

.action_area div {
  display: flex;
  vertical-align: text-bottom;
  font-style: italic;
  font-size: 0.75em;
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
  padding: 0.5em 1em;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-width: 1px;
  border-color: var(--light-gray);
  border-bottom-style: solid;
}
.category_list li:hover {
  cursor: pointer;
  transition: ease-in-out 0.3s;
  background-color: var(--light-gray);
}

.el-switch {
  margin-right: 0.5em;
}

.el-tag {
  font-family: var(--font-family-monospace);
}
</style>
