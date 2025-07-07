const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Configure for web compatibility
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add web-specific resolver configuration
config.resolver.alias = {
  ...config.resolver.alias,
  'react-native$': 'react-native-web',
};

module.exports = withNativeWind(config, { input: "./src/global.css" });
