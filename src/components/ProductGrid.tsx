import { ProductCard } from './ProductCard';
import type { Product } from '../App';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product, selectedSize: string) => void;
}

export function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
}
