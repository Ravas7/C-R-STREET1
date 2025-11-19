import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '../App';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, selectedSize: string) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [isAdded, setIsAdded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = product.images || [product.image];
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
    <div className="group">
      <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-lg bg-zinc-900">
        <ImageWithFallback
          src={images[currentImageIndex]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full">
          <span className="text-sm">{product.category}</span>
        </div>

        {hasMultipleImages && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/70 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/90"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/70 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/90"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImageIndex
                      ? 'bg-gradient-to-r from-yellow-600 to-amber-500 w-6'
                      : 'bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="mb-1">{product.name}</h3>
          <p className="text-zinc-400">
            R$ {product.price.toFixed(2).replace('.', ',')}
          </p>
        </div>

        <div>
          <p className="text-sm text-zinc-400 mb-2">Tamanho:</p>
          <div className="flex gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-2 border rounded transition-colors ${
                  selectedSize === size
                    ? 'border-yellow-600 bg-gradient-to-r from-yellow-600 to-amber-500 text-black'
                    : 'border-zinc-700 hover:border-yellow-600'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          className={`w-full py-3 rounded transition-all ${
            isAdded
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-gradient-to-r from-yellow-600 to-amber-500 text-black hover:from-yellow-500 hover:to-amber-400'
          }`}
        >
          {isAdded ? 'Adicionado!' : 'Adicionar ao Carrinho'}
        </button>
      </div>
    </div>
  );
}