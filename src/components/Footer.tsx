import { Instagram, Facebook, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-black border-t border-zinc-800 px-6 py-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="mb-4 text-xl">C&R STREET</h3>
          <p className="text-zinc-400 text-sm">
            Moda streetwear autêntica para quem vive o estilo urbano.
          </p>
        </div>

        <div>
          <h4 className="mb-4">Atendimento</h4>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Fale Conosco
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Trocas e Devoluções
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Entregas
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Perguntas Frequentes
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4">Institucional</h4>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Sobre Nós
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Trabalhe Conosco
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Termos de Uso
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Política de Privacidade
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4">Redes Sociais</h4>
          <div className="flex gap-4">
            <a
              href="#"
              className="p-2 bg-zinc-800 hover:bg-gradient-to-r hover:from-yellow-600 hover:to-amber-500 rounded-lg transition-all"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="p-2 bg-zinc-800 hover:bg-gradient-to-r hover:from-yellow-600 hover:to-amber-500 rounded-lg transition-all"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="p-2 bg-zinc-800 hover:bg-gradient-to-r hover:from-yellow-600 hover:to-amber-500 rounded-lg transition-all"
            >
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-zinc-800 text-center text-sm text-zinc-500">
        <p>&copy; 2025 C&R Street. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}