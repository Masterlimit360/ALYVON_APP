const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configure resolver to handle web platform exclusions
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add blockList to prevent bundling of native-only modules on web
config.resolver.blockList = [
  // Block react-native-maps on web
  /.*\/react-native-maps\/.*/,
  // Block expo-task-manager on web
  /.*\/expo-task-manager\/.*/,
];

// Add custom resolver to handle module resolution
config.resolver.resolverMainFields = (context, moduleName, platform) => {
  // Exclude native-only modules on web
  if (platform === 'web') {
    if (
      moduleName === 'react-native-maps' ||
      moduleName === 'expo-task-manager' ||
      moduleName.includes('react-native/Libraries/Utilities/codegenNativeCommands') ||
      moduleName.includes('react-native-maps/lib/MapMarkerNativeComponent')
    ) {
      return false;
    }
  }
  
  return ['react-native', 'browser', 'main'];
};

module.exports = config;
