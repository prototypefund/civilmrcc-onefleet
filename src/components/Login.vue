<template>
   
   <div class="background" v-on:click.self="closeModal">

        <div class="form-style-6">
            <h1>Login</h1>
            <form @submit="login">
              <span>Username</span>
              <input type="text" placeholder="username" v-model="username">

              <span>Password</span>
              <input type="password" placeholder="password" v-model="password">
              
              <input type="submit" value="Send" />
            </form>
        </div>
   </div>
</template>

<script>

import { serverBus } from '../main';
export default {
  name: 'LeftNavigation',

  data: function () {
    return {
      username: '',
      password:''
    }
  },
  methods:{
    closeModal: function () {
     // Using the service bus
     serverBus.$emit('modal_modus', '');
    },
    login: function(){
      localStorage.username = this.username;
      localStorage.password = this.password;
      window.location.reload();
    }

  },
  mounted: function() {
    var self = this;
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.background{
  position:fixed;
  top:0;
  right:0;
  bottom:0;
  left:0;
  background:rgba(0,0,0,0.8);
  z-index: 9999;
}
</style>
