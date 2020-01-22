<template>
      <form @submit="startReplay" class="TimeControl form-style-6">
            <input type="datetime-local" placeholder="date from" :value="replayData.startDate">
            <input type="datetime-local" placeholder="date to" v-model="replayData.endDate">
            <input type="number" placeholder="hours per frame" style="width:40%" v-model="replayData.hoursPerFrame">
            <input type="number" placeholder="frame length in s" style="width:40%; float:right:" v-model="replayData.frameLength">
            <el-button type="success" icon="el-icon-video-play" circle @click="startReplay"></el-button>
      </form>
</template>

<script>
import * as moment from 'moment';

import { serverBus } from '../main';
import config from '../../config/config.js';
export default {
  name: 'TimeControl',
  data: function() {
    return {
      replayData:{
          startDate:moment().subtract(1, 'days').format('YYYY-MM-DTHH:MM'),
          endDate:moment().format('YYYY-MM-DTHH:MM'),
          hoursPerFrame:4,
          frameLength:10
      }
    };
  },
  methods: {
    startReplay: function() {

      serverBus.$emit('start_replay', this.replayData);
    }
  },
  mounted: function() {

  },
};
</script>
<style scoped>
.TimeControl{
    width: 400px;
    position: absolute;
    z-index: 999;
    left: 50%;
    margin-left: -200px;
    margin-top: 60px;
}
</style>
