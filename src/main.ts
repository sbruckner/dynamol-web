import Vue from 'vue'
import App from './App.vue'
import { Viewer } from "./Viewer"
import vuetify from '@/plugins/vuetify' // path to vuetify export
import { Settings } from './Settings'

Vue.component('AppColorPicker', () => import('./components/AppColorPicker.vue') );


var vm = new Vue({
  vuetify,
  render: h => h(App),
  mounted() {
    var viewer = new Viewer(document.getElementById("canvas") as HTMLCanvasElement,Settings);
  }
}).$mount('#app');

 



