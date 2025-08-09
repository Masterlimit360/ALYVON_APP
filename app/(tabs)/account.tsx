import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import supabase from '@/lib/supabase';
import { router } from 'expo-router';
import { Link } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { getCurrentProfile, updateProfile, uploadToBucket } from '@/lib/profile';

export default function AccountScreen() {
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  async function loadProfile() {
    const { data } = await supabase.auth.getUser();
    setEmail(data.user?.email ?? null);
    setRole((data.user?.user_metadata as any)?.role ?? null);
    const p = await getCurrentProfile();
    if (p) {
      setUsername(p.username ?? null);
      setFullName(p.full_name ?? null);
      // Add cache-busting parameter to force image refresh
      setAvatarUrl(p.avatar_url ? `${p.avatar_url}?t=${Date.now()}` : null);
      setCoverUrl(p.cover_url ? `${p.cover_url}?t=${Date.now()}` : null);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <ThemedView style={styles.container}>
      <Image 
        source={coverUrl || require('@/assets/images/ALYVON logo.png')} 
        style={styles.cover}
        cachePolicy="none"
        onLoad={() => console.log('Cover image loaded:', coverUrl)}
        onError={(error) => console.log('Cover image error:', error)}
      />
      <Pressable onPress={async () => {
        try {
          const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.8 });
          if (!res.canceled) {
            const url = await uploadToBucket(res.assets[0].uri, `covers/${Date.now()}.jpg`);
            await updateProfile({ cover_url: url });
            await loadProfile(); // Reload profile to get updated image
            Alert.alert('Success', 'Cover photo updated!');
          }
        } catch (err: any) {
          Alert.alert('Upload failed', err.message);
        }
      }}>
        <ThemedText type="link" style={{ alignSelf: 'flex-end', marginTop: 8 }}>Edit Cover</ThemedText>
      </Pressable>
      <Pressable onPress={async () => {
        try {
          const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.8 });
          if (!res.canceled) {
            const url = await uploadToBucket(res.assets[0].uri, `avatars/${Date.now()}.jpg`);
            await updateProfile({ avatar_url: url });
            await loadProfile(); // Reload profile to get updated image
            Alert.alert('Success', 'Profile photo updated!');
          }
        } catch (err: any) {
          Alert.alert('Upload failed', err.message);
        }
      }}>
        <Image 
          source={avatarUrl || require('@/assets/images/ALYVON logo.png')} 
          style={styles.avatar}
          cachePolicy="none"
          onLoad={() => console.log('Avatar image loaded:', avatarUrl)}
          onError={(error) => console.log('Avatar image error:', error)}
        />
      </Pressable>
      {editing ? (
        <View style={{ gap: 8 }}>
          <TextInput placeholder="Username" value={username ?? ''} onChangeText={setUsername as any} style={styles.input} />
          <TextInput placeholder="Full name" value={fullName ?? ''} onChangeText={setFullName as any} style={styles.input} />
          <Pressable style={styles.button} onPress={async () => {
            // username uniqueness enforcement
            if (username) {
              const { data: exists } = await supabase.from('profiles').select('id').eq('username', username).neq('id', (await supabase.auth.getUser()).data.user?.id || '').maybeSingle();
              if (exists) { Alert.alert('Username already taken'); return; }
            }
            await updateProfile({ username: username ?? null, full_name: fullName ?? null });
            await loadProfile(); // Reload profile to get updated data
            setEditing(false);
          }}>
            <ThemedText style={{ color: 'white', fontWeight: '600', textAlign: 'center' }}>Save</ThemedText>
          </Pressable>
        </View>
      ) : (
        <ThemedText type="title">{username || fullName || 'Account'}</ThemedText>
      )}
      <ThemedText>{email ?? 'Guest'}</ThemedText>
      {role && <ThemedText>Role: {role}</ThemedText>}
      {!editing && (
        <Pressable style={[styles.button, { backgroundColor: '#0EA5E9' }]} onPress={() => setEditing(true)}>
          <ThemedText style={{ color: 'white', fontWeight: '600', textAlign: 'center' }}>Edit Profile</ThemedText>
        </Pressable>
      )}
      {role === 'manager' && (
        <View style={{ gap: 12 }}>
          <Link href="/manager" asChild>
            <Pressable style={[styles.button, { backgroundColor: '#0EA5E9' }]}> 
              <ThemedText style={{ color: 'white', fontWeight: '600', textAlign: 'center' }}>Open Manager Console</ThemedText>
            </Pressable>
          </Link>
          <Link href="/manager/items" asChild>
            <Pressable style={[styles.button, { backgroundColor: '#10B981' }]}> 
              <ThemedText style={{ color: 'white', fontWeight: '600', textAlign: 'center' }}>Manage Items</ThemedText>
            </Pressable>
          </Link>
        </View>
      )}
      <Pressable
        style={[styles.button, { backgroundColor: '#EF4444' }]}
        onPress={async () => {
          await supabase.auth.signOut();
          router.replace('/auth/sign-in');
        }}
      >
        <ThemedText style={{ color: 'white', fontWeight: '600', textAlign: 'center' }}>Sign Out</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 12 },
  cover: { width: '100%', height: 160, borderRadius: 12 },
  avatar: { width: 120, height: 120, borderRadius: 999, marginTop: -60, alignSelf: 'center', borderWidth: 3, borderColor: '#fff' },
  button: { backgroundColor: '#2B6CB0', padding: 14, borderRadius: 12, width: '100%', marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#CBD5E0', borderRadius: 10, padding: 12, fontSize: 16 },
});


