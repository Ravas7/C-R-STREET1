import { useState, useEffect } from 'react'; // useMemo removido
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { CartItem } from '../App';
// REMOVIDO: import axios from 'axios'; 
// import { createOrder } from '../utils/api'; 

interface CheckoutProps {
  items: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// ⚠️ Mude este número para o seu WhatsApp (71993678190)
const WHATSAPP_NUMBER = "5571993678190"; 
const FREE_SHIPPING_THRESHOLD = 200.00; // Limite para Frete Grátis

export function Checkout({ items, isOpen, onClose, onSuccess }: CheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [cep, setCep] = useState('');
  const [shippingCost, setShippingCost] = useState(0); // Apenas um estado de custo final
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    complement: ''
  });

  useEffect(() => {
      if (!isOpen) {
          setCep('');
          setShippingCost(0); // Limpa o custo final
      }
  }, [isOpen]);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // CORRIGIDO: Cálculo de Total Simples
  const total = subtotal + shippingCost; 

  // NOVO: Função de Cálculo de Frete Simples (Para mensagens)
  const calculateFinalShipping = (baseCost: number, currentSubtotal: number): number => {
    return currentSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : baseCost;
  };
  
  // 1. Busca Endereço e Calcula Frete Base
  async function handleCepBlur() {
    if (cep.length !== 8) return;
    
    setLoadingCep(true);
    let calculatedBaseCost = 0; 

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        toast.error("CEP não encontrado");
        calculatedBaseCost = 0;
        return;
      }

      setFormData(prev => ({
        ...prev,
        street: data.logradouro,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf
      }));

      // Lógica Simples de Frete (Valores Base)
      const sudeste = ['SP', 'RJ', 'MG', 'ES'];
      const sul = ['PR', 'SC', 'RS'];
      
      if (sudeste.includes(data.uf)) {
        calculatedBaseCost = 20.00;
      } else if (sul.includes(data.uf)) {
        calculatedBaseCost = 30.00;
      } else {
        calculatedBaseCost = 45.00;
      }

      // CORRIGIDO: Calcula e define o custo final (com a regra de R$ 200) diretamente
      const finalCost = calculateFinalShipping(calculatedBaseCost, subtotal);
      setShippingCost(finalCost); // Define o custo final no estado
      
      if (finalCost === 0) {
        toast.success("Frete Grátis aplicado! Total acima de R$ 200.");
      } else {
        toast.success(`Frete aplicado: R$ ${finalCost.toFixed(2).replace('.', ',')}`);
      }


    } catch (error) {
      toast.error("Erro ao buscar CEP ou calcular frete");
    } finally {
      setLoadingCep(false);
    }
  }

  // 2. SALVA o Pedido e Redireciona para o WhatsApp
  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    const itemDetails = items.map(item => 
        `${item.quantity}x ${item.name} (Tamanho: ${item.selectedSize}) - R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}`
    ).join('\n');

    const addressDetails = `
*--- DETALHES DO PEDIDO ---*
*Total:* R$ ${total.toFixed(2).replace('.', ',')} (${shippingCost > 0 ? `Frete: R$ ${shippingCost.toFixed(2).replace('.', ',')}` : 'FRETE GRÁTIS'})

*Endereço:*
${formData.street}, ${formData.number} ${formData.complement ? `(${formData.complement})` : ''}
Bairro: ${formData.neighborhood}
CEP: ${cep}
${formData.city}/${formData.state}

*Cliente:* ${formData.name}
*E-mail:* ${formData.email}
*Telefone:* ${formData.phone}

*Itens:*
${itemDetails}
    `.trim();

    try {
        // ⚠️ Aqui você faria: await createOrder(orderData); 
        
        toast.success("Pedido finalizado! A abrir o WhatsApp...");
        
        const encodedMessage = encodeURIComponent(addressDetails);
        const whatsappLink = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=Ol%C3%A1%2C%20C%26R%20Street%21%20Gostaria%20de%20finalizar%20o%20pedido%20que%20acabei%20de%20fazer.%0A%0A${encodedMessage}`;
        
        window.location.href = whatsappLink;
        onSuccess(); 
        
    } catch (error) {
        console.error("Erro ao processar pedido:", error);
        toast.error("Erro ao redirecionar para o WhatsApp. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-zinc-900 w-full max-w-2xl rounded-xl border border-zinc-800 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        <div className="sticky top-0 bg-zinc-900 p-4 border-b border-zinc-800 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold">Finalizar Compra</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 grid gap-8 md:grid-cols-2">
          {/* Formulário */}
          <form id="checkout-form" onSubmit={handlePayment} className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-zinc-400 mb-3">Dados de Entrega</h3>
              <div className="grid gap-3">
                <div className="relative">
                  <input
                    required
                    placeholder="CEP (apenas números)"
                    value={cep}
                    onChange={e => setCep(e.target.value.replace(/\D/g, ''))}
                    onBlur={handleCepBlur}
                    maxLength={8}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 pl-3"
                  />
                  {loadingCep && <Loader2 className="absolute right-3 top-2.5 w-4 h-4 animate-spin text-amber-500"/>}
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <input readOnly placeholder="Rua" value={formData.street} className="col-span-2 bg-zinc-900/50 border border-zinc-800 rounded p-2 text-zinc-500" />
                  <input required placeholder="Número" value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} className="bg-zinc-950 border border-zinc-800 rounded p-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <input readOnly placeholder="Bairro" value={formData.neighborhood} className="bg-zinc-900/50 border border-zinc-800 rounded p-2 text-zinc-500" />
                  <input readOnly placeholder="Cidade/UF" value={`${formData.city}/${formData.state}`} className="bg-zinc-900/50 border border-zinc-800 rounded p-2 text-zinc-500" />
                </div>

                <input 
                  required 
                  placeholder="Nome Completo" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="bg-zinc-950 border border-zinc-800 rounded p-2"
                />
                <input 
                  required 
                  type="email"
                  placeholder="E-mail" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="bg-zinc-950 border border-zinc-800 rounded p-2"
                />
                <input 
                  required 
                  type="tel"
                  placeholder="Telefone (para contato)" 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="bg-zinc-950 border border-zinc-800 rounded p-2"
                />
                <input 
                  placeholder="Complemento (ex: Apartamento 101)" 
                  value={formData.complement}
                  onChange={e => setFormData({...formData, complement: e.target.value})}
                  className="bg-zinc-950 border border-zinc-800 rounded p-2"
                />
              </div>
            </div>
          </form>

          {/* Resumo */}
          <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 h-fit">
            <h3 className="text-sm font-medium text-zinc-400 mb-4">Resumo do Pedido</h3>
            <div className="space-y-3 mb-4 max-h-40 overflow-y-auto pr-2">
              {items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-zinc-300">{item.quantity}x {item.name} ({item.selectedSize})</span>
                  <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="space-y-2 border-t border-zinc-800 pt-4 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Frete</span>
                {shippingCost === 0 && subtotal >= FREE_SHIPPING_THRESHOLD ? (
                    <span className="text-green-400 font-bold">GRÁTIS!</span>
                ) : (
                    <span>R$ {shippingCost.toFixed(2)}</span>
                )}
              </div>
              <div className="flex justify-between text-lg font-bold text-white pt-2">
                <span>Total</span>
                <span className="text-amber-500">R$ {total.toFixed(2)}</span>
              </div>
            </div>
            
            {/* Mensagem de Frete Grátis Condicional */}
            {subtotal < FREE_SHIPPING_THRESHOLD && (
                <p className="text-xs text-center text-zinc-500 mt-4">
                    Adicione mais R$ {(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2).replace('.', ',')} para Frete Grátis!
                </p>
            )}

            <button
              type="submit"
              form="checkout-form"
              disabled={loading || shippingCost === 0 && cep.length < 8} 
              className="w-full mt-6 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-3 rounded transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Finalizar Pedido e Pagar via WhatsApp/PIX"}
            </button>
            
            {shippingCost === 0 && cep.length < 8 && (
              <p className="text-xs text-center text-zinc-500 mt-2">Digite o CEP para calcular o frete</p>
            )}
            
            <p className="text-xs text-center text-zinc-400 mt-4">
              Ao finalizar, o pedido completo será enviado para o WhatsApp para você confirmar o pagamento (PIX ou outro método manual).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
