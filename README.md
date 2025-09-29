# ALYVON App

A React Native/Expo app for item rental and delivery tracking.

## Prerequisites

Before running this app, you need:

1. **Node.js** (version 18 or higher)
2. **Expo CLI** (`npm install -g @expo/cli`)
3. **Android Studio** (for Android development)
4. **Supabase Account** (for backend services)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` and add your Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

   To get these credentials:
   - Go to [Supabase](https://supabase.com)
   - Create a new project or use existing one
   - Go to Settings > API
   - Copy the Project URL and anon/public key

### 3. Supabase Database Setup

You'll need to create the following tables in your Supabase database:

#### Users Table (handled by Supabase Auth)
- Automatically created by Supabase Auth

#### Items Table
```sql
CREATE TABLE items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price_per_day DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  available_qty INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Orders Table
```sql
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  total DECIMAL(10,2) DEFAULT 0,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  delivery_address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Order Items Table
```sql
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  days INTEGER DEFAULT 1,
  price_per_day DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Deliveries Table
```sql
CREATE TABLE deliveries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  eta TIMESTAMP WITH TIME ZONE,
  location_note TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Manager Locations Table
```sql
CREATE TABLE manager_locations (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  lat DECIMAL(10,8) NOT NULL,
  lng DECIMAL(11,8) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Row Level Security (RLS)

Enable RLS and create policies for each table:

```sql
-- Enable RLS on all tables
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE manager_locations ENABLE ROW LEVEL SECURITY;

-- Items: Read access for all authenticated users
CREATE POLICY "Items are viewable by authenticated users" ON items
  FOR SELECT USING (auth.role() = 'authenticated');

-- Orders: Users can only see their own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR ALL USING (auth.uid() = user_id);

-- Order items: Users can only see items in their orders
CREATE POLICY "Users can view own order items" ON order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

-- Deliveries: Users can view deliveries for their orders
CREATE POLICY "Users can view deliveries for their orders" ON deliveries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = deliveries.order_id AND orders.user_id = auth.uid()
    )
  );

-- Manager locations: Read access for all authenticated users
CREATE POLICY "Manager locations are viewable by authenticated users" ON manager_locations
  FOR SELECT USING (auth.role() = 'authenticated');

-- Manager locations: Users can update their own location
CREATE POLICY "Users can update own location" ON manager_locations
  FOR UPDATE USING (auth.uid() = user_id);
```

## Running on Android

### Option 1: Using Expo Go (Easiest)

1. Install Expo Go on your Android device from Google Play Store
2. Start the development server:
   ```bash
   npx expo start
   ```
3. Scan the QR code with Expo Go app

### Option 2: Using Android Emulator

1. Install Android Studio
2. Set up an Android Virtual Device (AVD)
3. Start the emulator
4. Run:
   ```bash
   npx expo start --android
   ```

### Option 3: Using Physical Android Device

1. Enable Developer Options on your Android device
2. Enable USB Debugging
3. Connect your device via USB
4. Run:
   ```bash
   npx expo start --android
   ```

## Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Start the app on Android
- `npm run ios` - Start the app on iOS
- `npm run web` - Start the app on web
- `npm run lint` - Run ESLint

## Troubleshooting

### Common Issues:

1. **"Metro bundler not found"**
   - Run `npm install` to ensure all dependencies are installed

2. **"Supabase connection failed"**
   - Check your `.env` file has correct Supabase credentials
   - Verify your Supabase project is active

3. **"Permission denied" errors**
   - Make sure you've set up RLS policies correctly in Supabase

4. **App crashes on startup**
   - Check the console for specific error messages
   - Ensure all database tables are created

### Getting Help

- Check the [Expo documentation](https://docs.expo.dev/)
- Visit the [Supabase documentation](https://supabase.com/docs)
- Join the [Expo Discord community](https://chat.expo.dev)
