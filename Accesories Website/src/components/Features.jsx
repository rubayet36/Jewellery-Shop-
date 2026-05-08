import CategoryBox from "./Categorybox";

function Features({ categories, activeCategory = "", onSelect }) {
  return (
    <section id="features" className="py-16 bg-white rounded-t-2xl">
      <h2 className="text-3xl font-serif text-center mb-4 uppercase tracking-widest text-brand-brown">
        Shop By Category
      </h2>

      {activeCategory && (
        <p className="text-center text-sm text-brand-rust mb-8">
          Showing: <strong>{activeCategory}</strong> &nbsp;
          <button
            onClick={() => onSelect(activeCategory)}
            style={{
              color: "#a44f31",
              fontWeight: "700",
              background: "none",
              border: "none",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Clear ✕
          </button>
        </p>
      )}
      {!activeCategory && <div className="mb-12" />}

      <div className="flex flex-wrap justify-center gap-8 md:gap-16 px-4">
        {categories.map((cat, index) => (
          <CategoryBox
            key={index}
            image={cat.image}
            name={cat.name}
            filterKey={cat.filterKey || cat.name}
            isActive={activeCategory === (cat.filterKey || cat.name)}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}

export default Features;
