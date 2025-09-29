import { ThemedText } from '@/components/ThemedText';
import { getCurrentProfile } from '@/lib/profile';
import supabase from '@/lib/supabase';
import { Image } from 'expo-image';
import { Link, router, useFocusEffect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

export default function MenuScreen() {
  const [profile, setProfile] = useState<any>(null);
  
  async function loadProfile() {
    const profileData = await getCurrentProfile();
    if (profileData) {
      // Add cache-busting parameter to force image refresh
      const timestamp = Date.now();
      setProfile({
        ...profileData,
        avatar_url: profileData.avatar_url ? `${profileData.avatar_url}?t=${timestamp}` : null,
        cover_url: profileData.cover_url ? `${profileData.cover_url}?t=${timestamp}` : null,
      });
    } else {
      setProfile(profileData);
    }
  }
  
  useEffect(() => { 
    loadProfile(); 
  }, []);
  
  // Reload profile when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadProfile();
    }, [])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Image 
          source={profile?.cover_url || require('@/assets/images/ALYVON-logo.png')} 
          style={styles.cover}
          cachePolicy="none"
          onError={(error) => console.log('Menu cover image error:', error)}
        />
        <Image 
          source={profile?.avatar_url || require('@/assets/images/ALYVON-logo.png')} 
          style={styles.avatar}
          cachePolicy="none"
          onError={(error) => console.log('Menu avatar image error:', error)}
        />
        <ThemedText type="title">{profile?.username || profile?.full_name || 'User'}</ThemedText>
      </View>
      <Link href="/(tabs)/account" asChild>
        <Pressable style={styles.row}><ThemedText>Profile</ThemedText></Pressable>
      </Link>
      <Link href="/settings" asChild>
        <Pressable style={styles.row}><ThemedText>Settings</ThemedText></Pressable>
      </Link>
      <Link href="/help" asChild>
        <Pressable style={styles.row}><ThemedText>Help & Support</ThemedText></Pressable>
      </Link>
      <Link href="/privacy" asChild>
        <Pressable style={styles.row}><ThemedText>Privacy Policy</ThemedText></Pressable>
      </Link>
      <Pressable style={[styles.row, { justifyContent: 'center' }]} onPress={async () => { await supabase.auth.signOut(); router.replace('/auth/sign-in'); }}>
        <ThemedText type="link">Logout</ThemedText>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  header: { alignItems: 'center', marginBottom: 8 },
  cover: { width: '100%', height: 120, borderRadius: 12 },
  avatar: { width: 96, height: 96, borderRadius: 999, marginTop: -48, borderWidth: 3, borderColor: '#fff' },
  row: { padding: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(148,163,184,0.25)', marginTop: 8 },
});


