<template>
  <div>
    <span class="latlng"> DD: {{ latestDD }} </span> <br />
    <span class="latlng"> DMS: {{ latestDMS }} </span> <br />

    Save position into: <br />

    <el-cascader
      placeholder="Existing..."
      :options="options"
      :show-all-levels="false"
      filterable
      size="small"
      :props="{ expandTrigger: 'hover' }"
      @change="addToItem"
    ></el-cascader>
    <el-dropdown @command="createNewItem">
      <el-button type="primary" plain size="small">
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
      options: [
        {
          value: 'case',
          label: 'Cases',
          children: [
            {
              value: 'case_1',
              label: 'Case 1',
            },
            {
              value: 'CASE_AP_0',
              label: 'Case AP 0',
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
  },

  watch: {},

  methods: {
    addToItem(item_ids: String[]) {
      console.log('mapArea.addToItem', item_ids);
      serverBus.$emit('show_item', item_ids[1], [this.popup_data.position]);
    },

    createNewItem(template_type: String) {
      serverBus.$emit('create_item', template_type, [this.popup_data.position]);
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

.el-dropdown {
  /* margin-right: 8px; */
  font: 12px/1.5 'Helvetica Neue', Arial, Helvetica, sans-serif;
}
.el-dropdown-link {
  cursor: pointer;
  color: #0078a8;
  text-decoration: underline dashed;
}

.el-cascader {
  width: 110px;
  margin-right: 10px;
}
</style>
