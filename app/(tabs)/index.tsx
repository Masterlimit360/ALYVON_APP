import React, { useEffect, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import supabase from '@/lib/supabase';
import { Colors } from '@/constants/Colors';
import { addItemToDraftOrder } from '@/lib/orders';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Alert } from 'react-native';

type Item = {
  id: string;
  name: string;
  category: string;
  price_per_day: number;
  image_url: string | null;
  available_qty: number;
};

export default function BrowseScreen() {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const colorScheme = useColorScheme();

  async function loadItems() {
    try {
      let q = supabase.from('items').select('*').order('name');
      if (query.trim().length > 0) {
        q = q.ilike('name', `%${query}%`);
      }
      const { data } = await q;
      setItems((data as Item[]) ?? []);
    } catch (error) {
      console.warn('Failed to load items:', error);
      setItems([]);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  return (
    <ThemedView style={{ flex: 1 }}>
      <View style={styles.header}>
        <Image source={require('@/assets/images/ALYVON-logo.png')} style={{ width: 200, height: 64, resizeMode: 'contain' }} />
        <TextInput
          placeholder="Search items"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={loadItems}
          style={styles.search}
        />
      </View>
      <FlatList
        contentContainerStyle={styles.grid}
        numColumns={2}
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colorScheme === 'dark' ? Colors.dark.card : '#FFFFFF' }]}>
            {item.image_url ? (
              <Image source={{ uri: item.image_url }} style={styles.cardImage} />
            ) : (
              <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
                <ThemedText style={{ color: '#9CA3AF' }}>No Image</ThemedText>
              </View>
            )}
            <ThemedText type="subtitle" numberOfLines={1}>{item.name}</ThemedText>
            <ThemedText>{item.category}</ThemedText>
            <ThemedText>${item.price_per_day?.toFixed(2)}/day</ThemedText>
            <Pressable style={[styles.button, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]} onPress={async () => {
              try {
                await addItemToDraftOrder(item.id);
                Alert.alert('Added to cart', `${item.name} added to your cart!`);
              } catch (err: any) {
                console.error('Add to order failed:', err);
                Alert.alert('Error', 'Failed to add item to cart. Please try again.');
              }
            }}>
              <ThemedText style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>Add to order</ThemedText>
            </Pressable>
          </View>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, gap: 10 },
  search: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  grid: { padding: 12, gap: 12 },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    gap: 6,
    margin: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: { width: '100%', aspectRatio: 1.4, borderRadius: 12, backgroundColor: '#EDF2F7' },
  cardImagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  button: { padding: 10, borderRadius: 10, marginTop: 6 },
});
