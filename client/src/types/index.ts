export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "staff";
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  product_count: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  category_id?: string;
  category_name?: string;
  price: number;
  quantity: number;
  min_threshold: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

// StockHistory is the canonical name; StockEntry kept for backwards compat
export interface StockHistory {
  id: string;
  product_id: string;
  product_name: string;
  sku: string;
  user_id: string;
  user_name: string;
  type: "IN" | "OUT";
  quantity: number;
  note?: string;
  created_at: string;
}

export interface DashboardStats {
  total_products: number;
  low_stock_count: number;
  total_value: number;
  recent_activity: StockHistory[];
  category_breakdown: { name: string; count: number; total_quantity: number }[];
}

export interface Meta {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: Meta;
}
