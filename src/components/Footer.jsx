import config from "../config.js";

export default function Footer() {
  return (
    <footer className="relative z-10 mt-auto px-5 pt-8 pb-8 text-center text-sm text-white/40">
      {config.ui.footerText}
    </footer>
  );
}
