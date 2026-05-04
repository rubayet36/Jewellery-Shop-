import CategoryBox from "./Categorybox";

function Features({ categories }) {
  return (
    <section id="features" className="py-16 bg-white">
      <h2 className="text-3xl font-serif text-center mb-12 uppercase tracking-widest text-brand-brown">
        Shop By Category
      </h2>
      
      <div className="flex flex-wrap justify-center gap-8 md:gap-16 px-4">
        {categories.map((cat, index) => (
          <CategoryBox 
            key={index} 
            image={cat.image} 
            name={cat.name}
          />
        ))}
      </div>
    </section>
  );
}

export default Features;