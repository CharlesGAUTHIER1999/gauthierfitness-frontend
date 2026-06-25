// Used by Jest only (Vite uses esbuild for dev/build).
// .cjs extension because package.json has "type": "module".
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
  plugins: [
    // Transforms import.meta.env.* (Vite-specific) to process.env.* so Jest can parse it.
    'babel-plugin-transform-vite-meta-env',
  ],
};
