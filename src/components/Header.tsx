import { ShoppingCart, Menu } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import logo from 'figma:asset/87106cf87c647a2a597cb3dc969bbcc48e9458cd.png';

interface HeaderProps {
  cartItemsCount: number;
  onCartClick: () => void;
}

export function Header({ cartItemsCount, onCartClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <ImageWithFallback 
            src={logo} 
            alt="C&R Street Logo" 
            className="h-20 w-auto"
          />
          <nav className="hidden md:flex gap-6">
            <a href="#produtos" className="text-zinc-400 hover:text-white transition-colors">
              Produtos
            </a>
            <a href="#sobre" className="text-zinc-400 hover:text-white transition-colors">
              Sobre
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onCartClick}
            className="relative p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-600 to-amber-500 text-black text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {cartItemsCount}
              </span>
            )}
          </button>
          <button className="md:hidden p-2 hover:bg-zinc-800 rounded-lg transition-colors">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
}