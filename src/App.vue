<template>
  <div id="app">
<!--        <img alt="Vue logo" src="./assets/logo.png"> -->
<!--    <HelloWorld msg="Welcome to Your Vue.js + TypeScript App"/> -->
    <canvas id="renderCanvas" touch-action="none"></canvas>
    <sidebar-menu :menu="menu" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import HelloWorld from './components/HelloWorld.vue';

@Component({
  components: {
    HelloWorld,
  },
})
export default class App extends Vue {}
</script>

<style>
body{
  margin:0;
  padding:0;
  width: 100%;
  height: 100%;
  overflow:hidden;  
}
#app {
  margin:0;
  padding:0;
  width: 100%;
  height: 100%;
}
#renderCanvas {
  margin:0;
  padding:0;
  width: 100%;
  height: 100%;
}
</style>
