import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { ThemedText } from './ThemedText';

// Web fallback components
const WebMapView = ({ children, style, ...props }: any) => (
  <View style={[styles.webMapFallback, style]}>
    <ThemedText style={styles.webMapText}>
      Map view is not available on web
    </ThemedText>
    <ThemedText style={styles.webMapSubtext}>
      Please use the mobile app for full map functionality
    </ThemedText>
    {children}
  </View>
);

const WebMarker = ({ children, ...props }: any) => (
  <View style={styles.webMarker}>
    <ThemedText style={styles.webMarkerText}>📍</ThemedText>
    {children}
  </View>
);

// Platform-specific imports
let MapView: any = WebMapView;
let Marker: any = WebMarker;

if (Platform.OS !== 'web') {
  // Only try to load react-native-maps on native platforms
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default || Maps;
    Marker = Maps.Marker;
  } catch (error) {
    console.warn('react-native-maps not available:', error);
    // Keep the web fallback components
  }
}

const styles = StyleSheet.create({
  webMapFallback: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  webMapText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  webMapSubtext: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  webMarker: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webMarkerText: {
    fontSize: 20,
  },
});

export { MapView, Marker };
