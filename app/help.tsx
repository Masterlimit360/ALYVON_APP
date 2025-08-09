import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HelpScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Help & Support</ThemedText>
      <ThemedText>Contact us at support@alyvon.com</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 8 },
});


