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
                <v-item-group>
                  <v-select label="Coloring" v-model="state.coloring.value" item-text="text" item-value="value" :items="state.coloring.items" />
                  <v-slider label="Sharpness" :min="state.sharpness.min" :max="state.sharpness.max" :step="state.sharpness.step" v-model="state.sharpness.value" />
                  <AppColorPicker label="Background" v-model="state.backgroundColor.value"></AppColorPicker>
<!--                  <label>
                  Background Color
                  <input name="backgroundColor" type="color" v-model="state.backgroundColor.value" />
                  </label>
-->
<!--
                  <v-menu offset-y>
                    <template v-slot:activator="{ on }">
                      <v-btn :color="state.backgroundColor.value.toString()" dark v-on="on">
                        Event Color
                      </v-btn>
                    </template>
                    <v-color-picker v-model="state.backgroundColor.value" />
                  </v-menu>
-->


                </v-item-group>
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
      
      <v-progress-linear
        :active="true"
        :indeterminate="true"
        absolute
        bottom
        color="deep-purple accent-4"
      ></v-progress-linear>

    </v-app-bar>

    <canvas app id="canvas" touch-action="none"></canvas>

    <v-footer app>
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>

<script lang="ts">
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
//      this.$vuetify.theme.dark = true
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