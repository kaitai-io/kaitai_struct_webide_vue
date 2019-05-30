import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';
import 'fudgedit/dist/fudgeapps.js';
import 'localforage';
// import 'fudgedit/dist/types/components.d.ts';

Vue.config.productionTip = false;

Vue.config.ignoredElements = [/fudge-\w*/];

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
