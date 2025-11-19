import { useState, useEffect } from 'react';
import { Package, ShoppingCart, Plus, Edit2, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { getProducts, getOrders, createProduct, updateProduct, deleteProduct, updateOrderStatus } from '../utils/api';
import { toast } from 'sonner@2.0.3';

export function Admin() {
  const [tab, setTab] = useState<'products' | 'orders'>('products');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    image: '',
    category: 'Camisetas',
    gender: 'Unissex',
    sizes: 'P,M,G,GG',
    supplier_link: '',
    supplier_cost: '',
  });

  useEffect(() => {
    loadData();
  }, [tab]);

  async function loadData() {
    setLoading(true);
    try {
      if (tab === 'products') {
        const data = await getProducts();
        setProducts(data);
      } else {
        const data = await getOrders();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProduct() {
    try {
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        supplier_cost: parseFloat(productForm.supplier_cost) || 0,
        sizes: productForm.sizes.split(',').map(s => s.trim()),
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        toast.success('Produto atualizado!');
      } else {
        await createProduct(productData);
        toast.success('Produto criado!');
      }

      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm({
        name: '',
        price: '',
        image: '',
        category: 'Camisetas',
        gender: 'Unissex',
        sizes: 'P,M,G,GG',
        supplier_link: '',
        supplier_cost: '',
      });
      loadData();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Erro ao salvar produto');
    }
  }

  async function handleDeleteProduct(id: number) {
    if (!confirm('Tem certeza que deseja deletar este produto?')) return;
    
    try {
      await deleteProduct(id);
      toast.success('Produto deletado!');
      loadData();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Erro ao deletar produto');
    }
  }

  async function handleUpdateOrderStatus(id: number, status: string, tracking?: string) {
    try {
      await updateOrderStatus(id, status, tracking);
      toast.success('Status atualizado!');
      loadData();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Erro ao atualizar pedido');
    }
  }

  function handleEditProduct(product: any) {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      image: product.image,
      category: product.category,
      gender: product.gender || 'Unissex',
      sizes: product.sizes.join(','),
      supplier_link: product.supplier_link || '',
      supplier_cost: product.supplier_cost?.toString() || '',
    });
    setShowProductForm(true);
  }

  const statusColors: Record<string, string> = {
    aguardando_pagamento: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    pago: 'bg-green-500/20 text-green-400 border-green-500/30',
    comprado_fornecedor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    enviado: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    entregue: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    cancelado: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const statusLabels: Record<string, string> = {
    aguardando_pagamento: 'Aguardando Pagamento',
    pago: 'Pago',
    comprado_fornecedor: 'Comprado no Fornecedor',
    enviado: 'Enviado',
    entregue: 'Entregue',
    cancelado: 'Cancelado',
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl mb-2 bg-gradient-to-r from-yellow-500 to-amber-400 bg-clip-text text-transparent">
            Painel Administrativo
          </h1>
          <p className="text-zinc-400">Gerencie produtos e pedidos da C&R Street</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-zinc-800">
          <button
            onClick={() => setTab('products')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
              tab === 'products'
                ? 'border-amber-500 text-white'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Package className="w-5 h-5" />
            Produtos
          </button>
          <button
            onClick={() => setTab('orders')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
              tab === 'orders'
                ? 'border-amber-500 text-white'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            Pedidos ({orders.length})
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : (
          <>
            {/* Produtos */}
            {tab === 'products' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl">Produtos ({products.length})</h2>
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setShowProductForm(true);
                    }}
                    className="flex items-center gap-2 bg-gradient-to-r from-yellow-600 to-amber-500 text-black px-4 py-2 rounded hover:from-yellow-500 hover:to-amber-400 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Novo Produto
                  </button>
                </div>

                {showProductForm && (
                  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-zinc-900 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                      <h3 className="text-xl mb-4">
                        {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-zinc-400 mb-2">Nome *</label>
                          <input
                            type="text"
                            value={productForm.name}
                            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-zinc-400 mb-2">Preço (R$) *</label>
                            <input
                              type="number"
                              step="0.01"
                              value={productForm.price}
                              onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                              className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-zinc-400 mb-2">Custo Fornecedor (R$)</label>
                            <input
                              type="number"
                              step="0.01"
                              value={productForm.supplier_cost}
                              onChange={(e) => setProductForm({ ...productForm, supplier_cost: e.target.value })}
                              className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm text-zinc-400 mb-2">URL da Imagem *</label>
                          <input
                            type="text"
                            value={productForm.image}
                            onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                            placeholder="https://..."
                            className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-zinc-400 mb-2">Categoria *</label>
                            <select
                              value={productForm.category}
                              onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                              className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 focus:outline-none focus:border-amber-500"
                            >
                              <option value="Camisetas">Camisetas</option>
                              <option value="Moletons">Moletons</option>
                              <option value="Calças">Calças</option>
                              <option value="Calçados">Calçados</option>
                              <option value="Acessórios">Acessórios</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm text-zinc-400 mb-2">Gênero</label>
                            <select
                              value={productForm.gender}
                              onChange={(e) => setProductForm({ ...productForm, gender: e.target.value })}
                              className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 focus:outline-none focus:border-amber-500"
                            >
                              <option value="Masculino">Masculino</option>
                              <option value="Feminino">Feminino</option>
                              <option value="Unissex">Unissex</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm text-zinc-400 mb-2">Tamanhos (separados por vírgula) *</label>
                          <input
                            type="text"
                            value={productForm.sizes}
                            onChange={(e) => setProductForm({ ...productForm, sizes: e.target.value })}
                            placeholder="P,M,G,GG"
                            className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-zinc-400 mb-2">Link Fornecedor (Shein, etc)</label>
                          <input
                            type="text"
                            value={productForm.supplier_link}
                            onChange={(e) => setProductForm({ ...productForm, supplier_link: e.target.value })}
                            placeholder="https://..."
                            className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div className="flex gap-4 pt-4">
                          <button
                            onClick={() => {
                              setShowProductForm(false);
                              setEditingProduct(null);
                            }}
                            className="flex-1 bg-zinc-800 text-white py-2 rounded hover:bg-zinc-700 transition-all"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={handleSaveProduct}
                            className="flex-1 bg-gradient-to-r from-yellow-600 to-amber-500 text-black py-2 rounded hover:from-yellow-500 hover:to-amber-400 transition-all"
                          >
                            Salvar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <div key={product.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded mb-3"
                      />
                      <h3 className="mb-1">{product.name}</h3>
                      <p className="text-amber-400 mb-2">R$ {product.price.toFixed(2).replace('.', ',')}</p>
                      <div className="text-xs text-zinc-400 mb-3 space-y-1">
                        <p>Categoria: {product.category}</p>
                        <p>Gênero: {product.gender || 'N/A'}</p>
                        <p>Tamanhos: {product.sizes?.join(', ')}</p>
                        {product.supplier_link && (
                          <a
                            href={product.supplier_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-400 hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Fornecedor
                          </a>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 text-white py-2 rounded hover:bg-zinc-700 transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="flex items-center justify-center gap-2 bg-red-500/20 text-red-400 px-3 py-2 rounded hover:bg-red-500/30 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {products.length === 0 && (
                  <div className="text-center py-20 text-zinc-400">
                    Nenhum produto cadastrado. Clique em "Novo Produto" para adicionar.
                  </div>
                )}
              </div>
            )}

            {/* Pedidos */}
            {tab === 'orders' && (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl mb-1">Pedido #{order.id}</h3>
                        <p className="text-sm text-zinc-400">
                          {new Date(order.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl bg-gradient-to-r from-yellow-500 to-amber-400 bg-clip-text text-transparent">
                          R$ {order.total.toFixed(2).replace('.', ',')}
                        </p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs border mt-2 ${
                            statusColors[order.status]
                          }`}
                        >
                          {statusLabels[order.status]}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <h4 className="text-sm text-zinc-400 mb-2">Cliente</h4>
                        <p>{order.customer.name}</p>
                        <p className="text-sm text-zinc-400">{order.customer.email}</p>
                        <p className="text-sm text-zinc-400">{order.customer.phone}</p>
                      </div>
                      <div>
                        <h4 className="text-sm text-zinc-400 mb-2">Endereço</h4>
                        <p className="text-sm">
                          {order.customer.address.street}, {order.customer.address.number}
                        </p>
                        <p className="text-sm">
                          {order.customer.address.neighborhood} - {order.customer.address.city}/{order.customer.address.state}
                        </p>
                        <p className="text-sm">CEP: {order.customer.address.zip}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm text-zinc-400 mb-2">Produtos</h4>
                      <div className="space-y-2">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-sm bg-zinc-800 p-2 rounded">
                            <span>
                              {item.quantity}x {item.name} ({item.selectedSize})
                            </span>
                            <span>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-4 py-2 focus:outline-none focus:border-amber-500"
                      >
                        <option value="aguardando_pagamento">Aguardando Pagamento</option>
                        <option value="pago">Pago</option>
                        <option value="comprado_fornecedor">Comprado no Fornecedor</option>
                        <option value="enviado">Enviado</option>
                        <option value="entregue">Entregue</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </div>
                  </div>
                ))}

                {orders.length === 0 && (
                  <div className="text-center py-20 text-zinc-400">
                    Nenhum pedido realizado ainda.
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
