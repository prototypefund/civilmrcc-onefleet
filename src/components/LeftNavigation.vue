<template>
  <nav>
    <el-tabs v-model="selected_tab">
      <el-tab-pane
        v-for="(section, section_id) in allSections"
        :label="section.title"
        :name="section_id.toString()"
        :key="section.title"
      >
        <div class="action_area">
          <div>
            <el-dropdown :hide-on-click="false">
              <span class="el-dropdown-link">
                Filter ({{ section.hidden_items }} hidden)
                <i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                Filters:
                <el-dropdown-item
                  v-for="(filter, filter_id) in selectableFilters[section_id]"
                  :key="section_id.toString() + '_' + filter_id"
                  ><el-checkbox
                    v-model="selectableFilters[section_id][filter_id].active"
                  >
                    {{ filter.name }}
                  </el-checkbox>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>

            <el-dropdown disabled>
              <span class="el-dropdown-link">
                Sort By (random)
                <i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                Sort by:
                <el-dropdown-item>
                  Sorting not yet implemented
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
        <div class="category_list">
          <div v-if="section.base_items.length == 0">
            <div v-if="base_items.length == 0">
              loading {{ section.title }}...
            </div>
            <div v-else>
              No items. Please select fewer filters.
            </div>
          </div>
          <ul>
            <NavbarItem
              v-for="base_item in section.base_items"
              :key="base_item._id"
              :base_item="base_item"
              :positions="itemPositions(base_item)"
            ></NavbarItem>
          </ul>
        </div>
      </el-tab-pane>
    </el-tabs>
  </nav>
</template>

<script lang="ts">
import NavbarItem from './items/NavbarItem.vue';
import templates from './items/templates.js';
import { serverBus } from '../main';
export default {
  name: 'LeftNavigation',
  components: {
    NavbarItem,
  },
  props: {
    base_items: { type: Array, required: true },
    positions_per_item: { type: Object, required: false },
  },
  data: function() {
    return {
      selected_tab: '1',
      filters: [],
    };
  },
  computed: {
    allSections() {
      let all_sections = templates.get_filter_groups();
      let section_tabs: {}[] = [];

      // set up tabs for the tabs bar so that they are shown even before items are loaded
      for (let s_id in all_sections) {
        // two-stage filtering for computing hidden items per section:
        let active_filters = this.filters[s_id].filter(f => f.active);
        let section_filters = active_filters.filter(f => f.always_active);

        // filter all items for this section:
        let section_base_items = this.base_items.filter(base_item =>
          section_filters.every(section_filter =>
            this.matchesFilter(base_item, section_filter)
          )
        );

        // filter additional items based on active filters:
        let filtered_base_items = section_base_items.filter(base_item =>
          active_filters.every(active_filter =>
            this.matchesFilter(base_item, active_filter)
          )
        );

        if (all_sections[s_id].selectable_in_sidebar)
          section_tabs.push({
            title: all_sections[s_id].title,
            base_items: filtered_base_items,
            hidden_items:
              section_base_items.length - filtered_base_items.length,
          });
      }
      return section_tabs;
    },
    selectableFilters() {
      return this.filters.map(section_filters =>
        section_filters.filter(f => !(f.always_active || false))
      );
    },
  },

  watch: {},

  methods: {
    itemPositions(base_item) {
      // return null if no positions have been loaded yet:
      if (Object.keys(this.positions_per_item).length === 0) return null;
      else return this.positions_per_item[base_item.identifier] || [];
    },

    createItemWithTemplate(template_to_use) {
      serverBus.$emit('create_item', template_to_use);
    },

    initFilters() {
      /** Get filters and set up their active state */
      let all_sections = templates.get_filter_groups();
      let filters = [];
      for (let section_index in all_sections) {
        filters[section_index] = all_sections[section_index].filters.map(
          filter => {
            filter.active =
              filter.always_active || filter.initially_active ? true : false;
            return filter;
          }
        );
      }
      this.filters = filters;
    },

    matchesFilter(base_item, filter) {
      let item_value = filter.field
        .split('.')
        .reduce((o, i) => o[i] || {}, base_item);
      return filter.values.some(filter_value =>
        this.fitsFilterValue(item_value, filter_value)
      );
    },

    fitsFilterValue(item_value: string, filter_value: string) {
      switch (filter_value[0]) {
        case '$':
          return this.evaluateComparisonFunction(item_value, filter_value);
        case '!':
          return item_value != filter_value.substring(1);
        default:
          return item_value == filter_value;
      }
    },

    evaluateComparisonFunction(item_value: string, filter_value: string) {
      // TODO: use simple regex to implement comparison function. Or Mango-style Query?
      console.log('evaluateComparisonFunction not implemented yet!');
      return item_value || filter_value || true;
    },
  },

  mounted: function() {},

  created: function() {
    this.initFilters();
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
  display: block;
  font-style: italic;
  font-size: 0.75em;
  color: #aaa;
}

.filter_button {
  padding: 2px 10px;
  display: block;
}

.sort_button {
  margin-top: 6px;
  padding: 2px 10px;
  display: block;
}

.category_list div {
  padding: 0.5em 1em;
  display: flex;
  vertical-align: top;
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

.el-dropdown-link {
  cursor: pointer;
  color: #409eff;
  font-size: 12px;
  font-style: normal;
}
.el-icon-arrow-down {
  font-size: 12px;
}
</style>
