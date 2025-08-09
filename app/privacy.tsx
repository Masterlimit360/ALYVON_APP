import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function PrivacyScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Privacy Policy</ThemedText>
      <ThemedText>We respect your privacy. This is a placeholder policy.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 8 },
});


