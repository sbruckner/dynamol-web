import Vue from 'vue'
import App from './App.vue'
import { Viewer } from "./Viewer"
import vuetify from '@/plugins/vuetify' // path to vuetify export

new Vue({
  vuetify,
  render: h => h(App),
}).$mount('#app')

const viewer = new Viewer(document.getElementById("canvas") as HTMLCanvasElement);

