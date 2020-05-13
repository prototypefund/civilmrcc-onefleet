<template>
  <div class="background" v-on:click.self="closeModal">
    <div class="form-style-6">
      <h1>Login</h1>
      <form @submit="login">
        <span>Username</span>
        <input type="text" placeholder="username" v-model="username" />

        <span>Password</span>
        <input type="password" placeholder="password" v-model="password" />

        <span @click="showSettings = !showSettings" id="settingsToggle"
          ><i class="fas fa-cog" v-bind:class="{ active: showSettings }"></i
        ></span>
        <div v-show="showSettings == true">
          <input
            type="text"
            placeholder="database url"
            v-model="db_remote_host"
          /><br />
          <input
            type="text"
            placeholder="database port"
            v-model="db_remote_port"
          /><br />
        </div>
        <input type="submit" value="Send" />
      </form>
    </div>
  </div>
</template>

<script>
import { serverBus } from '../main';
import config from '../../config/config.js';
export default {
  name: 'Login',

  data: function() {
    return {
      username: '',
      password: '',
      db_remote_host: '',
      db_remote_port: '',
      showSettings: false,
    };
  },
  methods: {
    closeModal: function() {
      // Using the service bus
      serverBus.$emit('modal_modus', '');
    },
    login: function() {
      localStorage.username = this.username;
      localStorage.password = this.password;
      localStorage.db_remote_host = this.db_remote_host;
      localStorage.db_remote_port = this.db_remote_port;
      window.location.reload();
    },
  },
  mounted: function() {
    this.$data.db_remote_host =
      config.db_remote_host || localStorage.db_remote_host;
    this.$data.db_remote_port =
      localStorage.db_remote_port || config.db_remote_port;
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#settingsToggle {
  margin-bottom: 15px;
  float: right;
}
.fas.fa-cog {
  color: #c9c9c9;
  font-size: 22px;
}
.fas.fa-cog.active {
  color: #212529;
}
</style>
