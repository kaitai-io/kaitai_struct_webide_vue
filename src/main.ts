import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';
import 'fudgedit/dist/fudgeapps.js';
import 'localforage';

Vue.config.productionTip = false;

Vue.config.ignoredElements = [/fudge-\w*/];

(window as any).MonacoEnvironment = {
  getWorkerUrl: function (moduleId: string, label: string) {
      if (label === 'json') {
          return './json.worker.js';
      }
      if (label === 'css') {
          return './css.worker.js';
      }
      if (label === 'html') {
          return './html.worker.js';
      }
      if (label === 'typescript' || label === 'javascript') {
          return './typescript.worker.js';
      }
      return './editor.worker.js';
  }
};

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
