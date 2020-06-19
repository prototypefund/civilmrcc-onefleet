<template>
  <nav>
    <el-tabs v-model="selected_tab">
      <el-tab-pane
        v-for="(category, category_title) in allCategories"
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
              v-for="base_item in category.category_base_items"
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
      selected_tab: 'Vehicles',
    };
  },
  computed: {
    allCategories: function() {
      let all_templates = templates.get('all');
      let category_tabs = {};

      for (let item_index in this.base_items) {
        let base_item = this.base_items[item_index];
        let template_infos = all_templates[base_item.template];
        // ignore items with unknown templates
        if (template_infos) {
          if (!category_tabs[base_item.template]) {
            let template_infos = all_templates[base_item.template];
            category_tabs[base_item.template] = {
              plural: template_infos.plural,
              pouch_identifier: template_infos.pouch_identifier,
              category_base_items: [],
            };
          }
          category_tabs[base_item.template].category_base_items.push(base_item);
        }
      }
      return category_tabs;
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
      serverBus.$emit('modal_modus', 'createItem', template_to_use);
    },
  },
  mounted: function() {},

  created: function() {},
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
