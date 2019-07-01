<template>
  <div id="app">

      <CreateItem v-if="modal == 'createItem'"></CreateItem>
      <ShowItem v-show="itemId != false" :itemId="itemId"></ShowItem>
      <ExportItem v-show="exportItemId != false" :exportItemId="exportItemId"></ExportItem>

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
        <div style="margin-left:-15px;" @click="show_chat = !show_chat">toggle chat</div>
        chat
      </div>
  </div>

</template>

<script>
import TopNavigation from './components/TopNavigation.vue'
import CreateItem from './components/items/CreateItem.vue'
import ShowItem from './components/items/ShowItem.vue'
import ExportItem from './components/items/ExportItem.vue'

import LeftNavigation from './components/LeftNavigation.vue'
import Air from './components/Air.vue'
import MapArea from './components/MapArea.vue'
import ListView from './components/ListView.vue'
import Login from './components/Login.vue'
import Settings from './components/Settings.vue'

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
    Settings
  },
  data: function () {
    return {
      modus: 'map',
      modal: '',
      show_air: false,
      itemId: false,
      exportItemId: false,
      show_chat: false
    }
  },
  computed: {
    chatWindowClass: function () {

      var windowClass = this.show_chat ? "show_chat":"hide_chat"
      return windowClass
    }
  },
  methods:{
    showItemDetails:function(item_id){
      console.log('show item with item',item_id)
      this.itemid = 3;
    }
  },
  created: function() {
      serverBus.$on('app_modus', (app_modus) => {
        console.log(app_modus);
        this.$data.modus = app_modus;
      });

      serverBus.$on('modal_modus', (modal_modus) => {
        this.$data.modal = modal_modus;
      });
      serverBus.$on('show_air', (show_air) => {
        console.log('show_air',show_air);
        this.$data.show_air = show_air;
      });
      serverBus.$on('itemId', (itemId) => {
        this.$data.itemId = itemId;
      });
      serverBus.$on('exportItemId', (itemId) => {
        this.$data.exportItemId = itemId;
      });
  }

}
</script>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: #212529;
  text-align: left;
  background-color: #fff;
}
#app {
  position:absolute;
  top:0;
  right:0;
  bottom:0;
  left:0;
  padding-top:60px;
}

.hide_chat{
  margin-right:-20vw;
}

#mainWindow{
  position:absolute;
  width:75vw;
  left:25vw;
  top:60px;
  bottom:0;
  background:#FFF;
}
#chat{
  position:fixed;
  width:20vw;
  right:0;
  top:60px;
  bottom:0;
  z-index:999;
}


ul{
  list-style:none;
  margin:0;
  padding:0;
}

.background{
  position:fixed;
  top:0;
  right:0;
  bottom:0;
  left:0;
  background:rgba(0,0,0,0.8);
  z-index: 9999;
}

.form-style-6{
  max-width: 400px;
  margin: 10px auto;
  padding: 16px;
  background: #F7F7F7;
}
.form-style-6 h1{
  background: #43D1AF;
  padding: 20px 0;
  font-size: 140%;
  font-weight: 300;
  text-align: center;
  color: #fff;
  margin: -16px -16px 16px -16px;
}
.form-style-6 input[type="text"],
.form-style-6 input[type="date"],
.form-style-6 input[type="datetime"],
.form-style-6 input[type="email"],
.form-style-6 input[type="number"],
.form-style-6 input[type="search"],
.form-style-6 input[type="time"],
.form-style-6 input[type="url"],
.form-style-6 input[type="password"],
.form-style-6 input[type="checkbox"],
.form-style-6 textarea,
.form-style-6 select 
{
  -webkit-transition: all 0.30s ease-in-out;
  -moz-transition: all 0.30s ease-in-out;
  -ms-transition: all 0.30s ease-in-out;
  -o-transition: all 0.30s ease-in-out;
  outline: none;
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  width: 100%;
  background: #fff;
  margin-bottom: 4%;
  border: 1px solid #ccc;
  padding: 3%;
  color: #555;
  font: 95% Arial, Helvetica, sans-serif;
  height:42px;
}

.form-style-6 input[type="checkbox"]{
  height: 10px;
  width: auto;
}

.form-style-6 input[type="text"]:focus,
.form-style-6 input[type="date"]:focus,
.form-style-6 input[type="datetime"]:focus,
.form-style-6 input[type="email"]:focus,
.form-style-6 input[type="number"]:focus,
.form-style-6 input[type="search"]:focus,
.form-style-6 input[type="time"]:focus,
.form-style-6 input[type="url"]:focus,
.form-style-6 input[type="password"]:focus,
.form-style-6 textarea:focus,
.form-style-6 select:focus
{
  box-shadow: 0 0 5px #43D1AF;
  padding: 3%;
  border: 1px solid #43D1AF;
}

.form-style-6 input[type="submit"],
.form-style-6 input[type="button"]{
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  width: 100%;
  padding: 3%;
  background: #43D1AF;
  border-bottom: 2px solid #30C29E;
  border-top-style: none;
  border-right-style: none;
  border-left-style: none;  
  color: #fff;
}
.form-style-6 input[type="submit"]:hover,
.form-style-6 input[type="button"]:hover{
  background: #2EBC99;
}
.select-css {
  display: block;
  font-size: 16px;
  font-family: sans-serif;
  font-weight: 700;
  color: #444;
  line-height: 1.3;
  padding: .6em 1.4em .5em .8em;
  width: 100%;
  max-width: 100%; 
  box-sizing: border-box;
  margin: 0;
  border: 1px solid #000;
  border-radius: 0;
  -moz-appearance: none;
  -webkit-appearance: none;
  appearance: none;
  background-color: #fff;
}
.select-css::-ms-expand {
  display: none;
}
.select-css:hover {
  border-color: #888;
}
.select-css:focus {
  border-color: #aaa;
  box-shadow: 0 0 1px 3px rgba(59, 153, 252, .7);
  box-shadow: 0 0 0 3px -moz-mac-focusring;
  color: #222; 
  outline: none;
}
.select-css option {
  font-weight:normal;
}
</style>
