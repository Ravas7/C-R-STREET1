import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { CartItem } from '../App';

interface CartProps {
  items: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateQuantity: (id: number, selectedSize: string, quantity: number) => void;
  onRemoveItem: (id: number, selectedSize: string) => void;
  onCheckout: () => void;
}

export function Cart({ items, isOpen, onClose, onUpdateQuantity, onRemoveItem, onCheckout }: CartProps) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      ></div>

      <div className="fixed right-0 top-0 h-full w-full md:w-[450px] bg-zinc-900 z-50 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-xl">Carrinho</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <ShoppingBag className="w-16 h-16 text-zinc-700 mb-4" />
            <p className="text-zinc-400 mb-2">Seu carrinho está vazio</p>
            <p className="text-sm text-zinc-500">Adicione produtos para continuar</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.selectedSize}`}
                  className="flex gap-4 bg-zinc-800 p-4 rounded-lg"
                >
                  <div className="w-24 h-24 rounded overflow-hidden bg-zinc-700 flex-shrink-0">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between mb-2">
                      <div>
                        <h3 className="text-sm mb-1">{item.name}</h3>
                        <p className="text-xs text-zinc-400">Tamanho: {item.selectedSize}</p>
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.id, item.selectedSize)}
                        className="text-zinc-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2 bg-zinc-700 rounded">
                        <button
                          onClick={() =>
                            onUpdateQuantity(item.id, item.selectedSize, item.quantity - 1)
                          }
                          className="p-2 hover:bg-zinc-600 rounded transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() =>
                            onUpdateQuantity(item.id, item.selectedSize, item.quantity + 1)
                          }
                          className="p-2 hover:bg-zinc-600 rounded transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-sm">
                        R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-800 p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg">Total</span>
                <span className="text-2xl bg-gradient-to-r from-yellow-500 to-amber-400 bg-clip-text text-transparent">R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>
              <button className="w-full bg-gradient-to-r from-yellow-600 to-amber-500 text-black py-4 rounded hover:from-yellow-500 hover:to-amber-400 transition-all" onClick={onCheckout}>
                Finalizar Compra
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}