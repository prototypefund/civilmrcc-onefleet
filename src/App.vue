<template>
  <div id="app">
    <Loadingscreen v-if="show_loadingscreen"></Loadingscreen>
    <Login v-if="modal == 'login'"></Login>
    <Settings v-if="modal == 'settings'"></Settings>

    <CreateItem
      v-if="modal == 'createItem'"
      :given_template="modal_data.given_template_type"
      :given_positions="modal_data.given_positions"
    ></CreateItem>
    <ShowItem
      v-show="modal == 'showItem'"
      :itemId="modal_data.given_item_id"
      :given_positions="modal_data.given_positions"
      :mapped_base_items="mapped_base_items"
      :positions_per_item="positions_per_item"
    ></ShowItem>
    <ExportItem
      v-show="exportItemId != false"
      :exportItemId="exportItemId"
    ></ExportItem>

    <TopNavigation :modus="main_view_mode"></TopNavigation>

    <LeftNavigation
      v-show="main_view_mode == 'map'"
      :filters="filters"
      :base_items="base_items"
      :filtered_base_items="allFilteredItems"
      :positions_per_item="positions_per_item"
    />
    <Air v-if="show_air"></Air>
    <Log v-if="show_log"></Log>
    <div id="mainWindow">
      <MapArea
        v-show="main_view_mode == 'map'"
        :filtered_base_items="allFilteredItems"
        :positions_per_item="positions_per_item"
      />
    </div>
    <ListView
      class="wide"
      v-show="main_view_mode == 'list'"
      :base_items="base_items"
      :positions_per_item="positions_per_item"
    />
  </div>
</template>

<script lang="ts">
// vue-components: main window areas
import TopNavigation from './components/TopNavigation.vue';
import LeftNavigation from './components/LeftNavigation.vue';

// vue-components: item-specific modals
import CreateItem from './components/items/CreateItem.vue';
import ShowItem from './components/items/ShowItem.vue';
import ExportItem from './components/items/ExportItem.vue';

// vue-components: other modals & popups
import Air from './components/Air.vue';
import Log from './components/Log.vue';
import MapArea from './components/MapArea.vue';
import ListView from './components/ListView.vue';
import Login from './components/Login.vue';
import Settings from './components/Settings.vue';
import Loadingscreen from './components/Loadingscreen.vue';

// other imports
import templates from './components/items/templates.js';
import { serverBus } from './main';
// import { DbItem } from '@/types/db-item';
// import { DbPosition } from '@/types/db-position';

