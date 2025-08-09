import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Link, router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import supabase from '@/lib/supabase';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isManager, setIsManager] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: isManager ? 'manager' : 'customer',
          },
        },
      });
      if (error) throw error;
      router.replace('/');
    } catch (err: any) {
      Alert.alert('Sign up failed', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <ThemedText type="title">Create your account</ThemedText>
      <TextInput
        placeholder="Full name"
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
      />
      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />
      <Pressable onPress={() => setIsManager(!isManager)} style={styles.checkboxRow}>
        <View style={[styles.checkbox, isManager && styles.checkboxChecked]} />
        <ThemedText>Sign up as manager</ThemedText>
      </Pressable>
      <Pressable disabled={loading} onPress={handleSignUp} style={styles.button}>
        <ThemedText style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>
          {loading ? 'Creating…' : 'Create Account'}
        </ThemedText>
      </Pressable>
      <Link href="/auth/sign-in" asChild>
        <Pressable>
          <ThemedText type="link" style={{ marginTop: 16 }}>
            Already have an account? Sign in
          </ThemedText>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 12,
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E0',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A0AEC0',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: Colors.light.tint,
  },
  button: {
    backgroundColor: Colors.light.tint,
    padding: 14,
    borderRadius: 12,
    marginTop: 6,
  },
});


