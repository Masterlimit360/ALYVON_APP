import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import supabase from '@/lib/supabase';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

type Order = {
  id: string;
  status: string;
  total: number;
  scheduled_date: string | null;
  user_id?: string;
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const scheme = useColorScheme() ?? 'light';

  async function loadOrders() {
    setRefreshing(true);
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    setOrders((data as Order[]) ?? []);
    setRefreshing(false);
  }

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <ThemedView style={{ flex: 1 }}>
      <FlatList
        contentContainerStyle={styles.content}
        data={orders}
        keyExtractor={(o) => o.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadOrders} />}
        ListEmptyComponent={<ThemedText style={{ textAlign: 'center', marginTop: 40 }}>No orders yet</ThemedText>}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: scheme === 'dark' ? 'rgba(136,185,255,0.08)' : 'rgba(43,108,176,0.06)' }]}>
            <ThemedText type="subtitle">Order #{item.id.slice(0, 8)}</ThemedText>
            <ThemedText>Status: {item.status}</ThemedText>
            <ThemedText>Total: ${item.total?.toFixed(2)}</ThemedText>
            {item.scheduled_date && <ThemedText>Delivery: {new Date(item.scheduled_date).toDateString()}</ThemedText>}
          </View>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12 },
  card: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
  },
});


