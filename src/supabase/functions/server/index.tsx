import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// ==================== PRODUTOS ====================

// Listar todos os produtos
app.get('/make-server-4e6d071e/products', async (c) => {
  try {
    const products = await kv.getByPrefix('product:');
    return c.json({ products: products || [] });
  } catch (error) {
    console.log('Error fetching products:', error);
    return c.json({ error: 'Failed to fetch products' }, 500);
  }
});

// Buscar produto por ID
app.get('/make-server-4e6d071e/products/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const product = await kv.get(`product:${id}`);
    
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    return c.json({ product });
  } catch (error) {
    console.log('Error fetching product:', error);
    return c.json({ error: 'Failed to fetch product' }, 500);
  }
});

// Criar produto (Admin)
app.post('/make-server-4e6d071e/products', async (c) => {
  try {
    const body = await c.req.json();
    
    // Validação básica
    if (!body.name || !body.price || !body.category) {
      return c.json({ error: 'Missing required fields: name, price, category' }, 400);
    }
    
    // Gerar ID incremental
    let counter = await kv.get('product_counter') || 0;
    counter++;
    await kv.set('product_counter', counter);
    
    const product = {
      id: counter,
      name: body.name,
      price: parseFloat(body.price),
      image: body.image || '',
      images: body.images || [],
      category: body.category,
      gender: body.gender || 'Unissex',
      sizes: body.sizes || ['P', 'M', 'G', 'GG'],
      supplier_link: body.supplier_link || '', // Link da Shein
      supplier_cost: parseFloat(body.supplier_cost) || 0, // Custo no fornecedor
      stock: parseInt(body.stock) || 999, // Estoque (999 = ilimitado para dropshipping)
      created_at: new Date().toISOString(),
    };
    
    await kv.set(`product:${counter}`, product);
    
    return c.json({ product, message: 'Product created successfully' }, 201);
  } catch (error) {
    console.log('Error creating product:', error);
    return c.json({ error: 'Failed to create product' }, 500);
  }
});

// Atualizar produto (Admin)
app.put('/make-server-4e6d071e/products/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    const existingProduct = await kv.get(`product:${id}`);
    if (!existingProduct) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    const updatedProduct = {
      ...existingProduct,
      ...body,
      id: parseInt(id), // Manter ID original
      updated_at: new Date().toISOString(),
    };
    
    await kv.set(`product:${id}`, updatedProduct);
    
    return c.json({ product: updatedProduct, message: 'Product updated successfully' });
  } catch (error) {
    console.log('Error updating product:', error);
    return c.json({ error: 'Failed to update product' }, 500);
  }
});

// Deletar produto (Admin)
app.delete('/make-server-4e6d071e/products/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    const product = await kv.get(`product:${id}`);
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    await kv.del(`product:${id}`);
    
    return c.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.log('Error deleting product:', error);
    return c.json({ error: 'Failed to delete product' }, 500);
  }
});

// ==================== PEDIDOS ====================

// Listar todos os pedidos (Admin)
app.get('/make-server-4e6d071e/orders', async (c) => {
  try {
    const orders = await kv.getByPrefix('order:');
    // Ordenar por data (mais recente primeiro)
    const sortedOrders = (orders || []).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return c.json({ orders: sortedOrders });
  } catch (error) {
    console.log('Error fetching orders:', error);
    return c.json({ error: 'Failed to fetch orders' }, 500);
  }
});

// Buscar pedido por ID
app.get('/make-server-4e6d071e/orders/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const order = await kv.get(`order:${id}`);
    
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }
    
    return c.json({ order });
  } catch (error) {
    console.log('Error fetching order:', error);
    return c.json({ error: 'Failed to fetch order' }, 500);
  }
});

