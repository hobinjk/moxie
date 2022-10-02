const esbuild = require('esbuild')
const copyStaticFiles = require('esbuild-copy-static-files')

esbuild.build({
  entryPoints: ['./moxie.js'],
  outfile: './dist/moxie.js',
  bundle: true,
  minify: true,
  sourcemap: true,
  watch: false,
  plugins: [copyStaticFiles({
    src: './static',
    dest:  './dist'
  }), copyStaticFiles({
    src: './benchmarks',
    dest:  './dist/benchmarks'
  }), copyStaticFiles({
    src: './node_modules/gw2-data/api-cache',
    dest:  './dist/api-cache'
  })],
});
