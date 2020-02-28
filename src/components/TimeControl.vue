<template>
      <div>
        <div v-if="showReplayMode" class="timeControl replay">
          <p>Replay ongoing</p>
          <div>
            {{startDate}} - 
            {{endDate}}
          </div>
        </div>
        <form @submit="startReplay" class="timeControl form-style-6" v-if="!showReplayMode">
              <input type="datetime-local" placeholder="date from" v-model="replayData.startDate">
              <input type="datetime-local" placeholder="date to" v-model="replayData.endDate">
              <input type="number" placeholder="minutes per frame" style="width:40%" v-model="replayData.minutesPerFrame">
              <input type="number" placeholder="frame length in s" style="width:40%; float:right:" v-model="replayData.frameLength">
              <el-button type="success" icon="el-icon-video-play" circle @click="startReplay"></el-button>
        </form>
      </div>
</template>

<script>
import * as moment from 'moment';

import { serverBus } from '../main';
import config from '../../config/config.js';
let staticStartDate = moment().subtract(1, 'days').format('YYYY-MM-DTHH:MM');
export default {
  name: 'TimeControl',
  data: function() {
    return {
      replayData:{
          startDate:staticStartDate,
          endDate:moment().format('YYYY-MM-DTHH:MM'),
          minutesPerFrame:15,
          frameLength:10
      },
      showReplayMode:false,
      startDate:0,
      endDate:0
    };
  },
  methods: {
    startReplay: function() {

      serverBus.$emit('start_replay', this.replayData);
    }
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

  }
};
</script>
<style scoped>
.timeControl{
    background:#FFF;
    width: 400px;
    position: absolute;
    z-index: 999;
    left: 50%;
    margin-left: -200px;
    margin-top: 60px;
}

.timeControl.replay{
  padding:5px;
}
</style>
