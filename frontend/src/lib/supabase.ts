import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// These will be set at build time via environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
  console.log('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Types for our database
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  in_stock: number;
  print_time: string;
  created_by: string;
  created_at: string;
}

export interface CartItem {
  id: number;
  session_id: string;
  product_id: number;
  quantity: number;
  product?: Product;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  session_id: string;
  customer_name: string;
  customer_email: string;
  address: string;
  total: number;
  status: string;
  tracking_code: string;
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface StatusHistory {
  id: number;
  order_id: number;
  status: string;
  message: string;
  created_at: string;
}
