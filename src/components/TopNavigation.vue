<template>
   <nav>
      <ul id="nav-left">
        <li v-on:click="changeModus('map')">Map</li>
        <li v-on:click="changeModus('cases')">Cases</li>
        <li v-on:click="changeModus('createItem')">Create New Case</li>
      </ul>
      <ul id="nav-right">
        <li class="dropdown">
          Username
          <ul v-if="false">
            <li>Userinfo</li>
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
  #nav-left{
    float:left;
    list-style: none;
  }
  #nav-left li{
    float:left;
    margin-left:10px;
  }
  #nav-right{
    float:right;
  }
</style>
