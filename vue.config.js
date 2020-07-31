// vue.config.js
module.exports = {
  transpileDependencies: [
    "vuetify"
  ],
  chainWebpack: config => {
    config.module
      .rule('shaders')
      .test(/\.(glsl|vs|fs)$/)
      .use('ts-shader-loader')
        .loader('ts-shader-loader')
        .end()
  },
  runtimeCompiler: true
}