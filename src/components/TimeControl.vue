<template>
  <div class="timeControl">
    <div v-if="showReplayMode" class="replay">
      <p>
        <span class="opacity:0.5;">Replay ongoing:</span>
        From:
        <strong>{{ startDate }}</strong> – To:
        <strong>{{ endDate }}</strong>
      </p>
    </div>
    <div class="container">
      <form @submit="startReplay" v-if="!showReplayMode">
        <div>
          <label for="date_from">From:</label>
          <el-input
            type="datetime-local"
            id="date_from"
            placeholder="date from"
            v-model="replayData.startDate"
          />
        </div>
        <div>
          <label for="date_to">To:</label>
          <el-input
            type="datetime-local"
            id="date_to"
            placeholder="date to"
            v-model="replayData.endDate"
          />
        </div>
        <div>
          <label for="hours_per_frame">H per frame</label>
          <el-input
            style="width:80px;"
            id="hours_per_frame"
            type="number"
            min="1"
            placeholder="hours per frame"
            v-model="replayData.hoursPerFrame"
          />
        </div>
        <div>
          <label for="frame_length">Frames per s</label>
          <el-input
            style="width:80px;"
            type="number"
            id="frame_length"
            min="1"
            placeholder="frame length in s"
            v-model="replayData.frameLength"
          />
        </div>
        <el-button type="primary" circle @click="startReplay">
          <i class="fas fa-play" style="margin:0px;"></i>
        </el-button>
      </form>
    </div>
  </div>
</template>

<script>
import * as moment from 'moment';
import { serverBus } from '../main';

let staticStartDate = moment()
  .subtract(1, 'days')
  .format('YYYY-MM-DTHH:MM');
export default {
  name: 'TimeControl',
  data: function() {
    return {
      replayData: {
        startDate: staticStartDate,
        endDate: moment().format('YYYY-MM-DTHH:MM'),
        hoursPerFrame: 1,
        frameLength: 3,
      },
      showReplayMode: false,
      startDate: 0,
      endDate: 0,
    };
  },
  methods: {
    startReplay: function() {
      serverBus.$emit('start_replay', this.replayData);
    },
  },
  mounted: function() {
    let self = this;

    serverBus.$on('replay_started', () => {
      self.showReplayMode = true;
      self.startdate = localStorage.settings_track_startdate;
      self.enddate = localStorage.settings_track_enddate;
    });

    serverBus.$on('replay_next_tick', () => {
      console.log('localStorage.settings_track_enddate');
      console.log(localStorage.settings_track_enddate);
      self.endDate = localStorage.settings_track_enddate;
    });

    serverBus.$on('replay_finished', () => {
      self.showReplayMode = false;
    });
  },
};
</script>
<style scoped>
.el-button--primary {
  background-color: var(--primary);
  border-color: var(--primary);
}
.timeControl {
  top: var(--app-top);
  right: 0;
  width: calc(100% - var(--app-left-siderbar));
  position: fixed;
  z-index: 9999;
  display: flex;
  justify-content: center;
  background: var(--primary-lighter);
  border-bottom: 1px solid var(--primary-light);
  font-size: 11px;
}

.timeControl .container {
  padding: 1em;
}

.timeControl form {
  display: flex;
  align-items: center;
}

.timeControl form > div {
  margin-right: 2em;
}
.timeControl form > div label {
  display: block;
  margin-bottom: 0.25em;
  color: var(--dark-gray);
  font-family: var(--font-family-monospace);
}
.replay {
  width: 100%;
  text-align: center;
  font-size: 14px;
}
</style>
