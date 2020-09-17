<template>
  <v-app id="inspire">
    <v-navigation-drawer
      v-model="drawer"
      app
      clipped
    >
      <v-list>

        <v-list-group value="true" dense>

            <template v-slot:activator>
              <v-list-item-title>General</v-list-item-title>
            </template>
            
            <v-list-item>
              <v-list-item-content>
                <v-container>
                  <v-slider label="Sharpness" :min="settings.sharpness.min" :max="settings.sharpness.max" :step="settings.sharpness.step" v-model="settings.sharpness.value" />
                  <v-slider label="Dist. Blending" :min="settings.distanceBlending.min" :max="settings.distanceBlending.max" :step="settings.distanceBlending.step" v-model="settings.distanceBlending.value" />
                  <v-slider label="Dist. Scale" :min="settings.distanceScale.min" :max="settings.distanceScale.max" :step="settings.distanceScale.step" v-model="settings.distanceScale.value" />
                  <v-select label="Coloring" v-model="settings.coloring.value" item-text="text" item-value="value" :items="settings.coloring.items" />
                  <v-switch label="Ambient Occlusion" v-model="settings.ambientOcclusion.value" />
                  <v-switch label="Depth of Field" v-model="settings.depthOfField.value" />
                  <v-switch label="Material Mapping" v-model="settings.materialMapping.value"/>
                  <v-switch label="Normal Mapping" v-model="settings.normalMapping.value"/>
                  <v-switch label="Environment Mapping" v-model="settings.environmentMapping.value"/>
                  <v-switch label="Environment Lighting" v-model="settings.environmentLighting.value" :disabled="!settings.environmentMapping.value"/>

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


                </v-container>
              </v-list-item-content>
            </v-list-item>
        </v-list-group>

        <v-list-group value="true" dense>

            <template v-slot:activator>
              <v-list-item-title>Lighting</v-list-item-title>
            </template>
            
            <v-list-item>
              <v-list-item-content>
                <v-container>
                  <color-input label="Background" v-model="settings.backgroundColor.value" />
                  <color-input label="Ambient" v-model="settings.ambientMaterial.value" />
                  <color-input label="Diffuse" v-model="settings.diffuseMaterial.value" />
                  <color-input label="Specular" v-model="settings.specularMaterial.value" />
                  <v-slider label="Shininess" :min="settings.shininess.min" :max="settings.shininess.max" :step="settings.shininess.step" v-model="settings.shininess.value" />
                </v-container>
              </v-list-item-content>
            </v-list-item>
        </v-list-group>

        <v-list-group value="true" dense :hidden="!settings.depthOfField.value">

            <template v-slot:activator>
              <v-list-item-title>Depth of Field</v-list-item-title>
            </template>
            
            <v-list-item>
              <v-list-item-content>
                <v-container>
                  <v-slider label="Focal Distance" :min="settings.focalDistance.min" :max="settings.focalDistance.max" :step="settings.focalDistance.step" v-model="settings.focalDistance.value" />
                  <v-slider label="F-Stop" :min="settings.fStop.min" :max="settings.fStop.max" :step="settings.fStop.step" v-model="settings.fStop.value" />                  
                </v-container>
              </v-list-item-content>
            </v-list-item>
        </v-list-group>

        <v-list-group value="true" dense :hidden="!settings.materialMapping.value">
            <template v-slot:activator>
              <v-list-item-title>Material Map</v-list-item-title>
            </template>           
            <v-list-item>
              <v-list-item-content>
                  <vue-select-image :dataImages="settings.materialMap.items" :selectedImages="[settings.materialMap.value]" @onselectimage="onSelectMaterialMap" />
              </v-list-item-content>
            </v-list-item>
        </v-list-group>

        <v-list-group value="true" dense :hidden="!settings.normalMapping.value">
            <template v-slot:activator>
              <v-list-item-title>Normal Map</v-list-item-title>
            </template>           
            <v-list-item>
              <v-list-item-content>
                  <vue-select-image :dataImages="settings.normalMap.items" :selectedImages="[settings.normalMap.value]" @onselectimage="onSelectNormalMap" />
              </v-list-item-content>
            </v-list-item>
        </v-list-group>

        <v-list-group value="true" dense :hidden="!settings.environmentMapping.value">
            <template v-slot:activator>
              <v-list-item-title>Environment Map</v-list-item-title>
            </template>           
            <v-list-item>
              <v-list-item-content>
                  <vue-select-image :dataImages="settings.environmentMap.items" :selectedImages="[settings.environmentMap.value]" @onselectimage="onSelectEnvironmentMap" />
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

        this.data.url = "http://files.rcsb.org/download/6LU7.pdb";
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
      },
      onSelectEnvironmentMap(value) {
        this.settings.environmentMap.value = value;
      },
      onSelectMaterialMap(value) {
        this.settings.materialMap.value = value;
      },
      onSelectNormalMap(value) {
        this.settings.normalMap.value = value;
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