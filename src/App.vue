<template>
  <v-app id="inspire">
    <v-navigation-drawer
      v-model="drawer"
      app
      clipped
    >
      <v-list>

        <v-list-group prepend-icon="mdi-cog" value="true" dense>

            <template v-slot:activator>
              <v-list-item-title>Settings</v-list-item-title>
            </template>
            
            <v-list-item>
              <v-list-item-content>
                  <v-slider label="Sharpness" thumb-label="true" min="0.5" max="16.0" step="0.1" v-model="state.sharpness" />
              </v-list-item-content>
            </v-list-item>

            <v-list-item>
              <v-list-item-content>
                  <v-select label="Coloring" v-model="state.coloring.value" item-text="text" item-value="value" :items="state.coloring.items" />
              </v-list-item-content>
            </v-list-item>

        </v-list-group>

      </v-list>
    </v-navigation-drawer>

    <v-app-bar
      app
      clipped-left
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Application</v-toolbar-title>
    </v-app-bar>

    <canvas app id="canvas" touch-action="none"></canvas>

    <v-footer app>
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>

<script>
  import { Settings } from "./Settings";

  export default {
    props: {
      source: String,
    },
    data: () => ({
      drawer: null,
      state: Settings.state
    }),
    created () {
      this.$vuetify.theme.dark = true
    },
  }
</script>

<style>

#canvas {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  display:block;
}

</style>