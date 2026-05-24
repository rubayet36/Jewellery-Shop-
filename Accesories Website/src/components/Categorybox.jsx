function CategoryBox({ image, name, filterKey, isActive = false, onSelect }) {
  const key = filterKey || name;
  const RUST = "#db2777";
  const BROWN = "#831843";

  return (
    <div
      className="flex flex-col items-center group cursor-pointer"
      style={{ transition: "transform 0.3s ease" }}
      onClick={() => onSelect?.(key)}
      onMouseEnter={(e) =>
        (e.currentTarget.style.transform = "translateY(-8px)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
    >
      {/* Ring border — glows on hover */}
      <div
        className="p-1.5 rounded-full mb-4"
        style={{
          background: "#fff",
          border: isActive ? `2.5px solid ${RUST}` : "1px solid #fbcfe8",
          transform: isActive ? "scale(1.08)" : "scale(1)",
          boxShadow: isActive ? `0 0 0 5px rgba(219,39,119,0.18), 0 16px 34px rgba(219,39,119,0.18)` : "0 10px 24px rgba(244,114,182,0.12)",
          transition:
            "transform 0.3s ease, box-shadow 0.3s ease, border 0.3s ease",
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.border = `2px solid ${RUST}`;
            e.currentTarget.style.boxShadow =
              "0 0 0 5px rgba(219,39,119,0.15), 0 14px 34px rgba(219,39,119,0.22)";
            e.currentTarget.style.transform = "scale(1.07)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.border = "1px solid #fbcfe8";
            e.currentTarget.style.boxShadow = "0 10px 24px rgba(244,114,182,0.12)";
            e.currentTarget.style.transform = "scale(1)";
          }
        }}
      >
        {/* Image — zooms in on hover */}
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-brand-beige flex items-center justify-center">
          <img
            src={image}
            alt={name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.5s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.12)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
        </div>
      </div>

      {/* Label */}
      <span
        className="text-sm uppercase tracking-wider"
        style={{
          color: isActive ? RUST : BROWN,
          fontWeight: isActive ? "800" : "500",
          transition:
            "color 0.2s ease, font-weight 0.2s ease, letter-spacing 0.2s ease",
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.color = RUST;
            e.currentTarget.style.fontWeight = "700";
            e.currentTarget.style.letterSpacing = "2px";
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.color = BROWN;
            e.currentTarget.style.fontWeight = "500";
            e.currentTarget.style.letterSpacing = "";
          }
        }}
      >
        {name}
      </span>

      {isActive && (
        <span
          style={{
            fontSize: "10px",
            color: RUST,
            marginTop: "4px",
            fontWeight: "700",
            letterSpacing: "0.5px",
          }}
        >
          ● SELECTED
        </span>
      )}
    </div>
  );
}

export default CategoryBox;
