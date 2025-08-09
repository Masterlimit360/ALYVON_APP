import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import supabase from '@/lib/supabase';
import { router } from 'expo-router';
import { startSharingManagerLocation } from '@/lib/location';
import { startBackgroundLocation } from '@/lib/bgLocation';

type Order = {
  id: string;
  user_id: string;
  status: string;
  total: number;
  scheduled_date: string | null;
};

export default function ManagerHome() {
  const [orders, setOrders] = useState<Order[]>([]);

  async function load() {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    setOrders((data as Order[]) ?? []);
  }

  useEffect(() => {
    load();
    // Start sharing location in background for manager
    startSharingManagerLocation().catch(() => {});
    startBackgroundLocation().catch(() => {});
  }, []);

  return (
    <ThemedView style={{ flex: 1 }}>
      <FlatList
        contentContainerStyle={styles.content}
        data={orders}
        keyExtractor={(o) => o.id}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => router.push(`/manager/order?id=${item.id}`)}>
            <ThemedText type="subtitle">Order #{item.id.slice(0,8)}</ThemedText>
            <ThemedText>Status: {item.status}</ThemedText>
            <ThemedText>Total: ${item.total?.toFixed(2)}</ThemedText>
          </Pressable>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12 },
  card: { padding: 16, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(148,163,184,0.25)' },
});


