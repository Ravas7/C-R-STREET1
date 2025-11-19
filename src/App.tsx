import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ProductGrid } from './components/ProductGrid';
import { Cart } from './components/Cart';
import { Checkout } from './components/Checkout';
import { Admin } from './components/Admin';
import { Footer } from './components/Footer';
import { getProducts, getSettings } from './utils/api';
import { Toaster, toast } from 'sonner';

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  images?: string[];
  category: string;
  gender?: 'Masculino' | 'Feminino' | 'Unissex';
  sizes: string[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
}

export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedGender, setSelectedGender] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [deliveryWarning, setDeliveryWarning] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Carregar produtos do backend
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [productsData, settingsData] = await Promise.all([
          getProducts(),
          getSettings(),
        ]);
        
        setProducts(productsData);
        if (settingsData?.delivery_warning) {
          setDeliveryWarning(settingsData.delivery_warning);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Verificar se está na página admin
  // Alterado para usar HASH (#) para funcionar no GitHub Pages
const isAdminPage = window.location.hash === '#admin';

  // Se for página admin, mostrar apenas o painel
  if (isAdminPage) {
    return (
      <>
        <Admin />
        <Toaster theme="dark" position="top-right" />
      </>
    );
  }

  const categories = ['Moletons', 'Camisetas', 'Calças', 'Calçados', 'Acessórios'];
  const genders = ['Masculino', 'Feminino', 'Unissex'];

  const addToCart = (product: Product, selectedSize: string) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.id === product.id && item.selectedSize === selectedSize
      );

      if (existingItem) {
        toast.success(`${product.name} (${selectedSize}) adicionado novamente!`);
        return prevItems.map((item) =>
          item.id === product.id && item.selectedSize === selectedSize
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      toast.success(`${product.name} (${selectedSize}) adicionado ao carrinho!`);
      return [...prevItems, { ...product, quantity: 1, selectedSize }];
    });
  };

  const removeFromCart = (id: number, selectedSize: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => !(item.id === id && item.selectedSize === selectedSize))
    );
  };

  const updateQuantity = (id: number, selectedSize: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(id, selectedSize);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id && item.selectedSize === selectedSize ? { ...item, quantity } : item
      )
    );
  };

  const filteredProducts = selectedCategory === 'Todos'
    ? products
    : products.filter((product) => product.category === selectedCategory);

  const finalFilteredProducts = selectedGender === 'Todos'
    ? filteredProducts
    : filteredProducts.filter((product) => 
        product.gender === selectedGender || 
        (product.category !== 'Camisetas' && product.category !== 'Calças')
      );

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const showProducts = selectedGender && selectedCategory;

  return (
    <div className="min-h-screen bg-black text-white">
      <Header
        cartItemsCount={totalItems}
        onCartClick={() => setIsCartOpen(true)}
      />
      
      <HeroSection />

      {deliveryWarning && (
        <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-y border-amber-500/30 py-3 px-6">
          <p className="text-center text-amber-200 text-sm max-w-4xl mx-auto">
            {deliveryWarning}
          </p>
        </div>
      )}

      <section id="produtos" className="px-6 py-16 max-w-7xl mx-auto">
        <div className="mb-12">
          <h2 className="mb-8">Produtos</h2>
          
          {/* Filtro de Gênero */}
          <div className="mb-6">
            <p className="text-sm text-zinc-400 mb-3">Gênero:</p>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {genders.map((gender) => (
                <button
                  key={gender}
                  onClick={() => setSelectedGender(gender)}
                  className={`px-6 py-2 rounded-full whitespace-nowrap transition-colors ${
                    selectedGender === gender
                      ? 'bg-gradient-to-r from-yellow-600 to-amber-500 text-black'
                      : 'bg-zinc-900 text-white hover:bg-zinc-800'
                  }`}
                >
                  {gender}
                </button>
              ))}
            </div>
          </div>

          {/* Filtro de Categoria */}
          <div className="mb-8">
            <p className="text-sm text-zinc-400 mb-3">Categoria:</p>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-yellow-600 to-amber-500 text-black'
                      : 'bg-zinc-900 text-white hover:bg-zinc-800'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {showProducts ? (
          <ProductGrid products={finalFilteredProducts} onAddToCart={addToCart} />
        ) : (
          <div className="text-center py-20">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 max-w-md mx-auto">
              <div className="text-5xl mb-4">👕</div>
              <h3 className="mb-3 text-xl">Escolha o Gênero e Categoria</h3>
              <p className="text-zinc-400">
                Por favor, selecione um gênero e uma categoria acima para visualizar nossos produtos.
              </p>
            </div>
          </div>
        )}
      </section>

      <section id="sobre" className="px-6 py-16 bg-zinc-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="mb-6">Sobre a C&R Street</h2>
            <p className="text-zinc-300 mb-4">
              Nascemos da paixão pela cultura urbana e pelo streetwear autêntico. A C&R Street é mais do que uma loja, é um estilo de vida que representa a essência das ruas.
            </p>
            <p className="text-zinc-300 mb-4">
              Cada peça da nossa coleção é cuidadosamente selecionada para refletir a identidade única de quem vive e respira a cultura street. Qualidade premium, design exclusivo e atitude são os pilares da nossa marca.
            </p>
            <p className="text-zinc-300">
              Vista-se com propósito. Vista C&R Street.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black p-6 rounded-lg border border-zinc-800">
              <div className="text-3xl mb-2 bg-gradient-to-r from-yellow-500 to-amber-400 bg-clip-text text-transparent">500+</div>
              <p className="text-zinc-400">Produtos</p>
            </div>
            <div className="bg-black p-6 rounded-lg border border-zinc-800">
              <div className="text-3xl mb-2 bg-gradient-to-r from-yellow-500 to-amber-400 bg-clip-text text-transparent">10K+</div>
              <p className="text-zinc-400">Clientes</p>
            </div>
            <div className="bg-black p-6 rounded-lg border border-zinc-800">
              <div className="text-3xl mb-2 bg-gradient-to-r from-yellow-500 to-amber-400 bg-clip-text text-transparent">5★</div>
              <p className="text-zinc-400">Avaliação</p>
            </div>
            <div className="bg-black p-6 rounded-lg border border-zinc-800">
              <div className="text-3xl mb-2 bg-gradient-to-r from-yellow-500 to-amber-400 bg-clip-text text-transparent">24/7</div>
              <p className="text-zinc-400">Atendimento</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <Cart
        items={cartItems}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <Checkout
        items={cartItems}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={() => {
          setCartItems([]);
          setIsCheckoutOpen(false);
        }}
      />

      <Toaster theme="dark" position="top-right" />
    </div>
  );
}