<template>
				<v-text-field v-bind:label="$props.label" v-model="colorText" readonly hide-details class="ma-0 pa-0">
					<template v-slot:append>
						<v-menu v-model="menu" top nudge-bottom="110" nudge-left="21" :close-on-content-click="false">
							<template v-slot:activator="{ on }">
								<div :style="swatchStyle" v-on="on" />
							</template>
							<v-card>
								<v-card-text class="pa-0">
									<v-color-picker v-model="color" flat />
								</v-card-text>
							</v-card>
						</v-menu>
					</template>
				</v-text-field>
</template>

<script>
export default {
  name: "AppColorPicker",
  props: ['value','label'],

	data: () => ({
    color: {r:255,g:255,b:255,a:255},
		menu: false,
  }),
  methods: {
    updateColor() {
      var col = this.color;
      this.$emit('input', col);
    }
  },
  watch: {
    color: function( newColor ) {
        this.color = newColor;
        this.$emit('input', newColor );
    }
  },
  computed: {
    colorText() {
      var r = this.color.r;
      var g = this.color.g;
      var b = this.color.b;
      var a = this.color.a;
      return 'rgba('+r.toString()+','+g.toString()+','+b.toString()+','+a.toString()+')';      
    },
    swatchStyle() {
      const { color, menu } = this
      return {
        backgroundColor: this.colorText,
        cursor: 'pointer',
        height: '20px',
        width: '20px',
        borderRadius: '50%',
        //borderRadius: menu ? '50%' : '4px',
        //transition: 'border-radius 200ms ease-in-out;'
      }
    }
  }
};
</script>