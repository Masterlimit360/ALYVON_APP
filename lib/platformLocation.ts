import { Platform } from 'react-native';

// Web fallbacks - no background location functionality
const webTaskManager = {
  isTaskDefined: () => false,
  defineTask: () => {},
};

const webLocation = {
  requestForegroundPermissionsAsync: async () => ({ status: 'denied' }),
  requestBackgroundPermissionsAsync: async () => ({ status: 'denied' }),
  hasStartedLocationUpdatesAsync: async () => false,
  startLocationUpdatesAsync: async () => {},
  stopLocationUpdatesAsync: async () => {},
  Accuracy: { Balanced: 'balanced' },
};

// Platform-specific location functions
let TaskManager: any = webTaskManager;
let Location: any = webLocation;

if (Platform.OS !== 'web') {
  // Only try to load native modules on native platforms
  try {
    TaskManager = require('expo-task-manager');
    Location = require('expo-location');
  } catch (error) {
    console.warn('Location modules not available:', error);
    // Keep the web fallback objects
  }
}

export { Location, TaskManager };