// Criar pedido (Checkout)
app.post('/make-server-4e6d071e/orders', async (c) => {
  try {
    const body = await c.req.json();
    
    // Validação
    if (!body.items || !body.customer || !body.total) {
      return c.json({ error: 'Missing required fields: items, customer, total' }, 400);
    }
    
    // Gerar ID incremental
    let counter = await kv.get('order_counter') || 0;
    counter++;
    await kv.set('order_counter', counter);
    
    const order = {
      id: counter,
      items: body.items, // Array de produtos com quantidade e tamanho
      customer: {
        name: body.customer.name,
        email: body.customer.email,
        phone: body.customer.phone,
        cpf: body.customer.cpf,
        address: {
          street: body.customer.address.street,
          number: body.customer.address.number,
          complement: body.customer.address.complement || '',
          neighborhood: body.customer.address.neighborhood,
          city: body.customer.address.city,
          state: body.customer.address.state,
          zip: body.customer.address.zip,
        },
      },
      total: parseFloat(body.total),
      status: 'aguardando_pagamento', // aguardando_pagamento, pago, comprado_fornecedor, enviado, entregue, cancelado
      payment_method: body.payment_method || 'pix', // pix, credit_card, boleto
      payment_id: body.payment_id || null,
      tracking_code: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    await kv.set(`order:${counter}`, order);
    
    console.log(`✅ New order created: #${counter} - ${body.customer.name} - R$ ${body.total}`);
    
    return c.json({ order, message: 'Order created successfully' }, 201);
  } catch (error) {
    console.log('Error creating order:', error);
    return c.json({ error: 'Failed to create order' }, 500);
  }
});

// Atualizar status do pedido (Admin)
app.patch('/make-server-4e6d071e/orders/:id/status', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    const order = await kv.get(`order:${id}`);
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }
    
    const updatedOrder = {
      ...order,
      status: body.status,
      tracking_code: body.tracking_code || order.tracking_code,
      updated_at: new Date().toISOString(),
    };
    
    await kv.set(`order:${id}`, updatedOrder);
    
    console.log(`📦 Order #${id} status updated: ${body.status}`);
    
    return c.json({ order: updatedOrder, message: 'Order status updated' });
  } catch (error) {
    console.log('Error updating order status:', error);
    return c.json({ error: 'Failed to update order status' }, 500);
  }
});

// ==================== CONFIGURAÇÕES ====================

// Buscar configurações da loja (prazo de entrega, avisos, etc)
app.get('/make-server-4e6d071e/settings', async (c) => {
  try {
    let settings = await kv.get('store_settings');
    
    if (!settings) {
      // Configurações padrão
      settings = {
        delivery_days_min: 15,
        delivery_days_max: 30,
        delivery_warning: '⚠️ Prazo de entrega: 15-30 dias úteis (produto importado)',
        whatsapp: '5511999999999',
        instagram: '@crstreet',
        email: 'contato@crstreet.com.br',
      };
      await kv.set('store_settings', settings);
    }
    
    return c.json({ settings });
  } catch (error) {
    console.log('Error fetching settings:', error);
    return c.json({ error: 'Failed to fetch settings' }, 500);
  }
});

// Atualizar configurações (Admin)
app.put('/make-server-4e6d071e/settings', async (c) => {
  try {
    const body = await c.req.json();
    await kv.set('store_settings', body);
    return c.json({ settings: body, message: 'Settings updated' });
  } catch (error) {
    console.log('Error updating settings:', error);
    return c.json({ error: 'Failed to update settings' }, 500);
  }
});

// ==================== WEBHOOK MERCADO PAGO ====================

// Webhook para receber notificações de pagamento
app.post('/make-server-4e6d071e/webhook/mercadopago', async (c) => {
  try {
    const body = await c.req.json();
    
    console.log('🔔 Mercado Pago webhook received:', body);
    
    // Aqui você processaria a notificação do Mercado Pago
    // Por enquanto, apenas logamos
    
    return c.json({ received: true });
  } catch (error) {
    console.log('Error processing webhook:', error);
    return c.json({ error: 'Webhook processing failed' }, 500);
  }
});

// ==================== INICIALIZAÇÃO ====================

// Rota de health check
app.get('/make-server-4e6d071e/health', (c) => {
  return c.json({ status: 'ok', message: 'C&R Street API is running' });
});

console.log('🚀 C&R Street Backend started!');

Deno.serve(app.fetch);
