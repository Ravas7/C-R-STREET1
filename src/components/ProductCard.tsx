import { useState } from 'react';
import { ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '../App';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, selectedSize: string) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  // Pega o primeiro tamanho disponível como padrão, ou 'U'
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || 'U');
  const [isAdded, setIsAdded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // CORREÇÃO: Cria a lista de imagens
  const images = (Array.isArray(product.image) ? product.image : (product.images || [product.image as string]))
    .filter(url => url && url.length > 0); // Filtra URLs vazias

  const hasMultipleImages = images.length > 1;

  const handleAddToCart = () => {
    onAddToCart(product, selectedSize);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="group bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all flex flex-col h-full">
      {/* Área da Imagem */}
      <div className="relative aspect-[3/4] overflow-hidden bg-zinc-800">
        <img
          src={images[currentImageIndex] || 'https://placehold.co/400x600/27272a/FFF?text=Sem+Imagem'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/400x600/27272a/FFF?text=Erro+Imagem';
          }}
        />
        
        {/* Categoria (Tag) */}
        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
          <span className="text-xs font-bold text-white uppercase tracking-wider">{product.category}</span>
        </div>

        {/* Setas de Navegação (Só se tiver + de 1 imagem) */}
        {hasMultipleImages && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Bolinhas indicadoras */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentImageIndex
                      ? 'bg-amber-500 w-6'
                      : 'bg-white/50 w-1.5 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Informações */}
      <div className="p-4 flex flex-col flex-1">
        <div className="mb-auto">
          <h3 className="text-lg font-medium text-white mb-1">{product.name}</h3>
          <p className="text-amber-500 font-bold text-xl mb-4">
            R$ {product.price.toFixed(2).replace('.', ',')}
          </p>
        </div>

        {/* Seleção de Tamanho */}
        <div className="mb-4">
          <p className="text-xs text-zinc-500 mb-2 font-medium uppercase">Tamanho</p>
          <div className="flex flex-wrap gap-2">
            {product.sizes?.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`min-w-[36px] h-9 px-2 rounded-md flex items-center justify-center text-sm font-medium transition-all border ${
                  selectedSize === size
                    ? 'bg-white text-black border-white shadow-sm'
                    : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500 hover:text-zinc-200'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Botão de Adicionar */}
        <button
          onClick={handleAddToCart}
          className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
            isAdded
              ? 'bg-green-600 text-white hover:bg-green-500'
              : 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600'
          }`}
        >
          {isAdded ? (
            'Adicionado!'
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              Adicionar ao Carrinho
            </>
          )}
        </button>
      </div>
    </div>
  );
}
