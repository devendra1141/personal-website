import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';
import { ConsentBanner } from '@/components/ConsentBanner';

export default function ImmersivePage() {
  return (
    <main className="page-shell">
      <Header />
      <Hero />
      <About />
      <Contact />
      <Footer />
      <ConsentBanner />
    </main>
  );
}
