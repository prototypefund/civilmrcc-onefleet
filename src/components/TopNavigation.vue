<template>
  <nav>
    <div style="display:flex;">
      <div id="brand">OneFleet</div>
      <div id="status-light">
        <el-tooltip placement="bottom" effect="light">
          <div slot="content">
            Last new GPS position ({{
              timeSince(status_light_data.last_new_position)
            }}
            ago): {{ status_light_data.last_new_position || 'never' }} <br />
            Last sync with server ({{
              timeSince(status_light_data.last_server_sync)
            }}
            ago):
            {{ status_light_data.last_server_sync || 'never' }} <br />
            <br />
            {{ positionLimitsText }}
          </div>
          <div :class="'circle ' + statusLightColor"></div>
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
          <span style="white-space:nowrap">
            <i class="fas fa-user"></i>
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
    position_limits: {
      // prop object defaults:
      tracks_oldest_date_iso: null,
      tracks_newest_date_iso: null,
      tracks_length_limit: -1,
    },
  },
  data: function() {
    return {
      show_timeControl: false,
      username: '',
      status_light_data: {
        last_server_sync: null,
        last_new_position: null,
        time_now: new Date(),
        intervalTimer: null,
      },
    };
  },
  computed: {
    positionLimitsText() {
      let newest_date = this.position_limits.tracks_newest_date_iso
        ? this.formatTimeForStatus(this.position_limits.tracks_newest_date_iso)
        : 'now';
      let oldest_date = this.position_limits.tracks_oldest_date_iso
        ? `between ${this.formatTimeForStatus(
            this.position_limits.tracks_oldest_date_iso
          )} and`
        : 'until';
      let num_positions = this.position_limits.tracks_length_limit;
      return `Showing the ${num_positions} most recent positions ${oldest_date} ${newest_date}.`;
    },
    statusLightColor() {
      // see CSS below for green, yellow, red, blue, grey:
      return this.$map.colorSince(
        this.status_light_data.last_server_sync,
        this.status_light_data.time_now
      );
    },
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
    timeSince(date) {
      return this.$map.timeSince(date, this.status_light_data.time_now);
    },
    formatTimeForStatus(date_iso) {
      // TODO: reformat date string depending on how far it is away from now
      return date_iso;
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

    serverBus.$on('last_sync_date', sync_date => {
      this.status_light_data.last_server_sync = sync_date
        ? new Date(sync_date)
        : null;
    });
    serverBus.$on('last_position_date', position_date => {
      this.status_light_data.last_new_position = position_date
        ? new Date(position_date)
        : null;
    });

    this.status_light_data.intervalTimer = setInterval(() => {
      this.status_light_data.time_now = new Date();
    }, 1000);
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

nav #status-light {
  display: flex;
  align-items: center;
  color: var(--white);
  cursor: pointer;
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

/* See https://morioh.com/p/651129a1cb72 for "traffic light" css effect */
.circle {
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 100%;
  position: relative;
  top: 1px;
  left: 0px;
  height: 10px;
  width: 10px;
  margin-right: 10px;
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
}

.circle.red {
  background-color: #c0392b;
  box-shadow: 0 0 10px 2.5px #c0392b;
}
.circle.yellow {
  background-color: #f1c40f;
  box-shadow: 0 0 10px 2.5px #f1c40f;
}
.circle.green {
  background-color: #2ecc71;
  box-shadow: 0 0 10px 2.5px #2ecc71;
}
.circle.blue {
  background-color: rgb(0, 134, 243);
  box-shadow: 0 0 10px 2.5px rgb(0, 134, 243);
}
.circle.grey {
  background-color: #999;
  box-shadow: 0 0 10px 2.5px #999;
}
</style>
<style>
.fas.fa-user {
  font-size: 26px;
  display: block;
  margin-left: 6px;
}
</style>
