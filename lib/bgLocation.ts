import supabase from '@/lib/supabase';
import { Location, TaskManager } from './platformLocation';

export const BG_LOCATION_TASK = 'ALYVON_BACKGROUND_LOCATION_TASK';

// Define once to avoid duplicate definition errors in fast refresh
// @ts-ignore
if (!TaskManager.isTaskDefined?.(BG_LOCATION_TASK)) {
  TaskManager.defineTask(BG_LOCATION_TASK, async ({ data, error }) => {
    if (error) {
      console.warn('Background location error', error);
      return;
    }
    const { locations } = data as any;
    const latest = locations?.[0];
    if (!latest) return;
    const { data: userRes } = await supabase.auth.getUser();
    const userId = userRes.user?.id;
    if (!userId) return;
    const { latitude, longitude } = latest.coords;
    await supabase
      .from('manager_locations')
      .upsert({ user_id: userId, lat: latitude, lng: longitude, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
  });
}

export async function startBackgroundLocation() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') throw new Error('Location permission not granted');
  const bg = await Location.requestBackgroundPermissionsAsync();
  if (bg.status !== 'granted') {
    console.warn('Background location permission not granted');
  }
  const started = await Location.hasStartedLocationUpdatesAsync(BG_LOCATION_TASK);
  if (!started) {
    await Location.startLocationUpdatesAsync(BG_LOCATION_TASK, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 15000,
      distanceInterval: 50,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'ALYVON Delivery',
        notificationBody: 'Sharing location for active deliveries',
      },
    });
  }
}

export async function stopBackgroundLocation() {
  const started = await Location.hasStartedLocationUpdatesAsync(BG_LOCATION_TASK);
  if (started) await Location.stopLocationUpdatesAsync(BG_LOCATION_TASK);
}


