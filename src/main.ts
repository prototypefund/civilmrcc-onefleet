import Vue from 'vue';

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import lang from 'element-ui/lib/locale/lang/en';
import locale from 'element-ui/lib/locale';

import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import '@fortawesome/fontawesome-free/js/regular';

import '@datenpate/leaflet.polylinemeasure/Leaflet.PolylineMeasure.js';
import '@datenpate/leaflet.polylinemeasure/Leaflet.PolylineMeasure.css';

import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';

import VoerroTagsInput from '@voerro/vue-tagsinput';
import '@voerro/vue-tagsinput/dist/style.css';
Vue.component('tags-input', VoerroTagsInput);

import App from './App.vue';

import { DbWrapper } from './utils/dbWrapper';
import mapWrapper from './utils/mapWrapper';

export const serverBus = new Vue();
Vue.prototype.$db = new DbWrapper();
Vue.prototype.$db.setLoginCallback(function() {
  serverBus.$emit('show_login_screen');
});

Vue.prototype.$map = mapWrapper;

locale.use(lang); // configure language of ElementUI
Vue.use(ElementUI);

new Vue({
  render: h => h(App),
}).$mount('#app');
