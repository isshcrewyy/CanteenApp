const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure TypeScript and JSX files are properly resolved
config.resolver.sourceExts = ['ts', 'tsx', 'js', 'jsx', 'json', 'cjs'];

// Add TypeScript file extension support
config.transformer.minifierPath = 'metro-minify-terser';

module.exports = config;
