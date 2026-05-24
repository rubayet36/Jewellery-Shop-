import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";

function Footers() {
  return (
    <footer className="bg-[#db2777] text-white">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-lg font-semibold">Accessories Store</p>
            <p className="text-sm text-white/80 mt-2">
              Cute jewelry and soft-glam accessories with fast delivery.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://www.facebook.com/profile.php?id=100069402272361"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/18 hover:bg-white/28 transition-colors"
            >
              <FaFacebookF className="text-white" />
            </a>
            <a
              href="https://www.instagram.com/fame_flare_by_maria/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/18 hover:bg-white/28 transition-colors"
            >
              <FaInstagram className="text-white" />
            </a>
            <a
              href="https://www.x.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/18 hover:bg-white/28 transition-colors"
            >
              <FaTwitter className="text-white" />
            </a>
          </div>
        </div>
        <div className="mt-8 border-t border-white/20 pt-6 text-sm text-white/70 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Accessories Store. All rights reserved.</p>
          <a
            href="/admin"
            className="hover:underline opacity-65 hover:opacity-100 transition-opacity text-xs tracking-wider uppercase font-semibold flex items-center gap-1.5"
          >
            <span>🛡️</span> Admin Dashboard
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footers;
