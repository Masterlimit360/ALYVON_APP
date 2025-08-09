import supabase from '@/lib/supabase';

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  username: string | null;
  role: 'customer' | 'manager' | 'admin';
  avatar_url: string | null;
  cover_url: string | null;
};

export async function getCurrentProfile(): Promise<Profile | null> {
  const { data: userRes } = await supabase.auth.getUser();
  const userId = userRes.user?.id;
  if (!userId) return null;
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  console.log('Current profile data:', data);
  return data as any;
}

export async function updateProfile(fields: Partial<Profile>) {
  const { data: userRes } = await supabase.auth.getUser();
  const userId = userRes.user?.id;
  if (!userId) throw new Error('Not authenticated');
  await supabase.from('profiles').update(fields).eq('id', userId);
}

export async function uploadToBucket(fileUri: string, path: string) {
  try {
    console.log('Uploading file:', fileUri, 'to path:', path);
    const response = await fetch(fileUri);
    const blob = await response.blob();
    const { data, error } = await supabase.storage.from('profiles').upload(path, blob, { upsert: true, contentType: blob.type || 'image/jpeg' });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from('profiles').getPublicUrl(path);
    console.log('Generated public URL:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (err) {
    console.error('Upload failed:', err);
    throw new Error('Image upload failed. Please try again.');
  }
}


