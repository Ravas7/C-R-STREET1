import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { CartItem } from '../App';
// Importa o componente do toast para usar em caso de sucesso

interface CheckoutProps {
  items: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const WHATSAPP_NUMBER = "5571993678190"; 
const FREE_SHIPPING_THRESHOLD = 200.00; // Limite para Frete Grátis

export function Checkout({ items, isOpen, onClose, onSuccess }: CheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [cep, setCep] = useState('');
  const [baseShippingCost, setBaseShippingCost] = useState<number | null>(null); // Guarda a taxa base (ou null)
  
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
          setBaseShippingCost(null); 
      }
  }, [isOpen]);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // CÁLCULO SEGURO DO CUSTO FINAL (Síncrono)
  const calculateFinalShipping = (subtotal: number): number => {
    if (baseShippingCost === null) return 0; 
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : baseShippingCost;
  };
  
  const finalShippingCost = calculateFinalShipping(subtotal);
  const total = subtotal + finalShippingCost; 


  // 1. Busca Endereço e Calcula Frete Base
  async function handleCepBlur() {
    if (cep.length !== 8) {
        setBaseShippingCost(null); // Limpa o frete se o CEP não estiver completo
        return;
    }
    
    setLoadingCep(true);
    let calculatedBaseCost = 0; 

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        toast.error("CEP não encontrado");
        calculatedBaseCost = 0;
        setBaseShippingCost(0);
        return;
      }

      // 🛑 CORRIGIDO: Mudar o estado do formulário primeiro
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

      // CORRIGIDO: Remover toast.success e apenas atualizar o estado base
      setBaseShippingCost(calculatedBaseCost); 
      
      // O React recalcula o custo final (Frete Grátis) de forma segura agora.


    } catch (error) {
      // 🛑 CORRIGIDO: Mudar o estado para null em caso de falha de conexão
      setBaseShippingCost(null);
      toast.error("Erro ao buscar CEP ou calcular frete");
    } finally {
      setLoadingCep(false);
    }
  }

  // 2. SALVA o Pedido e Redireciona para o WhatsApp
  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    // Certifica-se de que o CEP foi calculado
    if (baseShippingCost === null) {
        toast.error("Por favor, digite e confirme o CEP para calcular o frete.");
        setLoading(false);
        return;
    }

    // Constrói a mensagem
    const itemDetails = items.map(item => 
        `${item.quantity}x ${item.name} (Tamanho: ${item.selectedSize}) - R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}`
    ).join('\n');

    const addressDetails = `
*--- DETALHES DO PEDIDO ---*
*Total:* R$ ${total.toFixed(2).replace('.', ',')} (${finalShippingCost > 0 ? `Frete: R$ ${finalShippingCost.toFixed(2).replace('.', ',')}` : 'FRETE GRÁTIS'})

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
        
        // CORRIGIDO: Toast só é chamado após o carregamento da página
        const encodedMessage = encodeURIComponent(addressDetails);
        const whatsappLink = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=Ol%C3%A1%2C%20C%26R%20Street%21%20Gostaria%20de%20finalizar%20o%20pedido%20que%20acabei%20de%20de%20fazer.%0A%0A${encodedMessage}`;
        
        window.location.href = whatsappLink;
        // O toast de sucesso pode ser chamado aqui ou no onSuccess
        // Não vamos chamar o toast de sucesso para evitar o erro #310 na transição
        onClose(); // Fecha o modal
        onSuccess(); // Limpa o carrinho
        
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
                    onBlur={handleCepBlur} // Chamada para buscar o CEP
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
                {finalShippingCost === 0 && subtotal >= FREE_SHIPPING_THRESHOLD ? (
                    <span className="text-green-400 font-bold">GRÁTIS!</span>
                ) : (
                    <span>R$ {finalShippingCost.toFixed(2)}</span>
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
              disabled={loading || baseShippingCost === null} 
              className="w-full mt-6 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-3 rounded transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Finalizar Pedido e Pagar via WhatsApp/PIX"}
            </button>
            
            {/* Mensagem de status do CEP */}
            {baseShippingCost === null && cep.length < 8 && (
              <p className="text-xs text-center text-zinc-500 mt-2">Digite o CEP para calcular o frete</p>
            )}
            {baseShippingCost === null && cep.length === 8 && !loadingCep && (
                <p className="text-xs text-center text-amber-500 mt-2">Clique fora do campo CEP para calcular.</p>
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
