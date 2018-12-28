<template>
   <nav>

      <div id="brand">
        OneFleet
      </div>
      <ul id="nav-left">
        <li v-on:click="changeModus('map')"> <a>Map</a></li>
        <li v-on:click="changeModus('cases')"> <a>List</a></li>
        <li v-on:click="openModal('createItem')"> <a>Create New Item</a></li>
      </ul>
      <ul id="nav-right">
        <li class="dropdown">
          Username
          <ul v-if="false">
            <li>Userinfo</li>
            <li>Settings</li>
            <li>Logout</li>
          </ul>
        </li>
      </ul>
   </nav>
</template>

<script>

import {serverBus}  from '../main';
export default {
  name: 'TopNavigation',
  methods: {
    changeModus: function (value) {
     // Using the service bus
     serverBus.$emit('app_modus', value);
    },
    openModal: function (value) {
     // Using the service bus
     serverBus.$emit('modal_modus', value);
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  nav{
    position:absolute;
    top:0;
    right:0;
    left:0;
    height:60px;
    background: rgb(55,60,68);
  }

  nav #brand{
    height: 60px;
    background: #fb6e87;
    float: left;
    padding: 15px;
    font-size: 22px;
    color: #FFF;
  }

  #nav-left{
    float:left;
    list-style: none;
    height:60px;
  }
  #nav-left li{
    float: left;
    height: 60px;
    padding-top: 30px;
    padding-left: 30px;
    padding-right: 30px;
    cursor:pointer;
  }
  #nav-left li:hover{
    background:#000;
  }

  nav a{
    color: rgb(207,211,219)!important;
  }

  #nav-left li:hover a{
    color: rgb(255,255,255)!important;
  }
  #nav-right{
    float:right;
  }
</style>
