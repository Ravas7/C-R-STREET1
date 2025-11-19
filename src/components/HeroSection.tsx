export function HeroSection() {
  return (
    <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1695827163486-b86eac571321?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJlZXQlMjBmYXNoaW9uJTIwbW9kZWx8ZW58MXx8fHwxNzYzNTE2NDMwfDA&ixlib=rb-4.1.0&q=80&w=1080)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80"></div>
      </div>

      <div className="relative z-10 text-center max-w-4xl px-6">
        <h2 className="mb-6 text-5xl md:text-7xl tracking-tighter">
          STREETWEAR
          <br />
          <span className="bg-gradient-to-r from-yellow-500 to-amber-400 bg-clip-text text-transparent">AUTHENTICO</span>
        </h2>
        <p className="mb-8 text-xl text-zinc-300 max-w-2xl mx-auto">
          Estilo urbano que define sua identidade. Explore nossa coleção exclusiva.
        </p>
        <button className="bg-gradient-to-r from-yellow-600 to-amber-500 text-black px-8 py-4 hover:from-yellow-500 hover:to-amber-400 transition-all">
          Ver Coleção
        </button>
      </div>
    </section>
  );
}