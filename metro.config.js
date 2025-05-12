// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Forzamos a Metro a resolver siempre @react-native-picker/picker
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  "@react-native-picker/picker": require.resolve(
    "@react-native-picker/picker"
  ),
};

module.exports = config;