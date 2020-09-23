<template>
  <nav>
    <div style="display:flex;">
      <div id="brand">OneFleet</div>
      <div class="container">
        <el-tooltip
          content="last sync with server: xx minutes ago"
          placement="bottom"
          effect="light"
        >
          <div class="circle green" alt="vfds" tooltip="vfds"></div>
        </el-tooltip>
      </div>
      <ul class="nav-actions">
        <li v-on:click="createItem()">
          <a>
            <i class="fas fa-plus-circle"></i>
            <span>Add</span>
          </a>
        </li>
        <li v-on:click="show_timeControl = !show_timeControl">
          <a>
            <i class="fas fa-play"></i>
            <span>Replay</span>
          </a>
        </li>
      </ul>
    </div>
    <ul id="nav-views">
      <li
        :class="{ active: main_view == 'map' }"
        v-on:click="changeModus('map')"
      >
        <a>
          <i class="fas fa-map-marked"></i>
          <span>Map</span>
        </a>
      </li>
      <li
        :class="{ active: main_view == 'list' }"
        v-on:click="changeModus('list')"
      >
        <a>
          <i class="fas fa-list-alt"></i>
          <span>List</span>
        </a>
      </li>
    </ul>
    <ul id="nav-right">
      <li :class="{ active: showing_air }" v-on:click="toggleAir()">
        <a>
          <i class="fas fa-plane"></i>
          <span>Air</span>
        </a>
      </li>
      <li :class="{ active: showing_log }" v-on:click="toggleLog()">
        <a>
          <i class="fas fa-list"></i>
          <span>Log</span>
        </a>
      </li>
      <el-dropdown>
        <span class="el-dropdown-link">
          <i class="fas fa-user"></i>
          <span>
            {{ username }}
            <i class="el-icon-arrow-down el-icon--left"></i>
          </span>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-on:click="openSettings()">
            <a v-on:click="openSettings()">Settings</a>
          </el-dropdown-item>
          <el-dropdown-item v-on:click="logout()">
            <a v-on:click="logout()">Logout</a>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </ul>
    <TimeControl v-if="show_timeControl"></TimeControl>
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
  props: {
    main_view: { type: String, default: 'list' },
    showing_air: { type: Boolean, default: false },
    showing_log: { type: Boolean, default: false },
  },
  data: function() {
    return {
      show_timeControl: false,
      username: '',
      password: '',
    };
  },
  methods: {
    changeModus(value) {
      // Using the service bus
      serverBus.$emit('main_view', value);
    },
    createItem() {
      serverBus.$emit('create_item');
    },
    openSettings() {
      serverBus.$emit('show_settings');
    },
    toggleAir() {
      if (!this.showing_air) serverBus.$emit('show_air');
      else serverBus.$emit('close_modal');
    },
    toggleLog() {
      if (!this.showing_log) serverBus.$emit('show_log');
      else serverBus.$emit('close_modal');
    },
    logout() {
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
  position: fixed;
  display: flex;
  align-items: center;
  top: 0;
  right: 0;
  left: 0;
  z-index: 999;
  justify-content: space-between;
  min-height: var(--app-top);
  background: var(--primary-darker);
}

nav #brand {
  display: flex;
  align-items: center;
  color: var(--white);
  padding: 0 1em;
}

nav li {
  float: left;
  cursor: pointer;
  opacity: 0.75;
  margin: 0 0.25em;
  border-radius: var(--border-radius);
}
nav li:hover,
nav li.active {
  opacity: 1;
  background: rgba(255, 255, 255, 0.25);
}
nav li a {
  text-align: center;
  display: flex;
  font-size: 14px;
  align-items: center;
  padding: 0.25em 0.5em;
  color: var(--white);
}

nav li a .svg-inline--fa {
  margin-right: 0.5em;
}

nav li:hover a {
  color: var(--white);
}
#nav-right {
  display: flex;
  justify-self: flex-end;
  align-items: center;
}

.el-dropdown {
  color: var(--white);
  margin: 0 0.5em;
}

.el-dropdown {
  font-size: 14px;
  color: var(--white);
}
.el-dropdown-link {
  display: flex;
  align-items: center;
}

.el-dropdown-link .svg-inline--fa {
  margin-right: 0.5em;
}
.el-dropdown-link span {
  display: block;
}

.circle {
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 100%;
  position: relative;
  top: 9px;
  left: -5px;
  height: 10px;
  width: 10px;
}

.circle::after {
  border-right: 3px solid rgba(255, 255, 255, 0.5);
  border-radius: 100%;
  content: ' ';
  position: absolute;
  top: 1px;
  left: -1px;
  width: 7.5px;
  height: 7.5px;
  cursor: help;
}

.circle.red {
  background-color: #c0392b;
  box-shadow: 0 0 20px 5px #c0392b;
}

.circle.yellow {
  background-color: #f1c40f;
  box-shadow: 0 0 10px 2.5px #f1c40f;
}

.circle.green {
  background-color: #2ecc71;
  box-shadow: 0 0 10px 2.5px #2ecc71;
}
</style>
<style>
.fas.fa-user {
  font-size: 26px;
  display: block;
  margin-left: 6px;
}
</style>
