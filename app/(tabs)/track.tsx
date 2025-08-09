import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View, Pressable } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import supabase from '@/lib/supabase';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import MapView, { Marker, Region } from 'react-native-maps';
import { fetchManagerLocation } from '@/lib/location';

type Delivery = {
  id: string;
  order_id: string;
  status: 'pending' | 'enroute' | 'delivered' | 'returned';
  eta: string | null;
  location_note: string | null;
};

export default function TrackScreen() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const scheme = useColorScheme() ?? 'light';
  const [selected, setSelected] = useState<Delivery | null>(null);
  const [managerCoord, setManagerCoord] = useState<{ latitude: number; longitude: number } | null>(null);

  async function load() {
    const { data } = await supabase.from('deliveries').select('*').order('created_at', { ascending: false });
    setDeliveries((data as Delivery[]) ?? []);
  }

  useEffect(() => {
    load();
    const channel = supabase
      .channel('deliveries-track')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deliveries' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'manager_locations' }, async (payload) => {
        if (selected?.assigned_to && payload.new && (payload.new as any).user_id === selected.assigned_to) {
          const loc = payload.new as any;
          setManagerCoord({ latitude: loc.lat, longitude: loc.lng });
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    let timer: any;
    async function poll() {
      if (selected?.assigned_to) {
        const loc = await fetchManagerLocation(selected.assigned_to);
        if (loc?.lat && loc?.lng) setManagerCoord({ latitude: loc.lat, longitude: loc.lng });
      }
    }
    if (selected?.assigned_to) {
      poll();
      timer = setInterval(poll, 10000);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [selected?.assigned_to]);

  return (
    <ThemedView style={{ flex: 1 }}>
      {selected ? (
        <View style={{ flex: 1 }}>
          <MapView
            style={{ flex: 1 }}
            initialRegion={{ latitude: managerCoord?.latitude ?? 5.6037, longitude: managerCoord?.longitude ?? -0.1870, latitudeDelta: 0.2, longitudeDelta: 0.2 }}
          >
            {selected.assigned_to && managerCoord && (
              <Marker coordinate={managerCoord} title={`Manager`} description={`Live location`} />
            )}
          </MapView>
          <Pressable style={{ position: 'absolute', top: 16, left: 16, backgroundColor: '#00000088', padding: 10, borderRadius: 10 }} onPress={() => setSelected(null)}>
            <ThemedText style={{ color: 'white' }}>Back</ThemedText>
          </Pressable>
        </View>
      ) : (
      <FlatList
        contentContainerStyle={styles.content}
        data={deliveries}
        keyExtractor={(d) => d.id}
        ListEmptyComponent={<ThemedText style={{ textAlign: 'center', marginTop: 40 }}>No deliveries to track</ThemedText>}
        renderItem={({ item }) => (
          <Pressable onPress={() => setSelected(item)} style={[styles.card, { backgroundColor: scheme === 'dark' ? 'rgba(136,185,255,0.08)' : 'rgba(43,108,176,0.06)' }]}>
            <ThemedText type="subtitle">Order #{item.order_id.slice(0, 8)}</ThemedText>
            <ThemedText>Status: {item.status}</ThemedText>
            {item.eta && <ThemedText>ETA: {new Date(item.eta).toLocaleString()}</ThemedText>}
            {item.location_note && <ThemedText>Note: {item.location_note}</ThemedText>}
          </Pressable>
        )}
      />)}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12 },
  card: { padding: 16, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(148,163,184,0.25)' },
});


