import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { checkoutCart, fetchCart, removeCartItem, updateCartItem } from '@/lib/orders';
import { Colors } from '@/constants/Colors';

export default function CartScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [date, setDate] = useState('');

  async function load() {
    const { order, items } = await fetchCart();
    setItems(items);
    setOrderId(order.id);
  }

  useEffect(() => { load(); }, []);

  return (
    <ThemedView style={{ flex: 1 }}>
      <FlatList
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={{ gap: 8 }}>
            <ThemedText type="title">Cart</ThemedText>
            <TextInput placeholder="Delivery address" value={address} onChangeText={setAddress} style={styles.input} />
            <TextInput placeholder="Scheduled date (YYYY-MM-DD)" value={date} onChangeText={setDate} style={styles.input} />
          </View>
        }
        data={items}
        keyExtractor={(x) => x.id}
        ListEmptyComponent={<ThemedText style={{ textAlign: 'center', marginTop: 40 }}>Your cart is empty</ThemedText>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <ThemedText style={{ flex: 1 }}>{item.items?.name ?? item.item_id}</ThemedText>
            <TextInput
              value={String(item.quantity)}
              onChangeText={(t) => updateCartItem(item.id, { quantity: Number(t) || 1 }).then(load)}
              keyboardType="numeric"
              style={styles.qty}
            />
            <TextInput
              value={String(item.days)}
              onChangeText={(t) => updateCartItem(item.id, { days: Number(t) || 1 }).then(load)}
              keyboardType="numeric"
              style={styles.qty}
            />
            <Pressable onPress={() => removeCartItem(item.id).then(load)}>
              <ThemedText type="link">Remove</ThemedText>
            </Pressable>
          </View>
        )}
        ListFooterComponent={
          <Pressable
            style={styles.checkout}
            onPress={async () => {
              const id = await checkoutCart({ delivery_address: address, scheduled_date: date || null });
              setAddress(''); setDate('');
              load();
            }}
          >
            <ThemedText style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>Checkout</ThemedText>
          </Pressable>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  qty: { width: 48, borderWidth: 1, borderColor: '#CBD5E0', padding: 8, borderRadius: 8, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#CBD5E0', borderRadius: 10, padding: 12 },
  checkout: { backgroundColor: Colors.light.tint, padding: 14, borderRadius: 12, marginTop: 8 },
});


