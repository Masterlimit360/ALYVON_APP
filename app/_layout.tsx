import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import React, { useEffect } from 'react';
import supabase from '@/lib/supabase';
import { router } from 'expo-router';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Basic session gate: if not authenticated, push to auth stack
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace('/auth/sign-in');
      }
    })();
  }, []);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  const theme = colorScheme === 'dark' ? {
    ...DarkTheme,
    colors: { ...DarkTheme.colors, primary: Colors.dark.tint, card: Colors.dark.card },
  } : {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, primary: Colors.light.tint, card: Colors.light.card },
  };
  return (
    <ThemeProvider value={theme}>
      <Stack
        screenOptions={{
          headerTintColor: '#fff',
          headerStyle: { backgroundColor: Colors.light.tint },
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
