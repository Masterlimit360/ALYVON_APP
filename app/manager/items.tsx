import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import supabase from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';

export default function ManagerItems() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', category: '', price: '', qty: '' });
  const [imageUri, setImageUri] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase.from('items').select('*').order('created_at', { ascending: false });
    setItems(data as any[] ?? []);
  }
  useEffect(() => { load(); }, []);

  async function pickImage() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!res.canceled) setImageUri(res.assets[0].uri);
  }

  async function createItem() {
    let image_url: string | null = null;
    if (imageUri) {
      const blob = await (await fetch(imageUri)).blob();
      const path = `items/${Date.now()}.jpg`;
      await supabase.storage.from('profiles').upload(path, blob, { upsert: true, contentType: blob.type || 'image/jpeg' });
      image_url = supabase.storage.from('profiles').getPublicUrl(path).data.publicUrl;
    }
    await supabase.from('items').insert({
      name: form.name,
      category: form.category,
      price_per_day: Number(form.price) || 0,
      total_qty: Number(form.qty) || 0,
      available_qty: Number(form.qty) || 0,
      image_url,
    });
    setForm({ name: '', category: '', price: '', qty: '' }); setImageUri(null); load();
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <FlatList
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={{ gap: 8 }}>
            <ThemedText type="title">Items</ThemedText>
            <TextInput placeholder="Name" value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} style={styles.input} />
            <TextInput placeholder="Category" value={form.category} onChangeText={(t) => setForm({ ...form, category: t })} style={styles.input} />
            <TextInput placeholder="Price per day" keyboardType="numeric" value={form.price} onChangeText={(t) => setForm({ ...form, price: t })} style={styles.input} />
            <TextInput placeholder="Quantity" keyboardType="numeric" value={form.qty} onChangeText={(t) => setForm({ ...form, qty: t })} style={styles.input} />
            <Pressable onPress={pickImage} style={styles.button}><ThemedText style={styles.buttonText}>{imageUri ? 'Change Image' : 'Pick Image'}</ThemedText></Pressable>
            <Pressable onPress={createItem} style={styles.button}><ThemedText style={styles.buttonText}>Create Item</ThemedText></Pressable>
          </View>
        }
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.image_url ? <Image source={{ uri: item.image_url }} style={styles.image} /> : <View style={[styles.image, { backgroundColor: '#E5E7EB' }]} />}
            <ThemedText type="subtitle">{item.name}</ThemedText>
            <ThemedText>{item.category}</ThemedText>
            <ThemedText>${item.price_per_day?.toFixed(2)}</ThemedText>
          </View>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12 },
  input: { borderWidth: 1, borderColor: '#CBD5E0', borderRadius: 10, padding: 12 },
  button: { backgroundColor: '#2B6CB0', padding: 12, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '600' },
  card: { padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(148,163,184,0.25)' },
  image: { width: '100%', height: 140, borderRadius: 10, marginBottom: 6 },
});


