function Hero() {
  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-[#fffafd]">
      <img src="/hero1.png
      " alt="Accessories collection" className="absolute inset-0 h-full w-full object-cover" />

      <div className="relative z-10 flex min-h-screen items-center px-6 pt-24 md:px-16 lg:px-24">
        <div className="max-w-xl text-[#5c3d4c]">
          <p className="mb-4 inline-flex rounded-full border border-[#ffccd5] bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] backdrop-blur-md cute-floating text-[#ff5d8f]">
            ✨ Pretty little things ✨
          </p>
          <h1 className="mb-5 text-5xl font-extrabold leading-tight text-[#831843] md:text-7xl">
            Blush pieces for every sweet moment 🎀
          </h1>
          <p className="mb-8 max-w-md text-base leading-7 text-[#5c3d4c] md:text-lg">
            Soft pink accessories, delicate shine, and cute everyday styling made to feel fresh and feminine.
          </p>
          <a
            href="#products-section"
            className="inline-flex items-center rounded-full bg-[#ff5d8f] px-7 py-3 text-sm font-extrabold uppercase tracking-[0.14em] text-white shadow-[0_18px_45px_rgba(255,93,143,0.18)] cute-bubble-btn"
          >
            Shop the best ✨
          </a>
        </div>
      </div>
    </section>
  );
}

export default Hero;
