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
  },

  data() {
    return {
      sighting_datetime: null,
      options: [
        {
          value: 'case',
          label: 'Cases',
          children: [
            {
              value: 'CASE_TEST1',
              label: 'Case TEST1',
            },
            {
              value: 'CASE_TEST2',
              label: 'Case TEST2',
            },
            {
              value: 'CASE_TEST3',
              label: 'Case TEST3',
            },
          ],
        },
        {
          value: 'civilfleet',
          label: 'Civil Fleet',
          children: [
            {
              value: 'ship_1',
              label: 'Ship 1',
            },
            {
              value: 'ship_2',
              label: 'Ship 2',
            },
            {
              value: 'aircraft_1',
              label: 'Aircraft 1',
            },
          ],
        },
        {
          value: 'other',
          label: 'Other',
          children: [
            {
              value: 'axure',
              label: 'Axure Components',
            },
            {
              value: 'sketch',
              label: 'Sketch Templates',
            },
            {
              value: 'docs',
              label: 'Design Documentation',
            },
          ],
        },
      ],
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
      let item_options = this.options;
      for (let i = 0; i < 30; i++)
        item_options[2].children.push({
          value: 'plus_' + i,
          label: 'Other Item ' + i,
        });
      return item_options;
    },
    enriched_positions() {
      let positions = [this.popup_data.position];
      return positions.map(pos => {
        pos.timestamp = this.sighting_datetime;
        return pos;
      });
    },
  },

  watch: {},

  methods: {
    addToItem(item_ids: String[]) {
      serverBus.$emit('show_item', item_ids[1], this.enriched_positions);
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
