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
                  <color-input label="Background" v-model="settings.backgroundColor.value" />
                  <v-select label="Coloring" v-model="settings.coloring.value" item-text="text" item-value="value" :items="settings.coloring.items" />
                  <v-slider label="Sharpness" :min="settings.sharpness.min" :max="settings.sharpness.max" :step="settings.sharpness.step" v-model="settings.sharpness.value" />
                  <v-switch label="Ambient Occlusion" v-model="settings.ambientOcclusion.value" />
                  <v-switch label="Depth of Field" v-model="settings.depthOfField.value" />
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
      <v-toolbar-title>dynamol-web</v-toolbar-title>
       <v-spacer />
      <v-autocomplete
        v-model="pdbModel"
        :items="pdbItems"
        :loading="pdbLoading"
        hide-no-data
        hide-selected
        label="PDB ID"
        placeholder="Start typing to search for matching PDB IDs"
        prepend-icon="mdi-database-search"
        return-object
        cache-items
        solo 
        hide-details
        single-line
        spellcheck="false"
        @change="onPDBIdChange"
      ></v-autocomplete>     

      <v-progress-linear
        :active="data.loading"
        :indeterminate="data.loading"
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
      data : Environment.data,
      pdbModel: null,
      pdbItems: [],
      pdbLoading : false
    }),
    created () {
        const url = "https://data.rcsb.org/rest/v1/holdings/current/entry_ids";
        let self = this;
        self.pdbLoading = true;

        fetch(url)
          .then(res => res.json())
          .then(res => {
            console.log(res);
            self.pdbItems = res;
          })
          .catch(err => {
            console.log(err)
          })
          .finally(() => (self.pdbLoading = false));
    },
    methods: {
      onPDBIdChange(value) {
        console.log(value);
        const newUrl = "http://files.rcsb.org/download/"+value+".pdb";
        if (newUrl != this.data.url)
          this.data.url = newUrl;        
      }
    }
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