function CategoryBox({ image, name, filterKey, isActive = false, onSelect }) {
  const key = filterKey || name;
  return (
    <div
      className="flex flex-col items-center group cursor-pointer"
      onClick={() => onSelect?.(key)}
    >
      <div
        className="p-1.5 rounded-full mb-4 transition-all duration-300"
        style={{
          border: isActive ? "2.5px solid #a44f31" : "1px solid #d1d5db",
          transform: isActive ? "scale(1.08)" : "scale(1)",
          boxShadow: isActive ? "0 0 0 4px rgba(164,79,49,0.18)" : "none",
        }}
      >
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-brand-beige flex items-center justify-center">
          <img src={image} alt={name} className="w-full h-full object-cover" />
        </div>
      </div>
      <span
        className="text-sm font-medium uppercase tracking-wider transition-colors duration-200"
        style={{ color: isActive ? "#a44f31" : "#752700", fontWeight: isActive ? "800" : "500" }}
      >
        {name}
      </span>
      {isActive && (
        <span style={{ fontSize: "10px", color: "#a44f31", marginTop: "4px", fontWeight: "700", letterSpacing: "0.5px" }}>
          ● SELECTED
        </span>
      )}
    </div>
  );
}

export default CategoryBox;

