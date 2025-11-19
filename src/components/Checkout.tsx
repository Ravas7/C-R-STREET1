import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { CartItem } from '../App';
import axios from 'axios'; // Usaremos axios para gerar o link MP

interface CheckoutProps {
  items: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// ⚠️ CHAVE PÚBLICA DO MERCADO PAGO
// Obtém a chave pública (Public Key) que começa com 'APP_USR...'
// Esta chave é segura para ser usada no frontend, ao contrário do Access Token.
// Podes obtê-la nas Credenciais de Produção do Mercado Pago.
const MP_PUBLIC_KEY = "APP_USR-777b0a9f-f047-481e-a9cd-32af0dcdbf3e"; // ⚠️ ATUALIZE COM A TUA CHAVE PÚBLICA REAL

export function Checkout({ items, isOpen, onClose, onSuccess }: CheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [cep, setCep] = useState('');
  const [shippingCost, setShippingCost] = useState(0);
  
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

  // Limpa o estado quando o modal fecha
  useEffect(() => {
      if (!isOpen) {
          setCep('');
          setShippingCost(0);
      }
  }, [isOpen]);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + shippingCost;

  // 1. Busca Endereço e Calcula Frete (Simulado por Região)
  async function handleCepBlur() {
    if (cep.length !== 8) return;
    
    setLoadingCep(true);
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      const data = response.data;
      
      if (data.erro) {
        toast.error("CEP não encontrado");
        return;
      }

      setFormData(prev => ({
        ...prev,
        street: data.logradouro,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf
      }));

      // Lógica Simples de Frete (Simulação de Correios)
      const sudeste = ['SP', 'RJ', 'MG', 'ES'];
      const sul = ['PR', 'SC', 'RS'];
      
      if (sudeste.includes(data.uf)) {
        setShippingCost(20.00); 
        toast.success("Frete Sudeste aplicado: R$ 20,00");
      } else if (sul.includes(data.uf)) {
        setShippingCost(30.00); 
        toast.success("Frete Sul aplicado: R$ 30,00");
      } else {
        setShippingCost(45.00); 
        toast.success("Frete aplicado: R$ 45,00");
      }

    } catch (error) {
      toast.error("Erro ao buscar CEP ou calcular frete");
    } finally {
      setLoadingCep(false);
    }
  }

  // 2. Cria a Preferência de Pagamento no Mercado Pago (Frontend)
  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (!MP_PUBLIC_KEY.startsWith('APP_USR')) {
      toast.error("Erro: Atualize a chave pública do Mercado Pago no Checkout.tsx");
      setLoading(false);
      return;
    }

    try {
      // Cria a lista de itens para o Mercado Pago
      const mpItems = items.map(item => ({
        title: `${item.name} - Tam: ${item.selectedSize}`,
        quantity: item.quantity,
        unit_price: item.price,
        currency_id: 'BRL',
      }));

      // Adiciona o Frete
      if (shippingCost > 0) {
        mpItems.push({
          title: 'Frete / Entrega',
          quantity: 1,
          unit_price: shippingCost,
          currency_id: 'BRL',
        });
      }

      // ⚠️ ESTA CHAMADA REQUER UM ENDPOINT DE BACKEND (PREFERÊNCIA)
      // Como não temos backend, vamos usar um endpoint de testes públicos
      // para simular a criação da preferência.
      // O MP real deve ser chamado do teu servidor (Netlify Function - que custa).
      // Para o deploy funcionar, vamos simular o link:
      
      const testLink = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=MP-TEST-${Date.now()}`;
      
      // Abre o link simulado (num projeto real, isto seria o link do MP)
      window.location.href = testLink;
      onSuccess();

      // **NO CENÁRIO REAL SEM NETLIFY FUNCTIONS, TU DEVERIAS USAR UM BOTÃO DE PAGAMENTO EMBUTIDO DO MP, QUE É 100% FRONTEND**

    } catch (error) {
      console.error(error);
      toast.error("Erro ao processar pedido. (Sem Servidor: use botão MP)");
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
                <span>R$ {shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-white pt-2">
                <span>Total</span>
                <span className="text-amber-500">R$ {total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={loading || shippingCost === 0}
              className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3 rounded transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Pagar (Aguarde Confirmação do Pedido)"}
            </button>
            
            {shippingCost === 0 && cep.length === 8 && (
              <p className="text-xs text-center text-amber-500 mt-2">Calculando frete...</p>
            )}
             {shippingCost === 0 && cep.length !== 8 && (
              <p className="text-xs text-center text-zinc-500 mt-2">Digite o CEP para calcular o frete</p>
            )}
            
            <p className="text-xs text-center text-red-400 mt-4">
              ⚠️ Alerta: O pagamento real requer um servidor (custos de backend). 
              Esta versão redireciona para um link de teste após a confirmação.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
