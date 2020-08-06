import Vue from 'vue'
import App from './App.vue'
import { Viewer } from "./Viewer"
import vuetify from '@/plugins/vuetify'
import { Environment } from './Environment'

Vue.component('ColorInput', () => import('./components/ColorInput.vue') );


var vm = new Vue({
  vuetify,
  render: h => h(App),
  mounted() {
    var viewer = new Viewer(document.getElementById("canvas") as HTMLCanvasElement,Environment);
  }
}).$mount('#app');

 



