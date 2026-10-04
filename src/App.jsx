import { useWallet } from "./hooks/useWallet.js";
import ClaimCard from "./components/ClaimCard.jsx";
import Footer from "./components/Footer.jsx";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Marquee from "./components/Marquee.jsx";

export default function App() {
  const wallet = useWallet();
  const wrongNetwork = Boolean(wallet.address) && !wallet.onConfiguredChain;

  return (
    <div className="page">
      <div className="grid-fade" aria-hidden="true" />
      <div className="orb orb-a" aria-hidden="true" />
      <div className="orb orb-b" aria-hidden="true" />
      <Marquee />
      <Header wrongNetwork={wrongNetwork} />
      <main className="relative z-10 mx-auto grid w-full max-w-5xl flex-1 items-center gap-10 px-5 py-6 md:grid-cols-2 md:gap-14 md:py-12">
        <Hero />
        <ClaimCard wallet={wallet} />
      </main>
      <Footer />
    </div>
  );
}
