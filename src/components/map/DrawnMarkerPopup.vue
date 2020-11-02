<template>
  <div>
    <span class="latlng"> DD: {{ latestDD }} </span> <br />
    <span class="latlng"> DMS: {{ latestDMS }} </span> <br />

    <el-date-picker
      v-model="sighting_datetime"
      type="datetime"
      placeholder="Enter time of sighting"
      size="small"
    >
    </el-date-picker>

    Save position into: <br />

    <el-dropdown @command="createNewItem">
      <el-button type="primary" plain size="small">
        Existing... <i class="el-icon-arrow-down el-icon--right"></i>
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <el-cascader-panel
          ref="existing_items_cascader"
          :options="item_options"
          :props="{ expandTrigger: 'hover' }"
          @change="addToItem"
        ></el-cascader-panel>
      </el-dropdown-menu>
    </el-dropdown>

    <el-dropdown @command="createNewItem">
      <el-button type="primary" plain size="small" class="button-spacer">
        New... <i class="el-icon-arrow-down el-icon--right"></i>
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item
          v-for="template_option in template_options"
          :command="template_option"
          :key="template_option"
          >{{ capitalizeFirstLetter(template_option) }}</el-dropdown-item
        >
      </el-dropdown-menu>
    </el-dropdown>

    <br />
  </div>
</template>

<script lang="ts">
import templates from '../items/templates.js';
import { serverBus } from '../../main';

export default {
  name: 'DrawnMarkerPopup',
  props: {
    popup_data: {
      type: Object,
      default: () => ({
        position: null,
      }),
    },
    filtered_base_items: { type: Array, required: true },
  },

  data() {
    return {
      sighting_datetime: null,
    };
  },
  computed: {
    latestDMS() {
      return this.$map.asDMS(this.popup_data.position);
    },
    latestDD() {
      return this.$map.asDD(this.popup_data.position);
    },
    template_options() {
      return Object.keys(templates.get('all'));
    },
    item_options() {
      let name_function = this.itemName;
      return this.filtered_base_items.map(section => ({
        value: section.title,
        label: section.title,
        children: section.base_items.map(base_item => ({
          value: base_item._id,
          label: name_function(base_item),
        })),
      }));
    },
    enriched_positions() {
      let positions = [this.popup_data.position];
      return positions.map(pos => {
        // use entered timestamp, or now if not entered:
        pos.timestamp = this.sighting_datetime || new Date();
        return pos;
      });
    },
  },

  watch: {},

  methods: {
    itemName(base_item) {
      if (base_item.properties.name) return base_item.properties.name;
      else return base_item.template + ' ' + base_item.identifier;
    },

    addToItem(item_ids: String[]) {
      if (item_ids.length > 0) {
        serverBus.$emit('show_item', item_ids[1], this.enriched_positions);
        this.$refs.existing_items_cascader.clearCheckedNodes();
      }
    },

    createNewItem(template_type: String) {
      serverBus.$emit('create_item', template_type, this.enriched_positions);
    },

    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
  },

  mounted: function() {},

  created: function() {},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.latlng {
  font-weight: bold;
  white-space: nowrap;
}

.el-date-editor {
  width: 210px;
}

.el-dropdown {
  /* margin-right: 8px; */
  font: 12px/1.5 'Helvetica Neue', Arial, Helvetica, sans-serif;
}
.el-dropdown-link {
  cursor: pointer;
  color: #0078a8;
  text-decoration: underline dashed;
}

.el-button {
  width: 100px;
}

.button-spacer {
  margin-left: 11px;
}
</style>
