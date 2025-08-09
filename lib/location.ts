import * as Location from 'expo-location';
import supabase from '@/lib/supabase';

export async function requestLocationPermission() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') throw new Error('Location permission not granted');
}

export async function startSharingManagerLocation() {
  await requestLocationPermission();
  const { user } = (await supabase.auth.getUser()).data;
  if (!user) return;

  await Location.watchPositionAsync({ accuracy: Location.Accuracy.Balanced, timeInterval: 10000, distanceInterval: 25 }, async (pos) => {
    const { latitude, longitude } = pos.coords;
    await supabase.from('manager_locations').upsert({ user_id: user.id, lat: latitude, lng: longitude, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
  });
}

export async function fetchManagerLocation(userId: string) {
  const { data } = await supabase.from('manager_locations').select('*').eq('user_id', userId).maybeSingle();
  return data as any;
}


