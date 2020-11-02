<template>
  <div id="listview">
    <h2>Items</h2>

    <el-collapse v-model="activeCategories">
      <el-collapse-item
        v-for="category in allCategories"
        class="categories"
        :title="category.plural"
        :name="category.plural"
        :key="category.plural"
      >
        <table>
          <thead>
            <th>id</th>
            <th>first seen</th>
            <th v-for="field in category.fields" :key="field.name">
              {{ field.name }}
            </th>
          </thead>

          <tr v-for="item in category.category_base_items" :key="item._id">
            <td>{{ item._id }}</td>
            <td v-if="itemPositions(item) && itemPositions(item)[0]">
              {{ itemPositions(item)[0].timestamp }}
            </td>
            <td v-else>no positions</td>
            <td v-for="field in category.fields" :key="field.name">
              {{ item.properties[field.name] }}
            </td>
            <!--<span>{{vehicle.positions}}</span>-->
          </tr>
        </table>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script lang="ts">
import templates from './items/templates.js';
export default {
  name: 'ListView',

  props: {
    base_items: { type: Array, required: true },
    positions_per_item: { type: Object, required: false },
  },
  data: function() {
    return {
      activeCategories: ['Vehicles'],
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
              fields: template_infos.fields,
            };
          }
          category_tabs[base_item.template].category_base_items.push(base_item);
        }
      }
      return category_tabs;
    },
  },
  methods: {
    itemPositions: function(base_item) {
      // return null if no positions have been loaded yet:
      if (Object.keys(this.positions_per_item).length === 0) return null;
      else return this.positions_per_item[base_item.identifier] || [];
    },
  },
  mounted: function() {},
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.el-collapse-item__header {
  font-size: 22px;
}
</style>
<style scoped>
table {
  width: 100%;
}
tr:nth-child(even) {
  background-color: #f2f2f2;
}
</style>
