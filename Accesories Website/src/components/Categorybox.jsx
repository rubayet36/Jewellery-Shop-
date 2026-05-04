function CategoryBox({image,name}) {
  return (
    <div className="flex flex-col items-center group cursor-pointer">
      <div className="p-1.5 border border-gray-300 rounded-full mb-4 transition-transform group-hover:scale-105">
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-brand-beige flex items-center justify-center">
          <img src={image} alt={name} className="w-full h-full object-cover"/>
        </div>
      </div>
      <span className="text-sm font-medium uppercase tracking-wider text-brand-brown">{name}</span>
      
    </div>

    

  );
}

export default CategoryBox;
