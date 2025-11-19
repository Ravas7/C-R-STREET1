import { useState } from 'react';
import { X, CreditCard, Smartphone, Loader2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { CartItem } from '../App';
import { createOrder } from '../utils/api';
import { toast } from 'sonner@2.0.3';

interface CheckoutProps {
  items: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function Checkout({ items, isOpen, onClose, onSuccess }: CheckoutProps) {
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zip: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix');
  const [orderId, setOrderId] = useState<number | null>(null);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.name || !formData.email || !formData.phone || !formData.cpf ||
        !formData.street || !formData.number || !formData.neighborhood || 
        !formData.city || !formData.state || !formData.zip) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setStep('payment');
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    
    try {
      // Criar pedido no backend
      const order = await createOrder({
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
        })),
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          cpf: formData.cpf,
          address: {
            street: formData.street,
            number: formData.number,
            complement: formData.complement,
            neighborhood: formData.neighborhood,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
          },
        },
        total,
        payment_method: paymentMethod,
      });

      setOrderId(order.id);
      setStep('success');
      toast.success('Pedido realizado com sucesso!');
      
      // Aguardar 3 segundos e chamar onSuccess
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Erro ao criar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
        onClick={onClose}
      ></div>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-zinc-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-zinc-800">
            <h2 className="text-xl">Finalizar Compra</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {step === 'form' && (
              <form onSubmit={handleSubmitForm} className="space-y-6">
                <div>
                  <h3 className="mb-4">Dados Pessoais</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm text-zinc-400 mb-2">Nome Completo *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">Telefone *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="(11) 99999-9999"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm text-zinc-400 mb-2">CPF *</label>
                      <input
                        type="text"
                        name="cpf"
                        value={formData.cpf}
                        onChange={handleInputChange}
                        placeholder="000.000.000-00"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4">Endereço de Entrega</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">CEP *</label>
                      <input
                        type="text"
                        name="zip"
                        value={formData.zip}
                        onChange={handleInputChange}
                        placeholder="00000-000"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">Rua *</label>
                      <input
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">Número *</label>
                      <input
                        type="text"
                        name="number"
                        value={formData.number}
                        onChange={handleInputChange}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">Complemento</label>
                      <input
                        type="text"
                        name="complement"
                        value={formData.complement}
                        onChange={handleInputChange}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">Bairro *</label>
                      <input
                        type="text"
                        name="neighborhood"
                        value={formData.neighborhood}
                        onChange={handleInputChange}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">Cidade *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">Estado *</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="SP"
                        maxLength={2}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-800 rounded-lg p-4">
                  <h3 className="mb-4">Resumo do Pedido</h3>
                  <div className="space-y-2 mb-4">
                    {items.map((item) => (
                      <div key={`${item.id}-${item.selectedSize}`} className="flex justify-between text-sm">
                        <span className="text-zinc-300">
                          {item.quantity}x {item.name} ({item.selectedSize})
                        </span>
                        <span>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-zinc-700 pt-4 flex justify-between items-center">
                    <span className="text-lg">Total</span>
                    <span className="text-2xl bg-gradient-to-r from-yellow-500 to-amber-400 bg-clip-text text-transparent">
                      R$ {total.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-yellow-600 to-amber-500 text-black py-4 rounded hover:from-yellow-500 hover:to-amber-400 transition-all"
                >
                  Continuar para Pagamento
                </button>
              </form>
            )}

            {step === 'payment' && (
              <div className="space-y-6">
                <div>
                  <h3 className="mb-4">Método de Pagamento</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setPaymentMethod('pix')}
                      className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                        paymentMethod === 'pix'
                          ? 'border-amber-500 bg-amber-500/10'
                          : 'border-zinc-700 hover:border-zinc-600'
                      }`}
                    >
                      <Smartphone className="w-6 h-6" />
                      <div className="text-left">
                        <p>PIX</p>
                        <p className="text-sm text-zinc-400">Aprovação instantânea</p>
                      </div>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('credit_card')}
                      className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                        paymentMethod === 'credit_card'
                          ? 'border-amber-500 bg-amber-500/10'
                          : 'border-zinc-700 hover:border-zinc-600'
                      }`}
                    >
                      <CreditCard className="w-6 h-6" />
                      <div className="text-left">
                        <p>Cartão de Crédito</p>
                        <p className="text-sm text-zinc-400">Em até 12x</p>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                  <p className="text-amber-200 text-sm">
                    ⚠️ <strong>Importante:</strong> Após a confirmação do pagamento, seu pedido será processado e enviado em 15-30 dias úteis (produto importado).
                  </p>
                </div>

                <div className="bg-zinc-800 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span>Subtotal</span>
                    <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span>Frete</span>
                    <span className="text-green-400">GRÁTIS</span>
                  </div>
                  <div className="border-t border-zinc-700 pt-4 mt-4 flex justify-between items-center">
                    <span className="text-lg">Total</span>
                    <span className="text-2xl bg-gradient-to-r from-yellow-500 to-amber-400 bg-clip-text text-transparent">
                      R$ {total.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep('form')}
                    className="flex-1 bg-zinc-800 text-white py-4 rounded hover:bg-zinc-700 transition-all"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleConfirmPayment}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-yellow-600 to-amber-500 text-black py-4 rounded hover:from-yellow-500 hover:to-amber-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      'Confirmar Pedido'
                    )}
                  </button>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl mb-4">Pedido Realizado com Sucesso!</h3>
                <p className="text-zinc-400 mb-2">Número do pedido: <span className="text-amber-400">#{orderId}</span></p>
                <p className="text-zinc-400 mb-6">
                  Você receberá um email de confirmação em breve com os detalhes do seu pedido.
                </p>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-sm text-amber-200">
                  📦 Prazo de entrega: 15-30 dias úteis
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
