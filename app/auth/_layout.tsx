import { Colors } from '@/constants/Colors';
import { Stack } from 'expo-router';
import React from 'react';
import { Image, View } from 'react-native';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.light.background },
        headerTitleAlign: 'center',
        headerTitle: () => (
          <View style={{ alignItems: 'center' }}>
            <Image
              source={require('@/assets/images/ALYVON-logo.png')}
              style={{ width: 220, height: 74, resizeMode: 'contain' }}
            />
          </View>
        ),
      }}
    >
      <Stack.Screen name="sign-in" options={{ title: 'Sign In' }} />
      <Stack.Screen name="sign-up" options={{ title: 'Create Account' }} />
    </Stack>
  );
}


