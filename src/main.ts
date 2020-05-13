import Vue from 'vue';

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import '@fortawesome/fontawesome-free/js/regular';

import '@datenpate/leaflet.polylinemeasure/Leaflet.PolylineMeasure.js';
import '@datenpate/leaflet.polylinemeasure/Leaflet.PolylineMeasure.css';

import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';

import App from './App.vue';

import { DbWrapper } from './utils/dbWrapper';
import mapWrapper from './utils/mapWrapper';

export const serverBus = new Vue();
Vue.prototype.$db = new DbWrapper();
Vue.prototype.$db.setLoginCallback(function() {
  serverBus.$emit('modal_modus', 'login');
});

Vue.prototype.$map = mapWrapper;

Vue.use(ElementUI);

new Vue({
  render: h => h(App),
}).$mount('#app');