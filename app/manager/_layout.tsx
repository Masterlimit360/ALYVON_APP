import { Stack } from 'expo-router';
import React from 'react';

export default function ManagerLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Manager Console' }} />
      <Stack.Screen name="order" options={{ title: 'Order' }} />
      <Stack.Screen name="items" options={{ title: 'Items' }} />
    </Stack>
  );
}


