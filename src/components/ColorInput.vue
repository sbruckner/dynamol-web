<template>
				<v-text-field v-bind:label="$props.label" readonly v-model="hexColor" hide-details class="ma-0 pa-0">
					<template v-slot:append>
						<v-menu v-model="menu" top nudge-bottom="110" nudge-left="21" :close-on-content-click="false">
							<template v-slot:activator="{ on }">
								<div :style="swatchStyle" v-on="on" />
							</template>
							<v-card>
								<v-card-text class="pa-0">
									<v-color-picker v-model="color" @input="updateColor"/>
								</v-card-text>
							</v-card>
						</v-menu>
					</template>
				</v-text-field>
</template>

<script>
export default {
  name: "ColorInput",
  props: ['value','label'],
	data() {
    return {
      color: this.value,
      menu: false
    }
  },
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
    hexColor() {
      var r = Math.max(0,Math.min(this.color.r,255)).toString(16);
      var g = Math.max(0,Math.min(this.color.g,255)).toString(16);
      var b = Math.max(0,Math.min(this.color.b,255)).toString(16);
      var a = Math.round(Math.max(0,Math.min(this.color.a*255,255))).toString(16);

      if (r.length == 1)
        r = "0" + r;
      if (g.length == 1)
        g = "0" + g;
      if (b.length == 1)
        b = "0" + b;
      if (a.length == 1)
        a = "0" + a;

      return "#" + r + g + b + a;
    },
    swatchStyle() {
      var bg = this.hexColor;
      return {
        backgroundColor: bg,
        cursor: 'pointer',
        height: '20px',
        width: '20px',
        borderRadius: '50%'
        //borderRadius: menu ? '50%' : '4px',
        //transition: 'border-radius 200ms ease-in-out;'
      }
    }
  }
};
</script>