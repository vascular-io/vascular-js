const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: true,
  target: ['es2015'],
  platform: 'node',
  outfile: 'dist/index.js',
}).catch(() => process.exit(1));