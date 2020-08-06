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
                  <v-select label="Coloring" v-model="settings.coloring.value" item-text="text" item-value="value" :items="settings.coloring.items" />
                  <v-slider label="Sharpness" :min="settings.sharpness.min" :max="settings.sharpness.max" :step="settings.sharpness.step" v-model="settings.sharpness.value" />
                  <color-input label="Background" v-model="settings.backgroundColor.value" />
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
       <v-spacer />
      <v-autocomplete
        item-text="Description"
        item-value="API"
        label="Search PDB"
        placeholder="Start typing to Search"
        prepend-icon="mdi-database-search"
        return-object
        solo 
        hide-details single-line
      ></v-autocomplete>      

      <v-progress-linear
        :active="state.loading"
        :indeterminate="state.loading"
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
  import { Environment } from './Environment';
  
  export default {
    props: {
      source: String,
    },
    data: () => ({
      drawer: null,
      settings: Environment.settings,
      state : Environment.state
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