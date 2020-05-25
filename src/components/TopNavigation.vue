<template>
  <nav>
    <div style="display:flex;">
      <div id="brand">OneFleet</div>
      <ul class="nav-actions">
        <li v-on:click="openModal('createItem')">
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
      <li :class="{ active: modus == 'map' }" v-on:click="changeModus('map')">
        <a>
          <i class="fas fa-map-marked"></i>
          <span>Map</span>
        </a>
      </li>
      <li
        :class="{ active: modus == 'cases' }"
        v-on:click="changeModus('cases')"
      >
        <a>
          <i class="fas fa-list-alt"></i>
          <span>List</span>
        </a>
      </li>
    </ul>
    <ul id="nav-right">
      <li v-on:click="toggleAir()">
        <a>
          <i class="fas fa-plane"></i>
          <span>Air</span>
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
          <el-dropdown-item v-on:click="openModal('settings')">
            <a v-on:click="openModal('settings')">Settings</a>
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
    modus: {
      type: String,
      default: 'cases',
    },
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
</style>
<style>
.fas.fa-user {
  font-size: 26px;
  display: block;
  margin-left: 6px;
}
</style>
