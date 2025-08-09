import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, TextInput } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import supabase from '@/lib/supabase';
import { useLocalSearchParams } from 'expo-router';

export default function ManagerOrder() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [assigned, setAssigned] = useState<string>('');

  async function load() {
    const { data: orderData } = await supabase.from('orders').select('*').eq('id', id).single();
    const { data: itemData } = await supabase.from('order_items').select('*, items(name)').eq('order_id', id);
    setOrder(orderData);
    setItems(itemData as any[] ?? []);
    const { data: del } = await supabase.from('deliveries').select('*').eq('order_id', id).maybeSingle();
    setAssigned((del as any)?.assigned_to ?? '');
  }

  useEffect(() => { if (id) load(); }, [id]);

  async function updateStatus(status: string) {
    await supabase.from('orders').update({ status }).eq('id', id);
    load();
  }

  async function createDelivery() {
    await supabase.from('deliveries').upsert({ order_id: id, status: 'pending', assigned_to: assigned || null }, { onConflict: 'order_id' });
    load();
  }

  if (!order) return null;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ThemedText type="title">Order #{String(id).slice(0,8)}</ThemedText>
      <ThemedText>Status: {order.status}</ThemedText>
      <ThemedText>Total: ${order.total?.toFixed(2)}</ThemedText>
      <ThemedText>Scheduled: {order.scheduled_date ? new Date(order.scheduled_date).toLocaleString() : '—'}</ThemedText>
      <ThemedText type="subtitle" style={{ marginTop: 12 }}>Items</ThemedText>
      {items.map((it) => (
        <View key={it.id} style={styles.line}>
          <ThemedText>{it.items?.name ?? it.item_id}</ThemedText>
          <ThemedText>x{it.quantity} for {it.days}d</ThemedText>
          <ThemedText>${it.subtotal?.toFixed(2)}</ThemedText>
        </View>
      ))}
      <ThemedText type="subtitle" style={{ marginTop: 12 }}>Actions</ThemedText>
      <ThemedText>Assign Manager (user id)</ThemedText>
      <TextInput value={assigned} onChangeText={setAssigned} placeholder="manager user id" style={styles.input} />
      <View style={styles.actions}>
        <Pressable style={styles.button} onPress={() => updateStatus('confirmed')}><ThemedText style={styles.buttonText}>Confirm</ThemedText></Pressable>
        <Pressable style={styles.button} onPress={() => updateStatus('out_for_delivery')}><ThemedText style={styles.buttonText}>Out for Delivery</ThemedText></Pressable>
        <Pressable style={styles.button} onPress={() => updateStatus('delivered')}><ThemedText style={styles.buttonText}>Mark Delivered</ThemedText></Pressable>
        <Pressable style={[styles.button, { backgroundColor: '#0EA5E9' }]} onPress={createDelivery}><ThemedText style={styles.buttonText}>Create/Update Delivery</ThemedText></Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 8 },
  line: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  actions: { gap: 10, marginTop: 8 },
  button: { backgroundColor: '#2B6CB0', padding: 12, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#CBD5E0', borderRadius: 10, padding: 12, fontSize: 16 },
});


