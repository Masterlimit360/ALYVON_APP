import supabase from '@/lib/supabase';

export type DraftOrder = {
  id: string;
  user_id: string;
  status: string;
  total: number;
  scheduled_date: string | null;
  delivery_address: string | null;
};

export async function getOrCreateDraftOrder(): Promise<DraftOrder> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error('Not authenticated');

  const { data: existing } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .limit(1)
    .maybeSingle();

  if (existing) return existing as DraftOrder;

  const { data, error } = await supabase
    .from('orders')
    .insert({ user_id: userId, status: 'pending', total: 0 })
    .select('*')
    .single();
  if (error) throw error;
  return data as DraftOrder;
}

export async function addItemToDraftOrder(itemId: string, quantity = 1, days = 1) {
  const order = await getOrCreateDraftOrder();
  // Read price from item
  const { data: item } = await supabase.from('items').select('price_per_day').eq('id', itemId).single();
  const price = (item as any)?.price_per_day ?? 0;
  await supabase.from('order_items').insert({
    order_id: order.id,
    item_id: itemId,
    quantity,
    days,
    price_per_day: price,
  });
}

export async function fetchCart() {
  const order = await getOrCreateDraftOrder();
  const { data: items } = await supabase
    .from('order_items')
    .select('*, items(name, image_url)')
    .eq('order_id', order.id)
    .order('id');
  return { order, items: (items as any[]) ?? [] };
}

export async function updateCartItem(id: string, fields: Partial<{ quantity: number; days: number }>) {
  await supabase.from('order_items').update(fields).eq('id', id);
}

export async function removeCartItem(id: string) {
  await supabase.from('order_items').delete().eq('id', id);
}

export async function checkoutCart(params: { delivery_address: string; scheduled_date: string | null; notes?: string }) {
  const order = await getOrCreateDraftOrder();
  await supabase.from('orders').update({
    delivery_address: params.delivery_address,
    scheduled_date: params.scheduled_date,
    notes: params.notes ?? null,
    status: 'confirmed',
  }).eq('id', order.id);
  return order.id;
}


