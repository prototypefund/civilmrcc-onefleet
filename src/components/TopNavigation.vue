<template>
  <nav>
    <div id="brand">
      OneFleet
    </div>
    <ul id="nav-left">
      <li v-on:click="openModal('createItem')">
        <a>
          <i class="fas fa-plus-circle"></i>
          <span>
            Add
          </span>
        </a>
      </li>
      <li v-on:click="changeModus('map')">
        <a>
          <i class="fas fa-map-marked"></i>
          <span>
            Map
          </span>
        </a>
      </li>
      <li v-on:click="changeModus('cases')">
        <a>
          <i class="fas fa-list-alt"></i>
          <span>
            List
          </span>
        </a>
      </li>
      <li v-on:click="show_timeControl = !show_timeControl">
        <a>
          <i class="fas fa-play"></i>
          <span>
            Replay
          </span>
        </a>
      </li>
    </ul>
    <TimeControl v-if="show_timeControl"></TimeControl>
    <ul id="nav-right">
      <li v-on:click="toggleAir()">
        <a>
          <i class="fas fa-plane"></i>
          <span>
            Air
          </span>
        </a>
      </li>
      <el-dropdown>
        <span class="el-dropdown-link">
          <i class="fas fa-user"></i>
          <span>
            {{ username }}<i class="el-icon-arrow-down el-icon--left"></i>
          </span>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-on:click="openModal('settings')"
            ><a v-on:click="openModal('settings')"
              >Settings</a
            ></el-dropdown-item
          >
          <el-dropdown-item v-on:click="logout()"
            ><a v-on:click="logout()">Logout</a></el-dropdown-item
          >
        </el-dropdown-menu>
      </el-dropdown>
    </ul>
  </nav>
</template>

<script>
import TimeControl from './TimeControl';
import { serverBus } from '../main';
export default {
  name: 'TopNavigation',
  components: {
    TimeControl,
  },
  data: function() {
    return {
      show_air: false,
      show_timeControl: false,
      username: '',
      password: '',
    };
  },
  methods: {
    changeModus: function(value) {
      // Using the service bus
      serverBus.$emit('app_modus', value);
    },
    openModal: function(value) {
      // Using the service bus
      serverBus.$emit('modal_modus', value);
    },
    toggleAir: function() {
      this.$data.show_air = !this.$data.show_air;
      serverBus.$emit('show_air', this.$data.show_air);
    },
    logout: function() {
      localStorage.clear();
      window.location.reload();
    },
  },
  created: function() {
    this.username = localStorage.username || 'guest';
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
nav {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 60px;
  background: rgb(55, 60, 68);
}

nav #brand {
  height: 60px;
  background: #fb6e87;
  float: left;
  padding: 15px;
  font-size: 22px;
  color: #fff;
}

#nav-left {
  float: left;
  list-style: none;
  height: 60px;
}
nav li {
  float: left;
  height: 60px;
  padding-top: 8px;
  padding-left: 20px;
  padding-right: 20px;
  cursor: pointer;
}
nav li:hover {
  background: #000;
}
nav li a {
  text-align: center;
  font-size: 22px;
}
nav li a span {
  display: block;
  margin-top: -5px;
  font-size: 12px;
}

nav li a i {
  font-size: 26px;
}

nav a {
  color: rgb(207, 211, 219) !important;
}

nav li:hover a {
  color: rgb(255, 255, 255) !important;
}
#nav-right {
  float: right;
}

.el-dropdown {
  margin-top: 29px;
  margin-right: 15px;
  font-size: 17px;
  color: rgb(207, 211, 219) !important;
}

.fas.fa-user.el-dropdown-selfdefine {
  font-size: 26px;
  margin-left: 6px;
}

.el-dropdown {
  margin-top: 18px;
  margin-right: 15px;
  font-size: 17px;
  color: rgb(207, 211, 219) !important;
}
.el-dropdown-link {
  display: block;
  margin-top: -2px;
  font-size: 12px;
}

.el-dropdown-link .fa-user {
  font-size: 17px;
  margin-left: 12px;
}
.el-dropdown-link span {
  display: block;
}
</style>
<style>
.fas.fa-user {
  font-size: 26px;
  display: block;
  margin-left: 6px;
}
</style>
