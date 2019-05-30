const stencil = require('@stencil/webpack');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

module.exports = {
  configureWebpack: {
    plugins: [
      new stencil.StencilPlugin(),
      new MonacoWebpackPlugin({
        languages: ['javascript']
      })
    ],
  }
}