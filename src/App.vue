<template>
  <div id="app">
<!--        <img alt="Vue logo" src="./assets/logo.png"> -->
<!--    <HelloWorld msg="Welcome to Your Vue.js + TypeScript App"/> -->
    <canvas id="canvas" touch-action="none"></canvas>
    <sidebar-menu :menu="menu" />
  </div>
</template>

<script lang="ts">

import { Component, Vue } from 'vue-property-decorator';
import HelloWorld from './components/HelloWorld.vue';

export default {
  name: 'App',
  data () {
    return {
      menu: [
        {
          header: true,
          title: 'Getting Started',
          hiddenOnCollapse: true
        },
        {
          href: '/',
          title: 'Installation',
          icon: 'fa fa-download'
        },
        {
          href: '/basic-usage',
          title: 'Basic Usage',
          icon: 'fa fa-code'
        },
        {
          header: true,
          title: 'Usage',
          hiddenOnCollapse: true
        },
        {
          href: '/props',
          title: 'Props',
          icon: 'fa fa-cogs'
        }
      ]
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,600');

body {
  font-family: 'Source Sans Pro', sans-serif;
  font-size: 18px;
  background-color: #f2f4f7;
  color: #262626;
}

body, #app, #canvas {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  display:block;
  overflow: hidden;
}

.sidebar-overlay {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-color: #000;
  opacity: 0.5;
  z-index: 900;
}

</style>
