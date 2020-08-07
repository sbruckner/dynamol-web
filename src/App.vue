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
        v-model="model"
        :items="items"
        :loading="isLoading"
        :search-input.sync="search"
        hide-no-data
        hide-selected
        item-text="identifier"
        item-value="identifier"
        label="Public APIs"
        placeholder="Start typing to Search"
        prepend-icon="mdi-database-search"
        return-object
        solo 
        hide-details
        single-line
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
      descriptionLimit: 60,
      entries: [],
      isLoading: false,
      model: null,
      search: null,      
    }),
    created () {
//      this.$vuetify.theme.dark = true
        const url = "https://data.rcsb.org/rest/v1/holdings/current/entry_ids";
//        this.data.url = "test";

        // Lazily load input items
        fetch(url)
          .then(res => res.json())
          .then(res => {
            console.log(res);
            this.count = res;
            this.entries = res;
          })
          .catch(err => {
            console.log(err)
          });
    },
    computed: {
      fields () {
        if (!this.model)
          return [];

        return Object.keys(this.model).map(key => {
          return {
            key,
            value: this.model[key] || 'n/a',
          }
        });
      },
      items () {
        return this.entries;//this.entries.map(entry => {
          //const text = entry.identifier;

//          return entry;
  //      });
      },
    },
    methods: {
      onPDBIdChange(value) {
        console.log(value);
        const newUrl = "http://files.rcsb.org/download/"+value+".pdb";
        if (newUrl != this.data.url)
          this.data.url = newUrl;        
      }
    }
    /*
    watch: {
      search (val) {
        // Items have already been loaded
        if (this.items.length > 0)
          return;

        // Items have already been requested
        if (this.isLoading)
          return;

        this.isLoading = true;

        const query = {
          "query": {
            "type": "terminal",
            "service": "text",
            "parameters": {
              "attribute": "rcsb_id",
              "operator": "exact_match",
              "value": val
            }       
          },
          "return_type": "entry"
        };

        //const url = encodeURI('https://search.rcsb.org/rcsbsearch/v1/query?json='+JSON.stringify(query));
        const url = "https://data.rcsb.org/rest/v1/holdings/current/entry_ids";

        // Lazily load input items
        fetch(url)
          .then(res => res.json())
          .then(res => {
            console.log(res);
            this.count = res;
            this.entries = res;
          })
          .catch(err => {
            console.log(err)
          })
          .finally(() => (this.isLoading = false));
      },
    }   */ 
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