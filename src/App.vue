<template>
  <div id="app">
    <Loadingscreen v-if="show_loadingscreen"></Loadingscreen>
    <CreateItem
      v-if="modal == 'createItem'"
      :givenTemplate="modal_data"
    ></CreateItem>
    <ShowItem v-show="itemId != false" :itemId="itemId"></ShowItem>
    <ExportItem
      v-show="exportItemId != false"
      :exportItemId="exportItemId"
    ></ExportItem>

    <Login v-if="modal == 'login'"></Login>
    <Settings v-if="modal == 'settings'"></Settings>
    <TopNavigation></TopNavigation>

    <LeftNavigation></LeftNavigation>
    <Air v-if="show_air"></Air>
    <div id="mainWindow">
      <MapArea v-show="modus == 'map'"></MapArea>
      <ListView v-show="modus == 'cases'"></ListView>
    </div>
    <div id="chat" v-bind:class="chatWindowClass">
      <div style="margin-left:-15px;" @click="show_chat = !show_chat">
        toggle chat
      </div>
      chat
    </div>
  </div>
</template>

<script lang="ts">
import TopNavigation from './components/TopNavigation.vue';
import CreateItem from './components/items/CreateItem.vue';
import ShowItem from './components/items/ShowItem.vue';
import ExportItem from './components/items/ExportItem.vue';

import LeftNavigation from './components/LeftNavigation.vue';
import Air from './components/Air.vue';
import MapArea from './components/MapArea.vue';
import ListView from './components/ListView.vue';
import Login from './components/Login.vue';
import Settings from './components/Settings.vue';
import Loadingscreen from './components/Loadingscreen.vue';

import { serverBus } from './main';

export default {
  name: 'app',
  components: {
    TopNavigation,
    LeftNavigation,
    Air,
    MapArea,
    CreateItem,
    ShowItem,
    ExportItem,
    ListView,
    Login,
    Settings,
    Loadingscreen,
  },
  data: () => ({
    modus: 'map',
    modal: '',
    modal_data: '',
    show_air: false,
    show_loadingscreen: true,
    itemId: false,
    exportItemId: false,
    show_chat: false,
  }),
  computed: {
    chatWindowClass: function() {
      return this.show_chat ? 'show_chat' : 'hide_chat';
    },
  },
  methods: {
    showItemDetails: () => {
      this.itemid = 3;
    },
  },
  created: function() {
    serverBus.$on('app_modus', app_modus => {
      this.$data.modus = app_modus;
    });

    serverBus.$on('modal_modus', (modal_modus, modal_data) => {
      this.$data.modal = modal_modus;
      if (modal_modus == 'login') this.$data.show_loadingscreen = false;
      this.$data.modal_data = modal_data;
    });
    serverBus.$on('show_air', show_air => {
      this.$data.show_air = show_air;
    });
    serverBus.$on('itemId', itemId => {
      this.$data.itemId = itemId;
    });
    serverBus.$on('exportItemId', itemId => {
      this.$data.exportItemId = itemId;
    });
    //let self = this;
    //set on change listener on positions because its usually the largest database
    let self = this;
    this.$db.setOnInitialReplicationDone(
      'positions',
      'hide_loadingscreen',
      function() {
        //reload vehicles if change is detected
        self.show_loadingscreen = false;
      }
    );
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
