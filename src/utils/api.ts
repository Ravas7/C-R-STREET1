import { projectId, publicAnonKey } from './supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-4e6d071e`;

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`,
};

// ==================== PRODUTOS ====================

export async function getProducts() {
  try {
    const response = await fetch(`${API_URL}/products`, { headers });
    if (!response.ok) throw new Error('Failed to fetch products');
    const data = await response.json();
    return data.products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function getProduct(id: number) {
  try {
    const response = await fetch(`${API_URL}/products/${id}`, { headers });
    if (!response.ok) throw new Error('Failed to fetch product');
    const data = await response.json();
    return data.product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export async function createProduct(product: any) {
  try {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers,
      body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error('Failed to create product');
    const data = await response.json();
    return data.product;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

export async function updateProduct(id: number, updates: any) {
  try {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update product');
    const data = await response.json();
    return data.product;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

export async function deleteProduct(id: number) {
  try {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) throw new Error('Failed to delete product');
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

// ==================== PEDIDOS ====================

export async function getOrders() {
  try {
    const response = await fetch(`${API_URL}/orders`, { headers });
    if (!response.ok) throw new Error('Failed to fetch orders');
    const data = await response.json();
    return data.orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

export async function getOrder(id: number) {
  try {
    const response = await fetch(`${API_URL}/orders/${id}`, { headers });
    if (!response.ok) throw new Error('Failed to fetch order');
    const data = await response.json();
    return data.order;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
}

export async function createOrder(orderData: any) {
  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(orderData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create order');
    }
    const data = await response.json();
    return data.order;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

export async function updateOrderStatus(id: number, status: string, tracking_code?: string) {
  try {
    const response = await fetch(`${API_URL}/orders/${id}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status, tracking_code }),
    });
    if (!response.ok) throw new Error('Failed to update order status');
    const data = await response.json();
    return data.order;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

// ==================== CONFIGURAÇÕES ====================

export async function getSettings() {
  try {
    const response = await fetch(`${API_URL}/settings`, { headers });
    if (!response.ok) throw new Error('Failed to fetch settings');
    const data = await response.json();
    return data.settings;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
}

export async function updateSettings(settings: any) {
  try {
    const response = await fetch(`${API_URL}/settings`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(settings),
    });
    if (!response.ok) throw new Error('Failed to update settings');
    const data = await response.json();
    return data.settings;
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
}
