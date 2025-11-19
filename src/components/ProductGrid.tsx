import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '../App';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, selectedSize: string) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  // Pega o primeiro tamanho disponível como padrão
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all group flex flex-col h-full">
      {/* Área da Imagem */}
      <div className="aspect-[3/4] relative overflow-hidden bg-zinc-800">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            // Se a imagem falhar, mostra um quadrado cinza (Fallback)
            (e.target as HTMLImageElement).src = 'https://placehold.co/400x600/27272a/FFF?text=Sem+Imagem';
          }}
        />
        
        {/* Tag de Gênero (Opcional) */}
        {product.gender && (
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
            {product.gender}
          </div>
        )}
      </div>

      {/* Detalhes do Produto */}
      <div className="p-4 flex flex-col flex-1">
        <div className="mb-auto">
          <h3 className="text-lg font-medium text-white mb-1">{product.name}</h3>
          <p className="text-sm text-zinc-500 mb-2">{product.category}</p>
          <p className="text-amber-500 font-bold text-xl mb-4">
            R$ {product.price.toFixed(2).replace('.', ',')}
          </p>
        </div>

        {/* Seletor de Tamanho */}
        <div className="mb-4">
          <p className="text-xs text-zinc-500 mb-2">Tamanho:</p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`min-w-[32px] h-8 px-2 rounded flex items-center justify-center text-sm transition-colors border ${
                  selectedSize === size
                    ? 'bg-white text-black border-white font-bold'
                    : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Botão de Comprar */}
        <button
          onClick={() => onAddToCart(product, selectedSize)}
          className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-colors active:scale-95 border border-zinc-700 hover:border-zinc-600"
        >
          <ShoppingCart className="w-4 h-4" />
          Adicionar ao Carrinho
        </button>
      </div>
    </div>
  );
}