export default {
  name: 'app',
  components: {
    // main window areas:
    TopNavigation,
    LeftNavigation,
    Air,
    Log,
    MapArea,
    ListView,
    // item-specific modals:
    CreateItem,
    ShowItem,
    ExportItem,
    // other modals & popups:
    Login,
    Settings,
    Loadingscreen,
  },
  data: () => ({
    main_view_mode: 'map',
    modal: '',
    modal_data: {},
    show_air: false,
    show_log: false,
    show_loadingscreen: true,
    itemId: false,
    exportItemId: false,
    base_items: [],
    base_positions: [],
    positions_per_item: {},
    filters: [],
  }),
  computed: {
    /**
     * This computed value just returns an indexed version of the base_items.
     * The index is the item's id field.
     */
    mapped_base_items: function() {
      return this.base_items.reduce((map, item) => {
        map[item._id] = item;
        return map;
      }, {});
    },

    /**
     * This computed value always contains an array of filtered item sections.
     * It is used by the LeftNavigationBar to display all items by tab section,
     * and by the MapArea to display the visible items in one layer per filter section.
     * Some map Popup components also use this to display available items in popups.
     */
    allFilteredItems() {
      let all_filter_groups = templates.get_filter_groups();
      let filtered_item_groups: {}[] = [];

      // set up tabs for the tabs bar so that they are shown even before items are loaded
      for (let s_id in all_filter_groups) {
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

        if (all_filter_groups[s_id].selectable_in_sidebar)
          filtered_item_groups.push({
            title: all_filter_groups[s_id].title,
            base_items: filtered_base_items,
            hidden_items:
              section_base_items.length - filtered_base_items.length,
          });
      }
      return filtered_item_groups;
    },
  },
  watch: {
    base_items: function() {
      console.log('base_items new length:', this.base_items.length);
    },
    base_positions: function() {
      console.log('base_positions new length: ', this.base_positions.length);
    },
  },
  methods: {
    loadItems() {
      this.$db.getBaseItems().then(result => {
        this.base_items = result.rows.map(item => item.doc);
      });
    },
    loadPositions() {
      this.$db.getBasePositions().then(result => {
        let base_positions = result.rows.map(position => position.doc);
        this.positions_per_item = this.assignPositions(base_positions);
        this.base_positions = base_positions;
      });
    },
    assignPositions(base_positions) {
      // todo: move this to db-wrapper
      let positions_per_item = {};
      for (let i in base_positions) {
        let pos = base_positions[i];
        if (!positions_per_item[pos.item_identifier])
          positions_per_item[pos.item_identifier] = [];
        positions_per_item[pos.item_identifier].push(pos);
      }
      return positions_per_item;
    },
    getPositionsForItem(base_item) {
      // todo: move this to db-wrapper
      let positions = this.positions_per_item[base_item._id];
      if (!positions) positions = this.positions_per_item[base_item.identifier];
      return positions;
    },

    /** Start of Item Filter functions */
    initFilters() {
      /** Get filters and set up their active state */
      let all_filter_groups = templates.get_filter_groups();
      let filters = [];
      for (let section_index in all_filter_groups) {
        filters[section_index] = all_filter_groups[section_index].filters.map(
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
    /** End of Item Filter functions */
  },

  created: function() {
    serverBus.$on('show_login_screen', () => {
      this.show_loadingscreen = false;
      this.modal_data = {};
      this.modal = 'login';
    });

    
    serverBus.$on('main_view_mode', app_modus => {
      this.main_view_mode = app_modus;
    });
    serverBus.$on('show_settings', app_modus => {
      console.log('ettings');
      this.modal = 'settings';
    });
    serverBus.$on('create_item', (template_type, latlngs) => {
      this.modal_data = {
        given_template_type: template_type,
        given_positions: latlngs,
      };
      this.modal = 'createItem';
    });
    // deprecated! Please use the specific signal directly.
    // serverBus.$on('modal_modus', (modal_modus, modal_data) => {
    //   this.$data.modal = modal_modus;
    //   if (modal_modus == 'login') this.$data.show_loadingscreen = false;
    //   this.$data.modal_data = modal_data;
    // });
    serverBus.$on('show_air', show_air => {
      this.$data.show_air = show_air;
    });
    serverBus.$on('show_log', show_log => {
      this.$data.show_log = show_log;
    });
    serverBus.$on('itemId', itemId => {
      // deprecated. use the 'show_item' signal directly!
      serverBus.$emit('show_item', itemId);
    });
    serverBus.$on(
      'show_item',
      (item_id: String, latlngs: { lat: number; lon: number }[]) => {
        if (item_id) {
          this.modal_data = {
            given_item_id: item_id,
            given_positions: latlngs,
          };
          // this.itemId = item_id;
          this.modal = 'showItem';
        } else {
          // this.itemId = false;
          this.modal = '';
          this.modal_data = {};
        }
      }
    );
    serverBus.$on('exportItemId', itemId => {
      this.$data.exportItemId = itemId;
    });
    serverBus.$on('close_modal', () => {
      this.modal = '';
      this.modal_data = {};
    });

    let self = this;
    //set on change listener on positions because its usually the largest database

    this.$db.setOnInitialReplicationDone(
      'positions',
      'hide_loadingscreen',
      function() {
        //reload vehicles if change is detected
        self.show_loadingscreen = false;
      }
    );
    this.$db.setOnChange('items', 'base_items_change', function() {
      //reload base_items if change is detected
      self.loadItems();
    });
    this.$db.setOnChange('positions', 'base_positions_change', function() {
      //reload base_positions if change is detected
      self.loadPositions();
    });

    this.loadItems();
    this.loadPositions();
    this.initFilters();
  },
};
</script>

<style>
:root {
  --primary-darker: #04202e;
  --primary-dark: #1079ad;
  --primary: #17affa;
  --primary-light: #61c7fa;
  --primary-lighter: #def1fa;
  --white: #ffffff;
  --light-gray: #eeeeee;
  --dark-gray: #666666;
  --black: #151515;
  --red: #ff3333;

  --font-family-sans-serif: -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, 'Noto Sans', Ubuntu, Cantarell, 'Helvetica Neue', sans-serif,
    'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  --font-family-monospace: 'Menlo', 'DejaVu Sans Mono', 'Liberation Mono',
    'Consolas', 'Ubuntu Mono', 'Courier New', 'andale mono', 'lucida console',
    monospace;
  --border-radius: 4px;
  --app-top: 40px;
  --app-left-siderbar: 280px;
}

.el-button--danger {
  background: var(--red);
}

.el-tabs__item.is-active {
  color: var(--primary);
}

.svg-inline--fa {
  margin-right: 0.25em;
}

body {
  margin: 0;
  font-family: var(--font-family-sans-serif);
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: var(--black);
  text-align: left;
  background-color: var(--white);
}

#app {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  padding-top: var(--app-top);
}

.hide_chat {
  margin-right: -20vw;
}

#mainWindow {
  position: absolute;
  width: -webkit-calc(100% - var(--app-left-siderbar));
  width: -moz-calc(100% - var(--app-left-siderbar));
  width: calc(100% - var(--app-left-siderbar));
  left: var(--app-left-siderbar);
  right: 0px;
  top: var(--app-top);
  bottom: 0px;
  background: var(--white);
}

.wide {
  position: absolute;
  left: 10px;
  right: 10px;
  top: var(--app-top);
  bottom: 0px;
  background: var(--white);
}

#chat {
  display: none; /* hide for now */
  position: fixed;
  width: 20vw;
  right: 0;
  top: var(--app-top);
  bottom: 0;
  z-index: 999;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.background {
  position: fixed;
  overflow: auto;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 9999;
}

.form-style-6 {
  max-width: 400px;
  margin: 10px auto;
  padding: 16px;
  background: var(--white);
}
.form-style-6 h1 {
  background: var(--primary);
  padding: 20px 0;
  font-size: 140%;
  font-weight: 300;
  text-align: center;
  color: var(--white);
  margin: -16px -16px 16px -16px;
}
.form-style-6 input[type='text'],
.form-style-6 input[type='date'],
.form-style-6 input[type='datetime'],
.form-style-6 input[type='email'],
.form-style-6 input[type='number'],
.form-style-6 input[type='search'],
.form-style-6 input[type='time'],
.form-style-6 input[type='url'],
.form-style-6 input[type='password'],
.form-style-6 input[type='checkbox'],
.form-style-6 input[type='datetime-local'],
.form-style-6 textarea,
.form-style-6 select {
  transition: all 0.3s ease-in-out;
  -webkit-transition: all 0.3s ease-in-out;
  -moz-transition: all 0.3s ease-in-out;
  -ms-transition: all 0.3s ease-in-out;
  -o-transition: all 0.3s ease-in-out;
  outline: none;
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  width: 100%;
  background: var(--white);
  margin-bottom: 4%;
  border: 1px solid var(--light-gray);
  padding: 3%;
  color: var(--dark-gray);
  font: 95% Arial, Helvetica, sans-serif;
  height: 42px;
}

.form-style-6 input[type='checkbox'] {
  height: 10px;
  width: auto;
}

.form-style-6 input[type='text']:focus,
.form-style-6 input[type='date']:focus,
.form-style-6 input[type='datetime']:focus,
.form-style-6 input[type='email']:focus,
.form-style-6 input[type='number']:focus,
.form-style-6 input[type='search']:focus,
.form-style-6 input[type='time']:focus,
.form-style-6 input[type='url']:focus,
.form-style-6 input[type='password']:focus,
.form-style-6 textarea:focus,
.form-style-6 select:focus {
  box-shadow: 0 0 5px var(--primary);
  padding: 3%;
  border: 1px solid var(--primary);
}

.form-style-6 input[type='submit'],
.form-style-6 input[type='button'] {
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  width: 100%;
  padding: 3%;
  background: var(--primary);
  border-bottom: 2px solid var(--primary);
  border-top-style: none;
  border-right-style: none;
  border-left-style: none;
  color: #fff;
}
.form-style-6 input[type='submit']:hover,
.form-style-6 input[type='button']:hover {
  background: var(--primary-dark);
}
.select-css {
  display: block;
  font-size: 16px;
  font-family: sans-serif;
  font-weight: 700;
  color: var(--dark-gray);
  line-height: 1.3;
  padding: 0.6em 1.4em 0.5em 0.8em;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  margin: 0;
  border: 1px solid var(--black);
  border-radius: 0;
  -moz-appearance: none;
  -webkit-appearance: none;
  appearance: none;
  background-color: var(--white);
}
.select-css::-ms-expand {
  display: none;
}
.select-css:hover {
  border-color: var(--dark-gray);
}
.select-css:focus {
  border-color: #aaa;
  box-shadow: 0 0 1px 3px rgba(59, 153, 252, 0.7);
  box-shadow: 0 0 0 3px -moz-mac-focusring;
  color: #222;
  outline: none;
}
.select-css option {
  font-weight: normal;
}

.iconwrapper {
  width: 100%;
}
.iconwrapper input {
  width: 80% !important;
}
.preview-icon {
  border: 1px solid #c9c9c9;
  margin-left: 10px;
  padding: 11px;
}

.save_cancel_buttons input {
  width: 49% !important;
}
.save_cancel_buttons input[type='submit'] {
  margin-right: 2%;
}

.tags-input-wrapper-default,
.tags-input-wrapper-default.active {
  padding: 0;
  background: none;
  border: none;
  border-radius: 0;
  border-color: #dbdbdb;
  box-shadow: none;
}

input[type='tag'] {
  display: none;
}
</style>
