import Vue from 'vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import App from './App.vue'

import dbWrapper from './utils/dbWrapper'
import mapWrapper from './utils/mapWrapper'

export const serverBus = new Vue();
Vue.prototype.$db = dbWrapper;
Vue.prototype.$map = mapWrapper;

Vue.use(ElementUI);

new Vue({
  render: h => h(App)
}).$mount('#app')

