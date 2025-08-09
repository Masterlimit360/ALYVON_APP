import { Tabs, useNavigation } from 'expo-router';
import React from 'react';
import { Platform, Pressable } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const nav = useNavigation();

  return (
    <Tabs
       screenOptions={{
         tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
         tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
         headerShown: true,
         headerTitleStyle: { color: '#fff', fontWeight: '700' },
         headerStyle: { backgroundColor: Colors[colorScheme ?? 'light'].tint },
         headerRight: () => (
           <Pressable onPress={() => nav.navigate('menu' as never)} style={{ paddingHorizontal: 12 }}>
             <IconSymbol size={24} name="line.3.horizontal" color={'#fff'} />
           </Pressable>
         ),
         tabBarButton: HapticTab,
         tabBarBackground: TabBarBackground,
         tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Browse',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="magnifyingglass" color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="cart.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="bag.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="track"
        options={{
          title: 'Track',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="location.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          headerShown: false,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.crop.circle" color={color} />,
        }}
      />
    </Tabs>
  );
}
